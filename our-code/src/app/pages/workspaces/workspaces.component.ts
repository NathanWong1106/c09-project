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
  ],
  templateUrl: './workspaces.component.html',
  styleUrl: './workspaces.component.css'
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

  constructor(private workspaceService: WorkspaceService, private clipboard: Clipboard, private sharedWorkspaceService: SharedWorkspaceService) { }

  ngOnInit(): void {
    this.initWorkspaces();
  }

  copyShareUrl(sampleurl: string) {
    this.clipboard.copy(sampleurl);
  }

  saveRowData(rowData: Workspace) {
    this.currentRowData = rowData;
  }

  shareMember(members: string[], rowData: Workspace) {
    if (members.length === 0) {
      // toast error
    }
    else if (members.includes(rowData.owner)) {
      // toast error
    }
    else if (0) {
      // member not found
      // toast error
    }
    else {
      this.sharedWorkspaceService.addSharedWorkspace(rowData.id, members).subscribe({
        next: (response) => {
          // toast user(s) added
        },
        error: (error) => {
          console.error(error);
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
    this.workspaceService.getMyWorkspaces(0).subscribe({
      next: (workspaces) => {
        for (const workspace of workspaces) {
          this.workspaces = [...this.workspaces, { data: { name: workspace.name, owner: workspace.user.email, id: workspace.id } }];
        }
      },
      error: (error) => {
        console.error(error);
      }
    });
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
      },
      error: (error) => {
        console.error(error);
      }
    });
    this.visibleEdit = false;
  }

  deleteWorkspace(id: number) {
    this.workspaceService.deleteWorkspace(id).subscribe({
      next: (response) => {
        this.workspaces = this.workspaces.filter((w) => w.data.id !== id);
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  getWorkspaces(page: number) {
    this.workspaceService.getMyWorkspaces(page).subscribe({
      next: (workspaces) => {
        this.workspaces = [];
        for (const workspace of workspaces) {
          this.workspaces = [...this.workspaces, { data: { name: workspace.name, owner: workspace.user.email, id: workspace.id } }];
        }
      },
      error: (error) => {
        console.error(error);
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
      },
      error: (error) => {
        console.error(error);
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
          if (response.workspace) {
            for (const workspace of response.workspace) {
              this.workspaces = [...this.workspaces, { data: { name: workspace.name, owner: workspace.user.email, id: workspace.id } }];
            }
          }
        },
        error: (error) => {
          console.error(error);
        }
      });
    }
  }
}
