import { Server, Socket } from "socket.io";
import { SessionSocket } from "../interfaces/sessions/userSession.interface";
import {
  getFileContent,
  getYDocFromFile,
  hasPermsForFile,
  saveYDocToFile,
} from "../db/filedb.util";
import {
  createComment,
  deleteComment,
  getCommentsForFile,
} from "../db/commentdb.util";
import { applyUpdate, Doc, encodeStateAsUpdate } from "yjs";
import { fromUint8Array, toUint8Array } from "js-base64";
import {
  applyAwarenessUpdate,
  Awareness,
  encodeAwarenessUpdate,
} from "y-protocols/awareness";

const socketUpdateEvents = ["file-edit", "client-awareness-update"];
const SAVE_INTERVAL = 10;

export class YjsFileSocket {
  private documents: Map<string, Doc> = new Map();
  private documentClocks: Map<string, number> = new Map();
  private documentAwareness: Map<string, Awareness> = new Map();
  private fileSubmissions: Map<string, string> = new Map();

  constructor(private io: Server) {
    this.io = io;
  }

  /**
   * Initialize the socket server
   */
  public init(): void {
    this.io.on("connection", (socket: Socket) => {
      const sessionSocket = socket as SessionSocket;

      // When a user joins a file, check if they have permission to access it
      // If they do, initialize the socket with the document
      socket.on("join-file", async (fileId: string) => {
        if (
          await hasPermsForFile(
            parseInt(fileId),
            sessionSocket.request.session?.user.id
          )
        ) {
          await this.initSocketWithDoc(socket, fileId);
        } else {
          socket.emit(
            "error",
            "You do not have permission to access this file"
          );
        }
      });

      // When a user leaves a file, remove the socket from the room
      // and remove the file-edit listener
      socket.on("leave-file", (fileId: string) => {
        if (!socket.rooms.has(fileId)) {
          return;
        }
        socket.leave(fileId);
        for (const event of socketUpdateEvents) {
          socket.removeAllListeners(event);
        }
      });

      socket.on(
        "create-comment",
        async (content: string, relPos: string, fileId: string) => {
          if (
            await hasPermsForFile(
              parseInt(fileId),
              sessionSocket.request.session?.user.id
            )
          ) {
            this.createComment(
              content,
              relPos,
              sessionSocket.request.session?.user.id,
              parseInt(fileId)
            );
          }
        }
      );

      socket.on("delete-comment", async (commentId: number, fileId: string) => {
        if (
          await hasPermsForFile(
            parseInt(fileId),
            sessionSocket.request.session?.user.id
          )
        ) {
          this.deleteComment(commentId, parseInt(fileId));
        }
      });
    });

    // When a user leaves a room, check if the room is empty
    // If it is, save the document to the database and destroy it in memory
    this.io.of("/").adapter.on("leave-room", async (fileId, _) => {
      // If no one is left in the room, save the document to the database and destroy it in memory
      if (this.io.sockets.adapter.rooms.get(fileId)?.size === 0) {
        const doc = this.documents.get(fileId);

        if (doc) {
          // Save the document to the database
          await this.saveDoc(fileId, doc);

          // Destroy the document in memory
          doc.destroy();
          this.documents.delete(fileId);
        }

        if (this.documentClocks.has(fileId)) {
          this.documentClocks.delete(fileId);
        }
      }
    });
  }

  /**
   * Initialize the socket with the document for the given file id
   *
   * @param socket The socket to initialize
   * @param fileId The file id to initialize the socket with
   * @param submitToken The token corresponding to a submission to Judge0
   */
  private async initSocketWithDoc(
    socket: Socket,
    fileId: string,
  ): Promise<void> {
    // Get the document for the file or create a new one if it does not exist
    const doc = await this.getOrCreateDoc(fileId);

    // Join the room for the file
    socket.join(fileId);

    // When this socket sends an update, apply it to the document
    socket.on("file-edit", (update: Uint8Array) => {
      const updateArr = new Uint8Array(update);
      applyUpdate(doc, updateArr);
    });

    // When this socket sends an awareness update, apply it to the document
    socket.on("client-awareness-update", (update: Uint8Array) => {
      const updateArr = new Uint8Array(update);
      applyAwarenessUpdate(
        this.documentAwareness.get(fileId)!,
        updateArr,
        this
      );
    });

    // Initial sync of the document with the socket
    socket.emit("file-update", encodeStateAsUpdate(doc));

    // Initial sync of document awareness with the socket
    socket.emit(
      "awareness-update",
      encodeAwarenessUpdate(
        this.documentAwareness.get(fileId)!,
        Array.from(this.documentAwareness.get(fileId)!.getStates().keys())
      )
    );
  }

  /**
   * Create a new document for the given file id if it does not exist in memory
   * @param fileId the file id
   * @returns the document
   */
  private async getOrCreateDoc(fileId: string): Promise<Doc> {
    if (!this.documents.has(fileId)) {
      // Grab a document from store or initialize a new one
      const docBuffer = await getYDocFromFile(parseInt(fileId));

      let update: Uint8Array | null = null;
      if (docBuffer) {
        update = toUint8Array(docBuffer);
      }

      const doc = new Doc();
      if (update) {
        applyUpdate(doc, update);
      } else {
        this.initDoc(doc, fileId);
      }

      // Store the document in memory
      this.documents.set(fileId, doc);

      // Store the clock of the document
      this.documentClocks.set(fileId, 0);

      // When the document updates, send the update to all sockets in its room
      doc.on("update", async () => {
        await this.tick(fileId);
        this.io.to(fileId).emit("file-update", encodeStateAsUpdate(doc));
      });

      // Initialize awareness for this document
      const awareness = new Awareness(doc);
      awareness.on(
        "update",
        ({
          added,
          updated,
          removed,
        }: {
          added: any[];
          updated: any[];
          removed: any[];
        }) => {
          const changedClients = added.concat(updated).concat(removed);
          this.io
            .to(fileId)
            .emit(
              "awareness-update",
              encodeAwarenessUpdate(awareness, changedClients)
            );
        }
      );
      this.documentAwareness.set(fileId, awareness);
    }
    return this.documents.get(fileId)!;
  }

  /**
   * Create a comment for the given file
   * @param content the content of the comment
   * @param relPos the relative position of the comment
   * @param userId the id of the user creating the comment
   * @param fileId the id of the file the comment is on
   */
  private async createComment(
    content: string,
    relPos: string,
    userId: number,
    fileId: number
  ) {
    const doc = this.documents.get(fileId.toString());
    if (!doc) {
      return;
    }

    // Save the comment to the database
    let comment = await createComment(content, relPos, userId, fileId);
    const comments = doc.getArray("comments");
    comments.push([comment]);

    // Save the document to the database
    await this.saveDoc(fileId.toString(), doc);
  }

  /**
   * Delete a comment for the given file
   * @param commentId the id of the comment to delete
   * @param fileId the id of the file the comment is on
   */
  private async deleteComment(commentId: number, fileId: number) {
    const doc = this.documents.get(fileId.toString());
    if (!doc) {
      return;
    }

    // Delete the comment from the database
    await deleteComment(commentId);

    const comments = doc.getArray("comments");
    const commentIndex = comments
      .toArray()
      .findIndex((comment: any) => comment.id === commentId);
    if (commentIndex !== -1) {
      comments.delete(commentIndex, 1);
    }

    // Save the document to the database
    await this.saveDoc(fileId.toString(), doc);
  }

  /**
   * Maps a file id to a submission token
   * @param fileId the id of the file
   * @param token the token of the submission
   * @returns true if the submission was set, false otherwise
   */
  public setSubmission(fileId: string, token: string): boolean {
    if (!this.fileSubmissions.has(fileId)) {
      this.fileSubmissions.set(fileId, token);
      this.io.to(fileId).emit('submit-code');
      return true;
    }
    return false;
  }

  /**
   * Checks if a submission exists for a file id
   * @param fileId the id of the file
   * @returns true if a submission exists, false otherwise
   */
  public hasSubmission(fileId: string): boolean {
    return this.fileSubmissions.has(fileId);
  }

  public broadcastSubmission(fileId: string, token: string, stdin: string, stdout: string, stderr: string, exit_code: number, success: boolean): void {
    if (this.fileSubmissions.get(fileId) === token) {
      this.io.to(fileId).emit("submission-result", { stdin: stdin, stdout: stdout, stderr: stderr, exit_code: exit_code, success: success });
      this.fileSubmissions.delete(fileId);
    }
  }


  private async initDoc(doc: Doc, fileId: string): Promise<void> {
    const text = doc.getText("content");
    const comments = doc.getArray("comments");
    text.insert(0, (await getFileContent(parseInt(fileId))) ?? "");
    comments.push((await getCommentsForFile(parseInt(fileId))) ?? []);
  }

  /**
   * Track the number of updates to a document and save it to the database every 10 updates
   * @param fileId the file id
   */
  private async tick (fileId: string) {
    const doc = this.documents.get(fileId);
    if (!doc) {
      return;
    }
    const clock = this.documentClocks.get(fileId);
    if (clock === undefined) {
      return;
    }
    
    this.documentClocks.set(fileId, clock + 1);
    if (clock % SAVE_INTERVAL === 0) {
      await this.saveDoc(fileId, doc);
    }
  }

  /**
   * Write the document with file id to the database
   * @param fileId The file id
   * @param doc The document to save
   */
  private async saveDoc(fileId: string, doc: Doc) {
    const update = encodeStateAsUpdate(doc);
    const base64Encoded = fromUint8Array(update);
    await saveYDocToFile(parseInt(fileId), base64Encoded);
  }
}
