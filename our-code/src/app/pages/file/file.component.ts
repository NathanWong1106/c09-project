import { Component, OnInit } from '@angular/core';
import { FileSyncService } from '../../shared/services/filesync/filesync.service';
import { ActivatedRoute } from '@angular/router';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-file',
  standalone: true,
  imports: [MonacoEditorModule, FormsModule],
  templateUrl: './file.component.html',
  styleUrl: './file.component.css',
})
export class FileComponent implements OnInit {
  editorOptions = { theme: 'vs-dark', language: 'python' };
  code: string= 'print("Hello World!")';

  constructor(private fileSyncService: FileSyncService, private activatedRoute: ActivatedRoute ) {
    
  }

  ngOnInit(): void {
    this.fileSyncService.joinFile(this.activatedRoute.snapshot.params['id']);
  }

  onEditorInit(editor: any) {
    editor.getModel().onDidChangeContent(() => {
      this.fileSyncService.doc.transact(() => {
        this.fileSyncService.doc.getText('content').delete(0, this.fileSyncService.doc.getText('code').length);
        this.fileSyncService.doc.getText('content').insert(0, editor.getValue());
      });
    });
  }
}
