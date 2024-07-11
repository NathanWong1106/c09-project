import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FileSyncService } from '../../shared/services/filesync/filesync.service';
import { ActivatedRoute } from '@angular/router';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { FormsModule } from '@angular/forms';
import { MonacoBinding } from 'y-monaco';
import { MessageService } from 'primeng/api';
import { MessagesModule } from 'primeng/messages';
import { SplitterModule } from 'primeng/splitter';

@Component({
  selector: 'app-file',
  standalone: true,
  imports: [MonacoEditorModule, FormsModule, MessagesModule, SplitterModule],
  templateUrl: './file.component.html',
  styleUrl: './file.component.css',
})
export class FileComponent implements OnInit, OnDestroy {
  editorOptions = { theme: 'vs-dark',  language: 'python', automaticLayout: true};
  code: string = 'print("Hello World!")';
  binding!: MonacoBinding;
  hasPerms: boolean = true;
  viewZones: any[] = [];  

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

  onEditorInit(editor: any) {
    this.binding = new MonacoBinding(
      this.fileSyncService.doc.getText('content'),
      editor.getModel(),
      new Set([editor]),
    )
    const commentArray = this.fileSyncService.doc.getArray('comments')

    commentArray.observe((event) => {
      event.target === commentArray;
      console.log(event.changes.delta);
      this.loadComments(this.binding);
    });
    console.log(this.binding)

    editor.addAction({
      id: "comment",
      label: "Add a Comment",
      
      contextMenuGroupId: 'navigation',
      contextMenuOrder: 1,
      
      run: (ed: any) => this.addComment(ed)
    });

    // this.loadComments(editor);
  }

  loadComments(binding: MonacoBinding) {
    // this.fileSyncService.addRelativePosition(3);
    const comments = this.fileSyncService.doc.getArray('comments').toArray();

    // console.log(binding.editors.values().next().value.getModel())
    // 
    let editor = binding.editors.values().next().value;
    editor.changeViewZones((changeAccessor: any) => {
      for (let i = 0; i < this.viewZones.length; i++) {
        changeAccessor.removeZone(this.viewZones[i]);
      }
    });

    console.log(comments)
    comments.forEach((comment: any) => {
      let absPos = this.fileSyncService.decodeRelativePosition(comment.relPos);
      const lineNumber = this.getLine(absPos?.index, editor.getModel().getValue())
      console.log(absPos?.index)

      let overlayDomNode = this.createCommentElement(comment);

      let overlayWidget = {
        getId: () => 'overlay.zone.widget',
        getDomNode: () => overlayDomNode,
        getPosition: () => null
      };
      editor.addOverlayWidget(overlayWidget);

      let viewZoneId = null;
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
        this.viewZones.push(viewZoneId);
      });
    });    
  }

  getOffset(line: number, text: string) {
    let lines = text.split('\n');
    console.log(lines)
    let offset = 0;
    for (let i = 0; i < line - 1; i++) {
      offset += lines[i].length + 1;
    }
    return offset;
  }

  getLine(offset: number | undefined, text: string) {
    if (offset === undefined) {
      offset=0;
    }
    let lines = text.split('\n');
    let line = 0;
    let currentOffset = 0;
    while (currentOffset < (offset || 0)) {
      currentOffset += lines[line].length + 1;
      line++;
    }
    return line;
  }

  addComment(ed: any) {
    let pos = ed.getPosition();
    const offset = this.getOffset(pos.lineNumber, ed.getModel().getValue())
    console.log(offset)
    console.log(ed.getModel().getPositionAt(offset))


    // TODO: Modal to add comment
    let comment = {
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut malesuada vitae urna non suscipit. Vestibulum convallis nisl ut ante scelerisque mollis. Donec rhoncus faucibus velit, ut elementum sem consequat id. Suspendisse consequat ex a ultrices finibus. Morbi mollis dui purus, sit amet vestibulum est molestie in. Pellentesque sagittis velit risus, ut sodales nisl dapibus id. Donec tincidunt vestibulum pulvinar. Pellentesque sed metus eu felis interdum maximus. Ut vulputate iaculis dui. Etiam scelerisque sem et lorem facilisis, quis auctor nisl pulvinar. Fusce dignissim facilisis augue, nec rhoncus tellus facilisis et.',
      line: pos.lineNumber,
      relPos: this.fileSyncService.addRelativePosition(offset)
    }

    this.fileSyncService.doc.getArray('comments').insert(0, [comment]);
  }

  ngOnDestroy(): void {
    this.fileSyncService.leaveFile(this.activatedRoute.snapshot.params['id']);
  }

  createCommentElement(comment: any) {
    // This was the only way :(
    let commentElement = document.createElement('div');
    let commentContent = document.createElement('div');
    let deleteButton = document.createElement('button');

    deleteButton.innerHTML = '&times;';
    deleteButton.style.fontSize = '20px';
    deleteButton.style.marginTop = '5px';
    deleteButton.style.backgroundColor = 'red';
    deleteButton.style.color = 'white';
    deleteButton.style.border = 'none';
    deleteButton.style.borderRadius = '5px';
    deleteButton.style.cursor = 'pointer';
    // deleteButton.style.float = 'right';
    deleteButton.addEventListener('click', () => {
      console.log('delte');
    });
    commentElement.appendChild(deleteButton);

    commentContent.style.maxHeight = '50px';
    commentContent.style.overflowY = 'auto';
    commentContent.innerHTML = comment.content;
    commentElement.appendChild(commentContent);

    commentElement.style.color = 'black';
    commentElement.style.width = '80%';
    commentElement.style.backgroundColor = 'white';
    commentElement.style.border = '1px solid black';
    commentElement.style.display = 'flex';
    commentElement.style.flexDirection = 'column';
    commentElement.style.alignItems = 'center';
    commentElement.style.justifyContent = 'center'; 
    commentElement.style.padding = '5px';
    commentElement.style.borderRadius = '5px';

    return commentElement;
  }
}
