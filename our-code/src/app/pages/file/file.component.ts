import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { FileSyncService } from '../../shared/services/filesync/filesync.service';
import { 
  createRelativePosFromMonacoPos,
  createMonacoPosFromRelativePos,
} from '../../shared/utils/monaco.utils';
import { CommentLikesService } from '../../shared/services/comments/commentslikes.service';
import { CommentService } from '../../shared/services/comments/comments.service';
import { ActivatedRoute } from '@angular/router';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { FormsModule } from '@angular/forms';
import { MenubarModule } from 'primeng/menubar';
import { MonacoBinding } from 'y-monaco';
import { MessageService } from 'primeng/api';
import { MessagesModule } from 'primeng/messages';
import { SplitterModule } from 'primeng/splitter';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FileService } from '../../shared/services/file-sys/file-sys.service';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { Collaborator } from '../../shared/services/filesync/filesync.interface';
import { injectStyleforComments } from '../../shared/utils/monaco.utils';
import uniqolor from 'uniqolor';

@Component({
  selector: 'app-file',
  standalone: true,
  imports: [
    MonacoEditorModule,
    FormsModule, 
    MessagesModule, 
    SplitterModule, 
    DialogModule, 
    ButtonModule,
    InputTextModule,
    MenubarModule,
    AvatarModule,
    AvatarGroupModule,
    OverlayPanelModule,
  ],
  templateUrl: './file.component.html',
  styleUrl: './file.component.css',
})
export class FileComponent implements OnInit, OnDestroy {
  editorOptions = { theme: 'vs-dark',  language: 'python', automaticLayout: true};
  code: string = 'print("Hello World!")';
  binding!: MonacoBinding;
  hasPerms: boolean = true;
  comment: string = '';
  visibleCreateComments: boolean = false;
  viewZones: any[] = [];  
  relPos: any;
  overlays: any[] = [];
  firstUpdate: boolean = false;
  monacoLoaded: boolean = false;
  fileName: string = '';
  collaborators: Collaborator[] = [];

  constructor(
    private fileSyncService: FileSyncService,
    private activatedRoute: ActivatedRoute,
    private messageService: MessageService,
    private commentLikesService: CommentLikesService,
    private ngZone: NgZone,
    private fileService: FileService,
    private commentService: CommentService
  ) {}

  ngOnInit(): void {
    this.fileService.getFileById(this.activatedRoute.snapshot.params['id']).subscribe({
      next: (res: any) => {
        this.fileName = res.name;
      },
      error: (err) => {
        console.log(err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: "Can't get file" });
      },
    });
    this.fileSyncService.onError((error: string) => {
      this.hasPerms = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: error,
      });
    });

    this.fileSyncService.joinFile(this.activatedRoute.snapshot.params['id'], this.presenceUpdate.bind(this));
    window.addEventListener('beforeunload', () => {
      this.fileSyncService.leaveFile(this.activatedRoute.snapshot.params['id']);
    });
  }

  presenceUpdate(collaborators: Collaborator[]) {
    this.collaborators = collaborators;
  }

  getColorForCollaborator(collaborator: Collaborator) {
    return uniqolor(collaborator.awarenessClientId, {
      lightness: 60,
      saturation: 60,
    }).color;
  }

  showCreateComments(ed: any) {
    this.visibleCreateComments = true;
    let pos = ed.getPosition();
    pos.column = ed.getModel().getLineMaxColumn(pos.lineNumber);
    this.relPos = createRelativePosFromMonacoPos(ed, pos, this.fileSyncService.doc);
  }

  onEditorInit(editor: any) {
    injectStyleforComments();

    this.binding = new MonacoBinding(
      this.fileSyncService.doc.getText('content'),
      editor.getModel(),
      new Set([editor]),
      this.fileSyncService.awareness,
    )
    this.loadComments(editor);

    this.binding.monacoModel.onDidChangeContent(() => {
      this.loadComments(editor);
    });

    const commentArray = this.fileSyncService.doc.getArray('comments')
    commentArray.observe(() => {
      if (!this.firstUpdate) {
        this.firstUpdate = true;
      }
      this.loadComments(editor);
    });

    editor.addAction({
      id: "comment",
      label: "Add a Comment",
      
      contextMenuGroupId: 'navigation',
      contextMenuOrder: 1,
      
      run: (ed: any) =>  this.ngZone.run(() => this.showCreateComments(ed))
    });
  }

  loadComments(editor: any) {
    const comments = this.fileSyncService.doc.getArray('comments').toArray();
    // Remove all viewZones
    editor.changeViewZones((changeAccessor: any) => {
      for (let i = 0; i < this.viewZones.length; i++) {
        changeAccessor.removeZone(this.viewZones[i]);
      }
    });
    
    // Remove all overlayWidgets
    for (let i = 0; i < this.overlays.length; i++) {
      editor.removeOverlayWidget(this.overlays[i]);
    }
    comments.forEach((comment: any) => {
      let overlayDomNode = this.createCommentElement(comment);
      // Making Monaco viewZones interactable: https://stackoverflow.com/questions/59081613/how-do-you-process-input-events-from-an-iviewzone-in-the-monaco-editor
      let overlayWidget = {
        getId: () => comment.id,
        getDomNode: () => overlayDomNode,
        getPosition: () => null
      };
    
      editor.addOverlayWidget(overlayWidget);
      let absPos = createMonacoPosFromRelativePos(editor, comment.relPos, this.fileSyncService.doc);
    
      let viewZoneId: number | null = null;
      editor.changeViewZones((changeAccessor: any) => {
        let domNode = document.createElement('div');
        viewZoneId = changeAccessor.addZone({
          afterLineNumber: absPos.lineNumber,
          heightInLines: 5,
          domNode: domNode,
          onDomNodeTop: (top: string) => {
            overlayDomNode.style.top = top + 'px';
          },
          onComputedHeight: (height: number) => {
            overlayDomNode.style.height = height + 'px';
          }
        });
        overlayDomNode.querySelector('#deleteButton' + comment.id)?.addEventListener('click', () => {
          editor.changeViewZones((changeAccessor: any) => {
            changeAccessor.removeZone(viewZoneId);
          });
          editor.removeOverlayWidget(overlayWidget);
          let index = this.fileSyncService.doc.getArray('comments').toArray().indexOf(comment);
          this.fileSyncService.doc.getArray('comments').delete(index, 1);
  
          this.commentService.deleteComment(comment.id, this.activatedRoute.snapshot.params['id']).subscribe({
            next: () => {
              this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Comment deleted' });
            },
            error: (err) => {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not delete comment' });
            }
          });
        });
  
        overlayDomNode.querySelector('#likeButton' + comment.id)?.addEventListener('click', async () => {
          this.commentLikesService.likeComment(comment.id, this.activatedRoute.snapshot.params['id']).subscribe({
            error: (err) => {
              this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'You already disliked this comment' });
            }
          });
        });
  
        overlayDomNode.querySelector('#dislikeButton' + comment.id)?.addEventListener('click', () => {
          this.commentLikesService.dislikeComment(comment.id, this.activatedRoute.snapshot.params['id']).subscribe({
            error: (err) => {
              this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'You already liked this comment' });
            }
          });
        });
        
        this.overlays.push(overlayWidget);
        this.viewZones.push(viewZoneId);
      });

      this.commentLikesService.getCommentLikesAndDislikes(comment.id, this.activatedRoute.snapshot.params['id']).subscribe((res) => {
        comment.likes = res.likes;
        comment.dislikes = res.dislikes;
      });
    });    
  }
  
  addComment(content: string) {
    const encodedRelPos = JSON.stringify(this.relPos);

    this.commentService.createComment(content, encodedRelPos, this.activatedRoute.snapshot.params['id']).subscribe({
      next: (res) => {
        this.comment = '';
        this.visibleCreateComments = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.fileSyncService.leaveFile(this.activatedRoute.snapshot.params['id']);
  }

  createCommentElement(comment: any) {
    let commentElement = document.createElement('div');

    commentElement.innerHTML = `
      <div class="comment row">
        <div class="col-11 user-content">
          <span id="userEmail${comment.id}" class="comment-email"></span>
          <div id="content${comment.id}" class="comment-content"></div>
        </div>
        <div class="col-1 button-col">
          <div class="end">
            <button id="deleteButton${comment.id}" class="delete button" id="deleteButton">&times;</button>
          </div>
          <div class="button-row">
            <div>
              <button id="likeButton${comment.id}" class="like button" id="likeButton">&#8679;</button>
              <span id="likeCount${comment.id}" class="count">${comment.likes}</span>
            </div>
            <div>
            <button id="dislikeButton${comment.id}" class="dislike button" id="dislikeButton">&#8681;</button>
            <span id="dislikeCount${comment.id}" class="count">${comment.dislikes}</span>
            </div>
          </div>
        </div>
      </div>
    `;

    // Sanitize the username and content
    const userNameElement = commentElement.querySelector(`#userEmail${comment.id}`);
    userNameElement!.textContent = comment.user.email;

    const contentElement = commentElement.querySelector(`#content${comment.id}`);
    contentElement!.textContent = comment.content;
     
    return commentElement;
  }
}
