import { Component, OnInit } from '@angular/core';
import { TreeTableModule } from 'primeng/treetable';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-workspaces',
  standalone: true,
  imports: [
    TreeTableModule,
    ButtonModule,
    CommonModule,
    DialogModule
  ],
  templateUrl: './workspaces.component.html',
  styleUrl: './workspaces.component.css'
})
export class WorkspacesComponent implements OnInit {
  workspaces: any[] = [];
  cols: any[] = [
    { field: 'name', header: 'Name' },
    { field: 'actions', header: '' }
  ];

  constructor() { }

  ngOnInit(): void {
    this.workspaces = [
      {
        data: { name: 'Workspace 1' },
        children: [
          { data: { name: 'Sub Workspace 1.1' } },
          { data: { name: 'Sub Workspace 1.2' } }
        ]
      },
      {
        data: { name: 'Workspace 2' },
        children: [
          { data: { name: 'Sub Workspace 2.1' } }
        ]
      },
      {
        data: { name: 'Workspace 3' }
      }
    ];
  }

  editWorkspace(workspace: any) {
    console.log('Editing workspace', workspace);
  }

  deleteWorkspace(workspace: any) {
    console.log('Deleting workspace', workspace);
  }

  createWorkspace() {
    console.log('Creating workspace');
  }

  shareWorkspace(workspace: any) {
    console.log('Sharing workspace', workspace);
  }
}
