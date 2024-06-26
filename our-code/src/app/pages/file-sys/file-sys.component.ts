import { ChangeDetectorRef, Component, OnInit, output } from '@angular/core';
import { TreeTableModule } from 'primeng/treetable';
import { MenuItem, TreeNode } from 'primeng/api';
import { ContextMenuModule } from 'primeng/contextmenu';
import { ButtonModule } from 'primeng/button';
import { FileService } from '../../shared/services/file-sys/file-sys.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { Folder, File } from '../../shared/services/file-sys/file-sys.interface';
import { CommonModule } from '@angular/common';

interface FileType {
  type: string;
}

interface Column {
  field: string;
  header: string;
}

@Component({
  selector: 'app-directory',
  standalone: true,
  imports: [
    TreeTableModule,
    ContextMenuModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    DropdownModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './file-sys.component.html',
  styleUrl: './file-sys.component.css',
  providers: [FileService]
})

export class FileSysComponent implements OnInit {
  visible: boolean = false;
  types!: FileType[];
  createFileFormGroup!: FormGroup;
  error: string = ''; // string representing the error message
  workspaceId!: number; // number representing the workspace id
  files!: TreeNode[];
  items!: MenuItem[];
  loading: boolean = false;
  cols!: Column[];

  constructor(private fileService: FileService, private cd: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.workspaceId = 1;

    this.types = [
      { type: 'file' },
      { type: 'folder' }
    ];

    this.cols = [
      { field: 'name', header: 'Name' },
      { field: 'type', header: 'Type' },
    ];

    this.createFileFormGroup = new FormGroup({
      filename: new FormControl<string | null>(null),
      filetype: new FormControl<FileType | null>(null)
    });
  }

  loadNodes(event: any): void {
    this.loading = true;
    this.fileService.getCurrentFilesys(this.workspaceId, 0).subscribe({
      next: (res) => {
        const items = <{ id: number, name: string, type: string }[]> res;
        let newFiles = [];
        for (let item of items) {
          let node: TreeNode = {
            data: {
              name: item.name,
              type: item.type,
            },
            leaf: item.type === 'file' ? true : false
          };
          newFiles.push(node);
        }
        this.files = newFiles;
        this.loading = false;
        this.cd.markForCheck();
      },
      error: (err) => {
        this.error = err.error.error;
        this.loading = false;
        this.cd.markForCheck();
      }
    });
  }

  onNodeExpand(event: any): void {
    this.loading = true;
    const node = event.node;

    this.fileService.getFolderByName(this.workspaceId, node.data.name).subscribe({
      next: (res) => {
        const folder = <Folder> res;
        this.fileService.getCurrentFilesys(this.workspaceId, folder.id).subscribe({
          next: (res) => {
            const items = <{ id: number, name: string, type: string }[]> res;
            let nodeChildren = [];
            for (let item of items) {
              let childNode = {
                data: {
                  name: item.name,
                  type: item.type,
                },
                leaf: item.type === 'file' ? true : false
              };
              nodeChildren.push(childNode);
            }
            node.children = nodeChildren;
            this.files = [...this.files]; // Ensure immutability for change detection
            this.loading = false;
            this.cd.markForCheck();
          },
          error: (err) => {
            this.error = err.error.error;
            this.loading = false;
            this.cd.markForCheck();
          }
        });
      },
      error: (err) => {
        this.error = err.error.error;
        this.loading = false;
        this.cd.markForCheck();
      }
    });
  }

  addItem(name: string, type: string, parentId: number) {
    this.fileService.addItem(this.workspaceId, name, type, parentId).subscribe({
      next: () => {
        // this.loadNodes();
        this.error = '';
      },
      error: (err) => {
        this.error = err.error.error;
      },
    });
  }

  deleteItem(id: number, type: string) {
    this.fileService.deleteItem(this.workspaceId, id, type).subscribe({
      next: () => {
        // this.loadNodes();
        this.error = '';
      },
      error: (err) => {
        this.error = err.error.error;
      },
    });
  }

  submitFileForm() {
    this.fileService.addItem(this.workspaceId, this.createFileFormGroup?.value.filename, this.createFileFormGroup?.value.filetype, 1).subscribe({
      next: () => {
        this.visible = false;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  showDialog() {
      this.visible = true;
  }
}