import {
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
  output,
} from '@angular/core';
import { TreeTableModule } from 'primeng/treetable';
import { MenuItem, TreeNode } from 'primeng/api';
import { ContextMenu, ContextMenuModule } from 'primeng/contextmenu';
import { ButtonModule } from 'primeng/button';
import { FileService } from '../../shared/services/file-sys/file-sys.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { MenubarModule } from 'primeng/menubar';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import {
  Folder,
  File,
} from '../../shared/services/file-sys/file-sys.interface';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { WorkspaceService } from '../../shared/services/workspace/workspace.service';

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
    MenubarModule,
    ToastModule,
  ],
  templateUrl: './file-sys.component.html',
  styleUrl: './file-sys.component.css',
  providers: [FileService,],
})
export class FileSysComponent implements OnInit {
  visible: boolean = false;
  types!: FileType[];
  createFileFormGroup!: FormGroup;
  error: string = ''; // string representing the error message
  workspaceId!: number; // number representing the workspace id
  files!: TreeNode[];
  menuItems!: MenuItem[];
  loading: boolean = false;
  cols!: Column[];
  @ViewChild('cm') cm!: ContextMenu;
  selectedItem!: any;

  constructor(
    private fileService: FileService,
    private messageService: MessageService,
    private cd: ChangeDetectorRef,
    private activateRoute: ActivatedRoute,
    private workspaceService: WorkspaceService,
  ) {}

  ngOnInit(): void {
    this.workspaceId = this.activateRoute.snapshot.params['id'];
    this.workspaceService.findWorkspaceById(this.workspaceId).subscribe({
      next: (res) => {
        document.querySelector('.workspaceName')!.innerHTML = res.name;
      },
      error: (err) => {
        this.error = err.error.error;
      },
    });

    this.types = [{ type: 'file' }, { type: 'folder' }];

    this.cols = [
      { field: 'name', header: 'Name' },
      { field: 'type', header: 'Type' },
      { field: '', header: '' }
    ];

    this.createFileFormGroup = new FormGroup({
      filename: new FormControl<string | null>(null),
      filetype: new FormControl<FileType | null>(null),
    });

    this.menuItems = [
      {
        label: 'Add File or Folder',
        icon: 'pi pi-plus',
        command: (event) => {
          this.showDialog();
        },
      },
      {
        label: 'Delete',
        icon: 'pi pi-times',
        command: (event) => {
          this.deleteItem(
            this.selectedItem.node.data.id,
            this.selectedItem.node.data.type,
          ); // Placeholders
        },
      },
    ];
  }

  loadNodes(): void {
    this.loading = true;
    this.fileService.getContentForFolder(this.workspaceId, 0).subscribe({
      next: (res) => {
        const items = <{ id: number; name: string; type: string }[]>res;
        let newFiles = [];
        for (let item of items) {
          let node: TreeNode = {
            data: {
              id: item.id,
              name: item.name,
              type: item.type,
            },
            leaf: item.type === 'file' ? true : false,
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
      },
    });
  }

  onNodeExpand(event: any): void {
    this.loading = true;
    const node = event.node;

    // This may break with more folders. Need a better way to do getFolderByName
    this.fileService
      .getContentForFolder(this.workspaceId, node.data.id)
      .subscribe({
        next: (res) => {
          const items = <{ id: number; name: string; type: string }[]>res;
          let nodeChildren = [];
          for (let item of items) {
            let childNode = {
              data: {
                id: item.id,
                name: item.name,
                type: item.type,
              },
              leaf: item.type === 'file' ? true : false,
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
        },
      });
  }

  addItem(name: string, type: string, parentId: number) {
    if (!name) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Name is required' });
      return;
    }
    if (!type) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Type is required' });
      return;
    }
    this.fileService
      .addItem(
        this.workspaceId,
        name,
        type,
        parentId,
      )
      .subscribe({
        next: () => {
          this.loadNodes();
          this.error = '';
          this.visible = false;
          this.createFileFormGroup.reset();
          this.messageService.add({ severity: 'success', summary: 'Success', detail: type + ' added' });
        },
        error: (err) => {
          this.error = err.error.error;
          this.messageService.add({ severity: 'error', summary: 'Error', detail: this.error });
        },
      });
  }

  deleteItem(id: number, type: string) {
    this.fileService.deleteItem(id, type, this.workspaceId).subscribe({
      next: () => {
        this.loadNodes();
        this.error = '';
      },
      error: (err) => {
        this.error = err.error.error;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: this.error });
      },
    });
  }

  submitFileForm() {
    const parentId =
      this.selectedItem && this.selectedItem.node.data.type === 'folder'
        ? this.selectedItem.node.data.id
        : 0;
    const itemType = this.createFileFormGroup.value.filetype ? this.createFileFormGroup.value.filetype.type : null;
    this.addItem(
      this.createFileFormGroup.value.filename,
      itemType,
      parentId,
    );
  }

  showDialog() {
    this.visible = true;
  }

  onContextMenu(event: MouseEvent, rowData: any) {
    // Prevent the default context menu from appearing
    event.preventDefault();
    this.selectedItem = rowData;
    if (rowData.node.data.type === 'file') {
      this.menuItems = [
        {
          label: 'Delete',
          icon: 'pi pi-times',
          command: (event) => {
            this.deleteItem(
              this.selectedItem.node.data.id,
              this.selectedItem.node.data.type,
            ); // Placeholders
          },
        },
      ]
    } 
    else {
      this.menuItems = [
        {
          label: 'Add File or Folder',
          icon: 'pi pi-plus',
          command: (event) => {
            this.showDialog();
          },
        },
        {
          label: 'Delete',
          icon: 'pi pi-times',
          command: (event) => {
            this.deleteItem(
              this.selectedItem.node.data.id,
              this.selectedItem.node.data.type,
            ); // Placeholders
          },
        },
      ]
    }
    if (event.button === 2) {
      this.cm.show(event);
      console.log(this.selectedItem);
    }
  }

  onHide() {
    // this.selectedItem = null;
  }
}
