import { Component, OnInit } from '@angular/core';
import { TreeTableModule } from 'primeng/treetable';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { WorkspaceService } from '../../shared/services/workspace/workspace.service';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-workspaces',
  standalone: true,
  imports: [
    TreeTableModule,
    ButtonModule,
    CommonModule,
    DialogModule,
    InputTextModule,
    FormsModule
  ],
  templateUrl: './workspaces.component.html',
  styleUrl: './workspaces.component.css'
})
export class WorkspacesComponent implements OnInit {
  visible: boolean = false;
  workspaces: any[] = [];
  workspaceName: string = '';
  cols: any[] = [
    { field: 'name', header: 'Name' },
    { field: 'owner', header: 'Owner' },
    { field: 'actions', header: '' }
  ];

  constructor(private workspaceService: WorkspaceService) { }

  ngOnInit(): void {
    this.initWorkspaces();
  }

  showDialog() {
    this.visible = true;
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

  editWorkspace(workspace: any) {
    console.log('Editing workspace', workspace);
  }

  deleteWorkspace(workspace: any) {
    this.workspaceService.deleteWorkspace(workspace.id).subscribe({
      next: (response) => {
        this.workspaces = this.workspaces.filter((w) => w.data.id !== workspace.id);
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
      },
      error: (error) => {
        console.error(error);
      }
    });
    this.visible = false;
  }

  shareWorkspace(workspace: any) {
    console.log('Sharing workspace', workspace);
  }
}
