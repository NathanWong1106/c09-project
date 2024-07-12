import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { FileSyncService } from '../../shared/services/filesync/filesync.service';
import { ActivatedRoute } from '@angular/router';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { FormsModule } from '@angular/forms';
import { MonacoBinding } from 'y-monaco';
import { MessageService } from 'primeng/api';
import { MessagesModule } from 'primeng/messages';
import { SplitterModule } from 'primeng/splitter';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

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
    InputTextModule
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
  currentOffset: number = 0;
  visibleCreateComments: boolean = false;
  viewZones: any[] = [];  
  relPos: any;
  overlays: any[] = [];
  firstUpdate: boolean = false;
  monacoLoaded: boolean = false;

  constructor(
    private fileSyncService: FileSyncService,
    private activatedRoute: ActivatedRoute,
    private messageService: MessageService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.fileSyncService.onError((error: string) => {
      this.hasPerms = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: error,
      });
    });
    this.fileSyncService.joinFile(this.activatedRoute.snapshot.params['id']);
  }

  showCreateComments(ed: any) {
    this.visibleCreateComments = true;
    let pos = ed.getPosition();
    // this.currentOffset = this.getOffset(pos.lineNumber, this.fileSyncService.doc.getText('content').toString())
    this.currentOffset = ed.getModel().getOffsetAt(pos);
    this.relPos =  this.fileSyncService.createRelativePosFromMonacoPos(ed, ed.getModel());
  }

  onEditorInit(editor: any) {
    this.binding = new MonacoBinding(
      this.fileSyncService.doc.getText('content'),
      editor.getModel(),
      new Set([editor]),
    )

    this.loadComments(editor);
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
      // Making Monaco viewZones interactable: https://stackoverflow.com/questions/59081613/how-do-you-process-input-events-from-an-iviewzone-in-the-monaco-editor
      let overlayDomNode = this.createCommentElement(comment);
      let overlayWidget = {
        getId: () => comment.id,
        getDomNode: () => overlayDomNode,
        getPosition: () => null
      };

      editor.addOverlayWidget(overlayWidget);
      let absPos = this.fileSyncService.createMonacoPosFromRelativePos(editor, comment.relPos);

      let viewZoneId: number | null = null;
      editor.changeViewZones((changeAccessor: any) => {
        let domNode = document.createElement('div');
        viewZoneId = changeAccessor.addZone({
          afterLineNumber: absPos.lineNumber,
          heightInLines: 4,
          domNode: domNode,
          onDomNodeTop: (top: string) => {
            overlayDomNode.style.top = top + 'px';
          },
          onComputedHeight: (height: number) => {
            overlayDomNode.style.height = height + 'px';
          }
        });
        overlayDomNode.querySelector('#deleteButton')?.addEventListener('click', () => {
          editor.changeViewZones((changeAccessor: any) => {
            changeAccessor.removeZone(viewZoneId);
          });
          editor.removeOverlayWidget(overlayWidget);
          let index = this.fileSyncService.doc.getArray('comments').toArray().indexOf(comment);
          this.fileSyncService.doc.getArray('comments').delete(index, 1);

          this.fileSyncService.deleteComment(comment.id, this.activatedRoute.snapshot.params['id']);
        });
        
        this.overlays.push(overlayWidget);
        this.viewZones.push(viewZoneId);
      });
    });    
  }

  getLine(offset: number | undefined, text: string) {
    if (offset === undefined) {
      offset=0;
    }
    let lines = text.split('\n');
    let line = 0;
    let currentOffset = 0;
    while (currentOffset < offset) {

      currentOffset += lines[line].length + 1;
      line++;
    }
    return line;
  }

  addComment(content: string) {
    let comment = {
      content: content,
      relPos: this.relPos,
      fileId: this.activatedRoute.snapshot.params['id'],
    }


    this.fileSyncService.createComment(comment.content, comment.relPos, comment.fileId);
    
    this.comment = '';
    this.visibleCreateComments = false;
  }

  ngOnDestroy(): void {
    this.fileSyncService.leaveFile(this.activatedRoute.snapshot.params['id']);
  }

  createCommentElement(comment: any) {
    /**
     * This was the only way :(
     * 
     * Monaco View Zones require a DOM element to be passed in as the domNode property
     */

    let commentElement = document.createElement('div');

    commentElement.innerHTML = `
      <div style="color: black; width: 84vw; background-color: white; border: 1px solid black; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 5px; border-radius: 5px; z-index: 1000;">
        <div id="buttonRow" style="display: flex; width: 100%; justify-content: space-between; margin-bottom: 5px; align-items: center">
          <span style="font-weight: bold;">${comment.user.email}</span>
          <button style="font-size: 20px; margin-top: 5px; background-color: red; color: white; border: none; border-radius: 5px; cursor: pointer;" id="deleteButton">&times;</button>
        </div>
        <div style="max-height: 50px; overflow-y: auto; width: 100%">${comment.content}</div>
      </div>
    `;

    let userNameElement = document.createElement('span');
    userNameElement.style.fontWeight = 'bold';
    userNameElement.style.fontSize = '20px';


    return commentElement;
  }
}
