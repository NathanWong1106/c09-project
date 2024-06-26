import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  private endpoint = environment.apiEndpoint;

  constructor(private http: HttpClient) {}

  getCurrentFilesys(workspaceId: number, parentId?: number) {
    // Get root level
    if (!parentId) {
      parentId = 0;
    }
    return this.http.get(this.endpoint + `/api/fs?workspaceId=${workspaceId}&parentId=${parentId}`, {
      withCredentials: true,
    });
  }

  getFolderByName(workspaceId: number, folderName: string) {
    return this.http.get(this.endpoint + `/api/fs/folder?workspaceId=${workspaceId}&folderName=${folderName}`, {
      withCredentials: true,
    });
  }

  addItem(workspaceId: number, name: string, type: string, parentId: number) {
    return this.http.post(this.endpoint + `/api/fs?workspaceId=${workspaceId}&parentId=${parentId}`, {
      name: name,
      type: type,
    },
    {
      withCredentials: true,
    });
  }

  deleteItem(workspaceId: number, id: number, type: string) {
    return this.http.delete(this.endpoint + `/api/fs?workspaceId=${workspaceId}&type=${type}&id=${id}`, {
      withCredentials: true,
    });
  }
}
