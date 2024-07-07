import { Component, OnDestroy, OnInit } from '@angular/core';
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
      new Set([editor])
    );
  }

  ngOnDestroy(): void {
    this.fileSyncService.leaveFile(this.activatedRoute.snapshot.params['id']);
  }
}
