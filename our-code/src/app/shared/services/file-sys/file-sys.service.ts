import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  private endpoint = environment.apiEndpoint;

  constructor(private http: HttpClient) {}

  getFileSys() {
    return this.http.get(this.endpoint + `/workspaces/:wid/fs`, {
      withCredentials: true,
    });
  }

  addFile(name: string, type: string, parentId: number) {
    return this.http.post(this.endpoint + `/workspaces/:wid/fs?parentId=${parentId}`, {
      name: name,
      type: type,
    },
    {
      withCredentials: true,
    });
  }

  deleteFile(id: number) {
    return this.http.delete(this.endpoint + `/workspaces/:wid/fs?id=${id}`, {
      withCredentials: true,
    });
  }
}
