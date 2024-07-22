import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../environments/environment";
import { Workspace } from "../workspace/workspace.interface";

@Injectable({
  providedIn: 'root',
})

export class SharedWorkspaceService {
  private endpoint = environment.apiEndpoint;

  constructor(private http: HttpClient) { }

  public getSharedWorkspaces(page: number) {
    return this.http.get<{ workspaces: Workspace[], total: number }>(
      `${this.endpoint}/api/sharedworkspace?page=${page}`,
      { withCredentials: true }
    );
  }

  public getSharedUsers(workspaceId: number) {
    return this.http.get<{ users: any[] }>(`${this.endpoint}/api/sharedworkspace/users?workspaceId=${workspaceId}`, { withCredentials: true });
  }

  public addSharedWorkspace(workspaceId: number, members: string[]) {
    return this.http.post(`${this.endpoint}/api/sharedworkspace/add`, { workspaceId, members }, { withCredentials: true });
  };

  public removeSharedUser(userId: number, workspaceId: number) {
    return this.http.delete(`${this.endpoint}/api/sharedworkspace/remove?userId=${userId}&workspaceId=${workspaceId}`, { withCredentials: true });
  }

  public findSharedWorkspacesByName(name: string, page: number) {
    return this.http.get<{workspaces: Workspace[], total: number}>(`${this.endpoint}/api/sharedworkspace?search=${name}&page=${page}`, { withCredentials: true });
  }
}