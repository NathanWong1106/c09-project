import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  private endpoint = environment.apiEndpoint;

  constructor(private http: HttpClient) {}

  getContentForFolder(workspaceId: number, parentId?: number) {
    // Get root level
    if (!parentId) {
      parentId = 0;
    }
    return this.http.get(
      this.endpoint + `/api/fs?workspaceId=${workspaceId}&parentId=${parentId}`,
      {
        withCredentials: true,
      },
    );
  }

  getFolderById(id: number) {
    return this.http.get(this.endpoint + `/api/fs/folder?folderId=${id}`, {
      withCredentials: true,
    });
  }

  getFileById(id: number) {
    return this.http.get(this.endpoint + `/api/fs/file?fileId=${id}`, {
      withCredentials: true,
    });
  }

  addItem(workspaceId: number, name: string, type: string, parentId: number) {
    return this.http.post(
      this.endpoint + `/api/fs?workspaceId=${workspaceId}&parentId=${parentId}`,
      {
        name: name,
        type: type,
      },
      {
        withCredentials: true,
      },
    );
  }

  deleteItem(itemId: number, type: string, workspaceId: number) {
    return this.http.delete(
      this.endpoint + `/api/fs?itemId=${itemId}&type=${type}&workspaceId=${workspaceId}`,
      {
        withCredentials: true,
      },
    );
  }
}
