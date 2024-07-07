import { Server, Socket } from "socket.io";
import { SessionSocket } from "../interfaces/sessions/userSession.interface";
import {
  getFileComments,
  getFileContent,
  hasPermsForFile,
  writeToFile,
} from "../db/filedb.util";
import { applyUpdate, Doc, encodeStateAsUpdate } from "yjs";

export class YjsFileSocket {
  private documents: Map<string, Doc> = new Map();

  constructor(private io: Server) {
    this.io = io;
  }

  /**
   * Initialize the socket server
   */
  public init(): void {
    this.io.on("connection", (socket: Socket) => {

      // When a user joins a file, check if they have permission to access it
      // If they do, initialize the socket with the document
      socket.on("join-file", async (fileId: string) => {
        if (
          await hasPermsForFile(
            parseInt(fileId),
            (socket as SessionSocket).request.session?.user.id
          )
        ) {
          this.initSocketWithDoc(socket, fileId);
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
        socket.removeAllListeners("file-edit");
      });
    });

    // When a user leaves a room, check if the room is empty
    // If it is, save the document to the database and destroy it in memory
    this.io.of("/").adapter.on("leave-room", (fileId, _) => {
      // If no one is left in the room, save the document to the database and destroy it in memory
      if (this.io.sockets.adapter.rooms.get(fileId)?.size === 0) {
        const doc = this.documents.get(fileId);

        if (doc) {
          const text = doc.getText("content");
          const content = text.toString();

          // TODO: Save comments to the database
          const comments = doc.getArray("comments");

          // Save the document to the database
          writeToFile(parseInt(fileId), content);

          // Destroy the document in memory
          doc.destroy();
          this.documents.delete(fileId);
        }
      }
    });
  }

  /**
   * Initialize the socket with the document for the given file id
   * 
   * @param socket The socket to initialize
   * @param fileId The file id to initialize the socket with
   */
  private async initSocketWithDoc(
    socket: Socket,
    fileId: string
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

    // Sync the document with the socket
    socket.emit("file-update", encodeStateAsUpdate(doc));
  }

  /**
   * Create a new document for the given file id if it does not exist in memory
   * @param fileId the file id
   * @returns the document
   */
  private async getOrCreateDoc(fileId: string): Promise<Doc> {
    if (!this.documents.has(fileId)) {
      // Create a new document and initialize it with the file's content
      const doc = new Doc();
      await this.initDoc(doc, fileId);

      // Store the document in memory
      this.documents.set(fileId, doc);

      // When the document updates, send the update to all sockets in its room
      doc.on("update", () => {
        this.io.to(fileId).emit("file-update", encodeStateAsUpdate(doc));
      });
    }
    return this.documents.get(fileId)!;
  }

  private async initDoc(doc: Doc, fileId: string): Promise<void> {
    const text = doc.getText("content");
    const comments = doc.getArray("comments");
    text.insert(0, (await getFileContent(parseInt(fileId))) ?? "");

    // TODO: Initialize comments with defined interface
    comments.push((await getFileComments(parseInt(fileId))) ?? []);
  }
}

export const setupIo = (io: Server) => {
  new YjsFileSocket(io).init();
};
