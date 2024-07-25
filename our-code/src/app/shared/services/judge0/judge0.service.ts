import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import io from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})

export class Judge0Service {
  private endpoint = "https://ce.judge0.com";
  private socket = io(environment.apiEndpoint, {
    withCredentials: true,
  });

  constructor(private http: HttpClient) {}

  checkJudge0Auth() {
    // check if auth is valid
    return this.http.get(
      this.endpoint +`/authenticate`,
      {
        withCredentials: true,
      },
    );
  }

  broadcastSubmission(fileId: number) {
    // Emit through socket
    this.socket.emit('submit-code', fileId);
  }

  
  submitCode(fileId: number, code: string, languageId: number, stdin: string) {
    // submit code
    return this.http.post(
      this.endpoint + `/submissions?base64_encoded=false&wait=false`,
      {
        source_code: code,
        language_id: languageId,
        stdin: stdin,
        callback_url: `${environment.apiEndpoint}/api/judge0/callback/${fileId}`,
      },
      {
        withCredentials: true,
      },
    );
  }
}