import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../environments/environment";

@Injectable({
  providedIn: 'root',
})

export class CommentLikesService {
  private endpoint = environment.apiEndpoint;

  constructor(private http: HttpClient) { }

  public getCommentLikesAndDislikes(commentId: number, fileId: string) {
    return this.http.get<{ likes: number, dislikes: number }>(
      `${this.endpoint}/api/comment/impression?commentId=${commentId}&fileId=${fileId}`,
      { withCredentials: true }
    );
  }

  public likeComment(commentId: number, fileId: string) {
    return this.http.post(
      `${this.endpoint}/api/comment/like?commentId=${commentId}&fileId=${fileId}`, null,
      { withCredentials: true }
    );
  }

  public dislikeComment(commentId: number, fileId: string) {
    return this.http.post(
      `${this.endpoint}/api/comment/dislike?commentId=${commentId}&fileId=${fileId}`, null,
      { withCredentials: true }
    );
  }
}
