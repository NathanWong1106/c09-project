import { Injectable } from '@angular/core';
import io from 'socket.io-client';
import { applyUpdate, Doc, encodeStateAsUpdate, createRelativePositionFromTypeIndex, createAbsolutePositionFromRelativePosition } from 'yjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FileSyncService {
  private socket = io(environment.apiEndpoint, {
    withCredentials: true,
  });

  public doc: Doc = new Doc();

  constructor() {}

  /**
   * Tell the server that the user is joining the file.
   * Adds event listeners for file updates and user edits.
   * 
   * @param fileId the file id
   */
  public joinFile(fileId: string) {
    this.socket.emit('join-file', fileId);
    this.socket.on('file-update', (update: Uint8Array) => {
      const updateArr = new Uint8Array(update);
      applyUpdate(this.doc, updateArr);
    });
    this.doc.on('update', () => {
      this.socket.emit('file-edit', encodeStateAsUpdate(this.doc));
    });
  }

  /**
   * Create a comment for the given file
   * @param content the content of the comment
   * @param offset the offset of the comment
   * @param userId the id of the user creating the comment
   * @param fileId the id of the file the comment is on
   */
  public createComment(content: string, relPos: any, fileId: string) {
    const encodedRelPos = JSON.stringify(relPos)
    this.socket.emit('create-comment', content, encodedRelPos, fileId);
  }

  /**
   * Delete a comment for the given file
   * @param commentId the id of the comment
   */
  public deleteComment(commentId: number, fileId: string) {
    this.socket.emit('delete-comment', commentId, fileId);
  }

  /**
   * Get comments for the given file
   * @param fileId the id of the file
   */
  public getComments(fileId: number) {
    this.socket.emit('get-comments', fileId);
  }

  /**
   * @param {monaco.editor.IStandaloneCodeEditor} editor
   * @param {monaco.editor.ITextModel} monacoModel
   * @param {Y.Text} type
   */
  public createRelativePosFromMonacoPos(editor: any, monacoModel: any) {
    const relPos = createRelativePositionFromTypeIndex(this.doc.getText('content'), monacoModel.getOffsetAt(editor.getPosition()))
    return relPos
  }

  /**
   * 
   * @param editor 
   * @param type 
   * @param relPos 
   * @param doc 
   * @returns 
   */
  public createMonacoPosFromRelativePos(editor: any, relPos: any) {
    console.log(editor.getModel().getValue())
    const decodedRelPos = JSON.parse(relPos)
    const absPos = createAbsolutePositionFromRelativePosition(decodedRelPos, this.doc)
    if (absPos !== null && absPos.type === this.doc.getText('content')) {
      const model = editor.getModel()
      const pos = model.getPositionAt(absPos.index)
      return pos
    }
    return null
  }

  /**
   * Tell the server that the user is leaving the file.
   * Will destroy the current document and create a new one.
   * 
   * @param fileId the file id
   */
  public leaveFile(fileId: string) {
    this.socket.emit('leave-file', fileId);
    this.socket.removeAllListeners('file-update');
    this.doc.destroy();
    this.doc = new Doc();
  }

  /**
   * Provide a callback function to call when an error occurs
   * @param callback callback fn to call when an error occurs
   */
  public onError(callback: (error: string) => void) {
    this.socket.on('error', callback);
  }
}
