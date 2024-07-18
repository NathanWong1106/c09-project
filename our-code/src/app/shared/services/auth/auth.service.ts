import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { User } from './auth.interface';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private endpoint = environment.apiEndpoint;

  private user: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(
    null
  );
  private isAuth: boolean = false;

  private isLoggingOut: boolean = false;

  private DEFAULT_REDIRECT_URL: string = '/workspaces';
  private redirectUrl: string = this.DEFAULT_REDIRECT_URL;

  public user$: Observable<User | null> = this.user.asObservable();

  constructor(private http: HttpClient) {}

  public login(token: string): Observable<boolean> {
    return new Observable((observer) => {
      this.doLogin(token).subscribe({
        next: (response) => {
          this.me().subscribe((response) => {
            this.isAuth = true;
            this.user.next(response.user);
            observer.next(true);
          });
        },
        error: (error) => {
          this.isAuth = false;
          console.error(error);
          observer.next(false);
        },
      });
    });
  }

  public logout(): Observable<boolean> {
    return new Observable((observer) => {
      this.isLoggingOut = true;
      this.doLogout().subscribe({
        next: (response) => {
          this.isLoggingOut = false;
          this.isAuth = false;
          this.user.next(null);
          this.redirectUrl = this.DEFAULT_REDIRECT_URL;
          observer.next(true);
        },
        error: (error) => {
          this.isLoggingOut = false;
          console.error(error);
          observer.next(false);
        },
      });
    });
  }

  public isAuthenticated(): boolean {
    return this.isAuth;
  }

  public prepareLogOut(): void {
    this.isLoggingOut = true;
  }

  public me(): Observable<{ user: User }> {
    return this.http.get<{ user: User }>(`${this.endpoint}/auth/me`, {
      withCredentials: true,
    });
  }

  /**
   * Check if the user is authenticated by calling the /auth/me endpoint
   * If the user has already been authenticated, does not make the request again.
   *
   * @returns Observable<boolean>
   */
  public checkAuth(): Observable<boolean> {
    if (this.isLoggingOut) {
      return new Observable((observer) => {
        observer.next(false);
      });
    }
    if (this.isAuth) {
      return new Observable((observer) => {
        observer.next(true);
      });
    } else {
      return new Observable((observer) => {
        this.me().subscribe({
          next: (response) => {
            this.isAuth = true;
            this.user.next(response.user);
            observer.next(true);
          },
          error: (error) => {
            this.isAuth = false;
            this.user.next(null);
            observer.next(false);
          },
        });
      });
    }
  }

  public getRedirectUrl(): string {
    return this.redirectUrl;
  }

  public setRedirectUrl(url: string): void {
    this.redirectUrl = url;
  }

  private doLogin(token: string): Observable<any> {
    return this.http.post<any>(
      `${this.endpoint}/auth/login`,
      {
        token,
      },
      {
        withCredentials: true,
      }
    );
  }

  private doLogout(): Observable<any> {
    return this.http.post<any>(`${this.endpoint}/auth/logout`, null, {
      withCredentials: true,
    });
  }
}
