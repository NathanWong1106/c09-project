import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { User } from './auth.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private endpoint = environment.apiEndpoint;

  constructor(private http: HttpClient) {}

  me(): Observable<{ user: User }> {
    return this.http.get<{ user: User }>(`${this.endpoint}/auth/me`, {
      withCredentials: true,
    });
  }

  login(token: string): Observable<any> {
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

  logout(): Observable<any> {
    return this.http.post<any>(`${this.endpoint}/auth/logout`, null, {
      withCredentials: true,
    });
  }
}
