import { Component, OnInit } from '@angular/core';
import { TreeTableModule } from 'primeng/treetable';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { MenubarModule } from 'primeng/menubar';
import { SharedWorkspaceService } from '../../shared/services/sharedworkspace/sharedworkspace.service';
import { Workspace } from '../../shared/services/workspace/workspace.interface';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-sharedworkspace',
  standalone: true,
  imports: [
    TreeTableModule,
    ButtonModule,
    CommonModule,
    MenubarModule,
    InputTextModule,
    FormsModule,
  ],
  templateUrl: './sharedworkspace.component.html',
  styleUrl: './sharedworkspace.component.css'
})
export class SharedWorkspaceComponent implements OnInit {
  searchTerm: string = '';
  sharedworkspaces: any[] = [];
  cols: any[] = [
    { field: 'name', header: 'Name' },
    { field: 'owner', header: 'Owner' },
  ];

  constructor(private sharedWorkspaceService: SharedWorkspaceService) { }

  ngOnInit(): void {
    this.initSharedWorkspaces();
  }

  findSharedWorkspace(searchTerm: string) {
    if (!searchTerm) {
      this.getSharedworkspaces(0);
    } else {
      this.sharedWorkspaceService.findSharedWorkspaceByName(searchTerm).subscribe({
        next: (res) => {
          this.sharedworkspaces = [];
          if (res.workspace) {
            for (const workspace of res.workspace) {
              this.sharedworkspaces = [...this.sharedworkspaces, { data: { name: workspace.workspace.name, owner: workspace.workspace.user.email, id: workspace.workspace.id } }];
            }
          }
        },
        error: (error) => {
          console.error('Error fetching shared workspace', error);
        }
      });
    }
  };

  initSharedWorkspaces() {
    this.getSharedworkspaces(0);
  }

  getSharedworkspaces(page: number) {
    this.sharedWorkspaceService.getSharedWorkspaces(page).subscribe({
      next: (workspaces) => {
        this.sharedworkspaces = [];
        for (const workspace of workspaces) {
          this.sharedworkspaces = [...this.sharedworkspaces, { data: { name: workspace.workspace.name, owner: workspace.workspace.user.email, id: workspace.workspace.id } }];
        }
      },
      error: (error) => {
        console.error('Error fetching shared workspaces', error);
      }
    })
  };
}
