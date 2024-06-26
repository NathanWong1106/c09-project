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
    null,
  );
  private isAuth: boolean = false;
  public user$: Observable<User | null> = this.user.asObservable();

  constructor(private http: HttpClient) {
    this.me().subscribe({
      next: (response) => {
        this.isAuth = true;
        console.log(this.isAuth);
        this.user.next(response.user);
      },
      error: (error) => {
        this.isAuth = false;
        this.user.next(null);
      },
    });
  }

  public login(token: string) {
    this.doLogin(token).subscribe(
      (response) => {
        this.me().subscribe((response) => {
          this.isAuth = true;
          this.user.next(response.user);
        });
      },
      (error) => {
        this.isAuth = false;
        console.error(error);
      },
    );
  }

  public logout() {
    this.doLogout().subscribe(
      (response) => {
        this.isAuth = false;
        this.user.next(null);
      },
      (error) => {
        console.error(error);
      },
    );
  }

  public isAuthenticated(): boolean {
    return this.isAuth;
  }

  public me(): Observable<{ user: User }> {
    return this.http.get<{ user: User }>(`${this.endpoint}/auth/me`, {
      withCredentials: true,
    });
  }

  private doLogin(token: string): Observable<any> {
    return this.http.post<any>(
      `${this.endpoint}/auth/login`,
      {
        token,
      },
      {
        withCredentials: true,
      },
    );
  }

  private doLogout(): Observable<any> {
    return this.http.post<any>(`${this.endpoint}/auth/logout`, null, {
      withCredentials: true,
    });
  }
}
