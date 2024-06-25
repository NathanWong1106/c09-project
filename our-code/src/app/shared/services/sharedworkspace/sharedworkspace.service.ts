import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../environments/environment";
import { Workspace } from "../workspace/workspace.interface";
import { AuthService } from "../auth/auth.service";
import { switchMap, of, throwError } from "rxjs";
import { map, catchError } from "rxjs/operators";

@Injectable({
  providedIn: 'root',
})

export class SharedWorkspaceService {
  private endpoint = environment.apiEndpoint;

  constructor(private http: HttpClient, private authService: AuthService) { }

  public getSharedWorkspaces(page: number) {
    return this.authService.user$.pipe(
      switchMap((user) => {
        if (!user) {
          return throwError(() => new Error('User not authenticated'));
        }
        return this.http.get<{ workspaces: Workspace[] }>(
          `${this.endpoint}/api/sharedworkspace?page=${page}`,
          { withCredentials: true }
        ).pipe(
          map((response: { workspaces: Workspace[] }) => response.workspaces),
          catchError(error => {
            console.error('Error fetching shared workspaces', error);
            return of([]);
          })
        );
      })
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

  public findSharedWorkspaceByName(name: string) {
    return this.http.get<Workspace>(`${this.endpoint}/api/sharedworkspace/search?name=${name}`, { withCredentials: true });
  }
}