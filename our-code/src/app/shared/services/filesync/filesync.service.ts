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
      console.log('file-update');
      const updateArr = new Uint8Array(update);
      applyUpdate(this.doc, updateArr);
    });
    this.doc.on('update', () => {
      this.socket.emit('file-edit', encodeStateAsUpdate(this.doc));
    });
  }

  /**
   * create a relative position for a comment
   * 
   * @param offset the offset of the comment
   */
  public addRelativePosition(offset: any) {
    console.log(this.doc.getText('content'));
    let relativePos = createRelativePositionFromTypeIndex(this.doc.getText('content'), offset);
    console.log(relativePos);
    const encodedRelPos = JSON.stringify(relativePos);
    console.log(encodedRelPos);
    return encodedRelPos;
  }

  /**
   * decode a relative position for a comment
   * 
   * @param encodedRelPos the encoded relative position
   */
  public decodeRelativePosition(encodedRelPos: any,) {
    const parsedRelPos = JSON.parse(encodedRelPos);
    const absPos = createAbsolutePositionFromRelativePosition(parsedRelPos, this.doc);
    console.log(absPos);
    return absPos;
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
