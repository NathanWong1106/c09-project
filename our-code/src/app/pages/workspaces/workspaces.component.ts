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
  currentRowData: any = {};
  members: string[] = [];
  workspaces: any[] = [];
  workspaceName: string = '';
  searchTerm: string = '';
  totalRecords: number = 0;
  currentPage: number = 0;

  cols: any[] = [
    { field: 'name', header: 'Name' },
    { field: 'owner', header: 'Owner' },
    { field: 'actions', header: '' }
  ];

  constructor(
    private workspaceService: WorkspaceService, 
    private messageService: MessageService,
    private sharedWorkspaceService: SharedWorkspaceService, 
  ) { }

  ngOnInit(): void {
    this.initWorkspaces();
  }

  saveRowData(rowData: Workspace) {
    this.sharedWorkspaceService.getSharedUsers(rowData.id).subscribe({
      next: (response) => {
        this.currentRowData = rowData;
        this.currentRowData.sharedUsers = response.users
      },
      error: (error) => {
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
        this.messageService.add({severity:'error', summary:'Error', detail:'Failed to remove member'});
      }
    });
  };

  shareMember(members: string[], rowData: any) {
    const sharedUsers = rowData.sharedUsers.map((u: any) => u.user.email);

    if (members.length === 0) {
      this.messageService.add({severity:'error', summary:'Error', detail:'Please enter a member'});
    }
    else if (members.includes(rowData.owner)) {
      this.messageService.add({severity:'error', summary:'Error', detail:'Owner cannot be added as a member'});
    }
    else if (members.some(member => sharedUsers.includes(member))) {
      this.messageService.add({severity:'error', summary:'Error', detail:'User is already a shared member'});
    }
    else {
      this.sharedWorkspaceService.addSharedWorkspace(rowData.id, members).subscribe({
        next: (response: any) => {
          if (response.userIds.error) {
            this.messageService.add({severity:'error', summary:'Error', detail:'Some users do not exist'});
            return;
          }
          this.messageService.add({severity:'success', summary:'Success', detail:'Workspace successfully shared'});
        },
        error: (error) => {
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

  onPageChange(event: any) {
    this.currentPage = event.page;
    if (this.searchTerm) {
      this.findWorkspace(this.searchTerm, event.page);
    } else {
      this.getWorkspaces(event.page);
    }
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
        this.totalRecords--;
        if (this.totalRecords / 10 <= this.currentPage) {
          this.currentPage = this.currentPage - 1 > 0 ? this.currentPage - 1 : 0;
        }
        this.getWorkspaces(this.currentPage);
      },
      error: (error) => {
        this.messageService.add({severity:'error', summary:'Error', detail:'Failed to delete workspace'});
      }
    });
  }

  getWorkspaces(page: number) {
    this.workspaceService.getMyWorkspaces(page).subscribe({
      next: (res) => {
        this.totalRecords = res.total;
        this.currentPage = page;
        this.workspaces = [];
        for (const workspace of res.workspaces) {
          this.workspaces = [...this.workspaces, { data: { name: workspace.name, owner: workspace.user.email, id: workspace.id } }];
        }
      },
      error: (error) => {
        this.messageService.add({severity:'error', summary:'Error', detail:'Failed to get workspaces'});
      }
    });
  }

  createWorkspace(name: string) {
    this.workspaceService.createWorkspace(name).subscribe({
      next: (response) => {
        this.getWorkspaces(this.currentPage);
        this.workspaceName = '';
        this.messageService.add({severity:'success', summary:'Success', detail:'Workspace successfully created'});
      },
      error: (error) => {
        this.messageService.add({severity:'error', summary:'Error', detail:'Failed to create workspace'});
      }
    });
    this.visibleCreate = false;
  }

  findWorkspace(name: string, page: number) {
    if (!name) {
      this.getWorkspaces(page);
    } else {
      this.workspaceService.findWorkspaceByName(name, page).subscribe({
        next: (res) => {
          this.totalRecords = res.total;
          this.workspaces = [];
          if (res.workspaces.length > 0) {
            for (const workspace of res.workspaces) {
              this.workspaces = [...this.workspaces, { data: { name: workspace.name, owner: workspace.user.email, id: workspace.id } }];
            }
          } else {
            this.messageService.add({severity:'info', summary:'Info', detail:'Workspace not found'});
          }
        },
        error: (error) => {
          this.messageService.add({severity:'error', summary:'Error', detail:'An error occured while searching for workspaces'});
        }
      });
    }
  }
}
