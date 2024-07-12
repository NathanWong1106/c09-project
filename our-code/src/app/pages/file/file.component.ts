import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
  overlays: any[] = [];
  firstUpdate: boolean = true;
  monacoLoaded: boolean = false;

  constructor(
    private fileSyncService: FileSyncService,
    private activatedRoute: ActivatedRoute,
    private messageService: MessageService
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
    this.currentOffset = this.getOffset(pos.lineNumber, ed.getModel().getValue())
  }

  onEditorInit(editor: any) {
    this.binding = new MonacoBinding(
      this.fileSyncService.doc.getText('content'),
      editor.getModel(),
      new Set([editor]),
    )

    this.loadComments(this.binding);

    const commentArray = this.fileSyncService.doc.getArray('comments')
    commentArray.observe(() => {

      console.log(this.fileSyncService.doc.getArray('comments').toArray());
      this.loadComments(this.binding);
    });

    editor.addAction({
      id: "comment",
      label: "Add a Comment",
      
      contextMenuGroupId: 'navigation',
      contextMenuOrder: 1,
      
      run: (ed: any) => this.showCreateComments(ed)
    });
  }

  loadComments(binding: MonacoBinding) {
    const comments = this.fileSyncService.doc.getArray('comments').toArray();

    let editor = binding.editors.values().next().value;
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
      let absPos = this.fileSyncService.decodeRelativePosition(comment.relPos);
      const lineNumber = this.getLine(absPos?.index, this.fileSyncService.doc.getText('content').toString())

      let viewZoneId: number | null = null;
      editor.changeViewZones((changeAccessor: any) => {
        let domNode = document.createElement('div');
        viewZoneId = changeAccessor.addZone({
          afterLineNumber: lineNumber,
          heightInLines: 5,
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

  getOffset(line: number, text: string) {
    console.log(text.toString())
    let lines = text.split('\n');
    // console.log(line)
    // console.log(text)
    // console.log(lines)
    let offset = 0;
    for (let i = 0; i < line; i++) {
      offset += lines[i].length + 1;
    }
    return offset;
  }

  getLine(offset: number | undefined, text: string) {
    console.log(text.toString())
    if (offset === undefined) {
      offset=0;
    }
    let lines = text.split('\n');
    let line = 0;
    let currentOffset = 0;
    while (currentOffset < offset + 1) {
      // console.log('currentOffset: ' + currentOffset)
      // console.log('offset: ' + offset)
      // console.log('line: ' + line + ' '+ 'lines[line].length: ' + lines[line].length)
      currentOffset += lines[line].length + 1;
      line++;
    }
    return line;
  }

  addComment(content: string) {
    let comment = {
      content: content,
      relPos: this.currentOffset,
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
    /*
      TODO
      Delete comments

      fix inline comment modal

      add comment modal
    */

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
