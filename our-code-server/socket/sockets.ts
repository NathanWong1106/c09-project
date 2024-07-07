import { Server, Socket } from "socket.io";
import { SessionSocket } from "../interfaces/sessions/userSession.interface";
import {
  getFileComments,
  getFileContent,
  hasPermsForFile,
} from "../db/filedb.util";
import { applyUpdate, Doc, encodeStateAsUpdate, Text } from "yjs";

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
      socket.on("join-file", async (fileId: string) => {
        if (
          await hasPermsForFile(
            parseInt(fileId),
            (socket as SessionSocket).request.session?.user.id
          )
        ) {
          // Get the document for the file
          const doc = await this.getDoc(fileId);

          // Join the room for the file
          socket.join(fileId);

          // When the document is updated, send the update to this socket
          doc.on("update", (update: Uint8Array, _) => {
            socket.emit("file-update", update);
          });

          // When this socket sends an update, apply it to the document and broadcast it to all other sockets
          socket.on("file-edit", (update: Uint8Array) => {
            applyUpdate(doc, update);
            socket.to(fileId).emit("file-update", update);
          });
        } else {
          socket.emit(
            "error",
            "You do not have permission to access this file"
          );
        }
      });
    });
  }

  /**
   * Create a new document for the given file id if it does not exist in memory
   * @param fileId the file id
   * @returns the document
   */
  private async getDoc(fileId: string): Promise<Doc> {
    if (!this.documents.has(fileId)) {
      const doc = new Doc();
      const text = doc.getText("content");
      const comments = doc.getArray("comments");
      text.insert(0, (await getFileContent(parseInt(fileId))) ?? "");
      comments.push((await getFileComments(parseInt(fileId))) ?? []);
      this.documents.set(fileId, doc);
    }
    return this.documents.get(fileId)!;
  }

}

export const setupIo = (io: Server) => {
  new YjsFileSocket(io).init();
};
