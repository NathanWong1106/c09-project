import { Injectable } from '@angular/core';
import io from 'socket.io-client';
import { applyUpdate, Doc } from 'yjs';

@Injectable({
  providedIn: 'root',
})
export class FileSyncService {
  private socket = io('http://localhost:3000', {
    withCredentials: true,
  });

  public doc: Doc = new Doc();

  constructor() {}

  public joinFile(fileId: string) {
    this.socket.emit('join-file', fileId);
    this.socket.on('file-update', (update: Uint8Array) => {
      console.log('Received update');
      applyUpdate(this.doc, update);
    });
    this.doc.on('update', (update: Uint8Array, _) => {
      this.socket.emit('file-edit', update);
    });
  }
}
