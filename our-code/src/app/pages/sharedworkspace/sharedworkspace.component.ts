import { Component, OnInit } from '@angular/core';
import { TreeTableModule } from 'primeng/treetable';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { MenubarModule } from 'primeng/menubar';
import { SharedWorkspaceService } from '../../shared/services/sharedworkspace/sharedworkspace.service';
import { Workspace } from '../../shared/services/workspace/workspace.interface';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { MessagesModule } from 'primeng/messages';
import { ToastModule } from 'primeng/toast';
import { PaginatorModule } from 'primeng/paginator';

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
    MessagesModule,
    ToastModule,
    PaginatorModule
  ],
  templateUrl: './sharedworkspace.component.html',
  styleUrl: './sharedworkspace.component.css'
})
export class SharedWorkspaceComponent implements OnInit {
  searchTerm: string = '';
  totalRecords: number = 0;
  currentPage: number = 0;
  sharedworkspaces: any[] = [];
  cols: any[] = [
    { field: 'name', header: 'Name' },
    { field: 'owner', header: 'Owner' },
  ];

  constructor(private sharedWorkspaceService: SharedWorkspaceService, private messageService: MessageService) { }

  ngOnInit(): void {
    this.initSharedWorkspaces();
  }

  getSharedWorkspaceTotal() {
    this.sharedWorkspaceService.getSharedWorkspacesTotal().subscribe({
      next: (res) => {
        this.totalRecords = res.total;
      },
      error: (error) => {
        console.error('Error fetching shared workspaces total', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error fetching shared workspaces total' });
      }
    });
  }

  findSharedWorkspace(searchTerm: string) {
    if (!searchTerm) {
      this.getSharedworkspaces(0);
    } else {
      this.sharedWorkspaceService.findSharedWorkspaceByName(searchTerm).subscribe({
        next: (res) => {
          this.sharedworkspaces = [];
          if (res.workspace.length > 0) {
            for (const workspace of res.workspace) {
              this.sharedworkspaces = [...this.sharedworkspaces, { data: { name: workspace.workspace.name, owner: workspace.workspace.user.email, id: workspace.workspace.id } }];
            } 
          } else {
            this.messageService.add({ severity: 'info', summary: 'Info', detail: 'No shared workspace found' });
          }
        },
        error: (error) => {
          console.error('Error fetching shared workspace', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error fetching shared workspace' });
        }
      });
    }
  };

  initSharedWorkspaces() {
    this.getSharedworkspaces(0);
    this.getSharedWorkspaceTotal();
  }

  onPageChange(event: any) {
    this.currentPage = event.page;
    this.getSharedworkspaces(event.page);
  }

  getSharedworkspaces(page: number) {
    this.sharedWorkspaceService.getSharedWorkspaces(page).subscribe({
      next: (workspaces) => {
        this.sharedworkspaces = [];
        if (workspaces.length === 0) {
          this.messageService.add({ severity: 'info', summary: 'Info', detail: 'No shared workspaces found' });
        } else {
          for (const workspace of workspaces) {
            this.sharedworkspaces = [...this.sharedworkspaces, { data: { name: workspace.workspace.name, owner: workspace.workspace.user.email, id: workspace.workspace.id } }];
          }
        }

      },
      error: (error) => {
        console.error('Error fetching shared workspaces', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error fetching shared workspaces' });
      }
    })
  };
}
