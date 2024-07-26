import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import io from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})

export class Judge0Service {
  private endpoint = environment.apiEndpoint;
  private socket = io(environment.apiEndpoint, {
    withCredentials: true,
  });

  constructor(private http: HttpClient) {}
  
  submitCode(fileId: number, code: string, languageId: number, stdin: string) {
    return this.http.post(
      `${this.endpoint}/api/judge0/${fileId}/submit`,
      {
        fileId,
        code,
        languageId,
        stdin 
      },
      {
        withCredentials: true,
      }
    );
  }
}