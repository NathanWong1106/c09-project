import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../environments/environment";

@Injectable({
  providedIn: 'root',
})

export class CommentService {
	private endpoint = environment.apiEndpoint;

  constructor(private http: HttpClient) { }

	public createComment(comment: string, relPos: string, fileId: string) {
		return this.http.post(
			`${this.endpoint}/api/comment?fileId=${fileId}`,
			{ content: comment, relPos },
			{ withCredentials: true }
		);
	}

	public deleteComment(commentId: number, fileId: string) {
		return this.http.delete(
			`${this.endpoint}/api/comment?commentId=${commentId}&fileId=${fileId}`,
			{ withCredentials: true }
		);
	}
}