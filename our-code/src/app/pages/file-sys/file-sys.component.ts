import { Component, OnInit, output } from '@angular/core';
import { TreeTableModule } from 'primeng/treetable';
import { MenuItem, TreeNode } from 'primeng/api';
import { ContextMenuModule } from 'primeng/contextmenu';
import { ButtonModule } from 'primeng/button';
import { FileService } from '../../shared/services/file-sys/file-sys.service';
import { AuthService } from '../../shared/services/auth/auth.service';
import { Tree } from 'primeng/tree';

@Component({
  selector: 'app-directory',
  standalone: true,
  imports: [
    TreeTableModule,
    ContextMenuModule,
    ButtonModule
  ],
  templateUrl: './file-sys.component.html',
  styleUrl: './file-sys.component.css',
  providers: [FileService]
})

export class FileSysComponent implements OnInit {
  error: string = ''; // string representing the error message
  isAuth: boolean = false; // boolean representing if the user is authenticated
  workspaceId: number = 0; // number representing the workspace id
  files: TreeNode[] = [];
  items: MenuItem[] | undefined;

  constructor(private fileService: FileService, private auth: AuthService, ) {
  }

  ngOnInit(): void {
    this.getFiles();
    this.items = [
      { label: 'Delete', icon: 'pi pi-times' },
    ];
  }

  getFiles() {
    this.fileService.getFileSys().subscribe((data) => {
      this.files = <TreeNode[]> data;
    });
  }

  addFile(name: string, type: string, parentId: number) {
    this.fileService.addFile(name, type, parentId).subscribe({
      next: () => {
        this.getFiles();
        this.error = '';
      },
      error: (err) => {
        this.error = err.error.error;
      },
    });
    
  }

  deleteFile(id: number) {
    this.fileService.deleteFile(id).subscribe({
      next: () => {
        this.getFiles();
        this.error = '';
      },
      error: (err) => {
        this.error = err.error.error;
      },
    });
  }
}