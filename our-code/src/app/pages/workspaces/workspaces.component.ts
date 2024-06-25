import { Component, OnInit } from '@angular/core';
import { TreeTableModule } from 'primeng/treetable';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { WorkspaceService } from '../../shared/services/workspace/workspace.service';
import { SharedWorkspaceService } from '../../shared/services/sharedworkspace/sharedworkspace.service';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { Clipboard } from '@angular/cdk/clipboard';
import { ChipsModule } from 'primeng/chips';
import { Workspace } from '../../shared/services/workspace/workspace.interface';
import { MessageService } from 'primeng/api';
import { MessagesModule } from 'primeng/messages';
import { ToastModule } from 'primeng/toast';
import { PaginatorModule } from 'primeng/paginator';

@Component({
  selector: 'app-workspaces',
  standalone: true,
  imports: [
    TreeTableModule,
    ButtonModule,
    CommonModule,
    DialogModule,
    InputTextModule,
    FormsModule,
    MenubarModule,
    OverlayPanelModule,
    InputGroupModule,
    InputGroupAddonModule,
    ChipsModule,
    MessagesModule,
    ToastModule,
    PaginatorModule
  ],
  templateUrl: './workspaces.component.html',
  styleUrl: './workspaces.component.css',
})
export class WorkspacesComponent implements OnInit {
  visibleEdit: boolean = false;
  visibleCreate: boolean = false;
  sampleurl: string = 'sampeurl.real'
  currentRowData: any = {};
  members: string[] = [];
  workspaces: any[] = [];
  workspaceName: string = '';
  searchTerm: string = '';

  cols: any[] = [
    { field: 'name', header: 'Name' },
    { field: 'owner', header: 'Owner' },
    { field: 'actions', header: '' }
  ];

  constructor(
    private workspaceService: WorkspaceService, 
    private clipboard: Clipboard, 
    private messageService: MessageService,
    private sharedWorkspaceService: SharedWorkspaceService, 
  ) { }

  ngOnInit(): void {
    this.initWorkspaces();
  }

  copyShareUrl(sampleurl: string) {
    this.clipboard.copy(sampleurl);
    this.messageService.add({severity:'success', summary:'Success', detail:'URL copied to clipboard'});
    console.log(this.currentRowData)
  }

  saveRowData(rowData: Workspace) {
    this.sharedWorkspaceService.getSharedUsers(rowData.id).subscribe({
      next: (response) => {
        this.currentRowData = rowData;
        this.currentRowData.sharedUsers = response.users
      },
      error: (error) => {
        console.error(error);
        this.messageService.add({severity:'error', summary:'Error', detail:'Failed to get shared users'});
      }
    });
  }

  removeSharedMember(userId: number, workspaceId: number) {
    this.sharedWorkspaceService.removeSharedUser(userId, workspaceId).subscribe({
      next: (response) => {
        this.currentRowData.sharedUsers = this.currentRowData.sharedUsers.filter((u: any) => u.id !== userId);
        this.messageService.add({severity:'success', summary:'Success', detail:'Member successfully removed'});
      },
      error: (error) => {
        console.error(error);
        this.messageService.add({severity:'error', summary:'Error', detail:'Failed to remove member'});
      }
    });
  };

  shareMember(members: string[], rowData: Workspace) {
    if (members.length === 0) {
      this.messageService.add({severity:'error', summary:'Error', detail:'Please enter a member'});
    }
    else if (members.includes(rowData.owner)) {
      this.messageService.add({severity:'error', summary:'Error', detail:'Owner cannot be added as a member'});
    }
    else {
      this.sharedWorkspaceService.addSharedWorkspace(rowData.id, members).subscribe({
        next: (response) => {
          this.messageService.add({severity:'success', summary:'Success', detail:'Workspace successfully shared'});
        },
        error: (error) => {
          console.error(error);
          this.messageService.add({severity:'error', summary:'Error', detail:'Failed to share workspace'});
        }
      });
      this.members = [];
    }
  }

  showDialogCreate() {
    this.visibleCreate = true;
  }

  showDialogEdit() {
    this.visibleEdit = true;
  }

  initWorkspaces() {
    this.getWorkspaces(0);
  }    

  editWorkspace(id: number, name: string) {
    this.workspaceService.editWorkspace(id, name).subscribe({
      next: (response) => {
        this.workspaces = this.workspaces.map((w) => {
          if (w.data.id === id) {
            return { data: { name: name, owner: w.data.owner, id: id } };
          }
          this.workspaceName = '';
          return w;
        });
        this.messageService.add({severity:'success', summary:'Success', detail:'Workspace name successfully edited'});
      },
      error: (error) => {
        console.error(error);
        this.messageService.add({severity:'error', summary:'Error', detail:'Failed to edit workspace'});
      }
    });
    this.visibleEdit = false;
  }

  deleteWorkspace(id: number) {
    this.workspaceService.deleteWorkspace(id).subscribe({
      next: (response) => {
        this.workspaces = this.workspaces.filter((w) => w.data.id !== id);
        this.messageService.add({severity:'success', summary:'Success', detail:'Workspace successfully deleted'});
      },
      error: (error) => {
        console.error(error);
        this.messageService.add({severity:'error', summary:'Error', detail:'Failed to delete workspace'});
      }
    });
  }

  getWorkspaces(page: number) {
    this.workspaceService.getMyWorkspaces(page).subscribe({
      next: (workspaces) => {
        this.workspaces = [];
        if (workspaces.length === 0) {
          this.messageService.add({severity:'info', summary:'Info', detail:'No workspaces found'});
        } else {
          for (const workspace of workspaces) {
            this.workspaces = [...this.workspaces, { data: { name: workspace.name, owner: workspace.user.email, id: workspace.id } }];
          }
        }
      },
      error: (error) => {
        console.error(error);
        this.messageService.add({severity:'error', summary:'Error', detail:'Failed to get workspaces'});
      }
    });
  }

  createWorkspace(name: string) {
    this.workspaceService.createWorkspace(name).subscribe({
      next: (response) => {
        this.workspaces = [...this.workspaces, 
          { data: 
            { name: 
              response.workspace.name, 
              owner: response.workspace.user.email, 
              id: response.workspace.id 
            } 
          }];
        this.workspaceName = '';
        this.messageService.add({severity:'success', summary:'Success', detail:'Workspace successfully created'});
      },
      error: (error) => {
        console.error(error);
        this.messageService.add({severity:'error', summary:'Error', detail:'Failed to create workspace'});
      }
    });
    this.visibleCreate = false;
  }

  findWorkspace(name: string) {
    if (!name) {
      this.getWorkspaces(0);
    } else {
      this.workspaceService.findWorkspaceByName(name).subscribe({
        next: (response) => {
          this.workspaces = [];
          if (response.workspace.length > 0) {
            for (const workspace of response.workspace) {
              this.workspaces = [...this.workspaces, { data: { name: workspace.name, owner: workspace.user.email, id: workspace.id } }];
            }
          } else {
            this.messageService.add({severity:'info', summary:'Info', detail:'Workspace not found'});
          }
        },
        error: (error) => {
          console.error(error);
        }
      });
    }
  }
}
