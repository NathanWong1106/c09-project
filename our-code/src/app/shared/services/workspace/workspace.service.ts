import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../environments/environment";
import { Workspace } from "./workspace.interface";
import { AuthService } from "../auth/auth.service";
import { switchMap, of, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";

@Injectable({
  providedIn: 'root',
})

export class WorkspaceService {
  private endpoint = environment.apiEndpoint;

  constructor(private http: HttpClient, private authService: AuthService) { }

  public getMyWorkspaces(page: number) {
    return this.authService.user$.pipe(
      switchMap((user) => {
        if (!user) {
          return throwError(() => new Error('User not authenticated'));
        }
        return this.http.get<{ workspaces: Workspace[], total: number }>(
          `${this.endpoint}/api/workspace?page=${page}`, 
          { withCredentials: true }
        );
      })
    );
  }

  public createWorkspace(name: string) {
    return this.authService.user$.pipe(
      switchMap((user) => {
        return this.http.post<Workspace>(`${this.endpoint}/api/workspace`, { name, owner: user?.id }, { withCredentials: true });
      })
    );
  }

  public findWorkspaceByName(name: string, page: number) {
    return this.http.get<{workspace: Workspace[], total: number}>(`${this.endpoint}/api/workspace/search?name=${name}&page=${page}`, { withCredentials: true });
  }

  public editWorkspace(workspaceId: number, name: string) {
    return this.http.patch(`${this.endpoint}/api/workspace/edit/${workspaceId}`, { name }, { withCredentials: true });
  }

  public deleteWorkspace(id: number) {
    return this.http.delete(`${this.endpoint}/api/workspace/${id}`, { withCredentials: true });
  }
}