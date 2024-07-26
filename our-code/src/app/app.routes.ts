import { Routes } from '@angular/router';
import { SignInComponent } from './pages/sign-in/sign-in.component';
import { WorkspacesComponent } from './pages/workspaces/workspaces.component';
import { FileSysComponent } from './pages/file-sys/file-sys.component';
import { SharedWorkspaceComponent } from './pages/sharedworkspace/sharedworkspace.component';
import { AuthGuard } from './guards/auth.guards';
import { FileComponent } from './pages/file/file.component';
import { CreditsComponent } from './pages/credits/credits.component';

export const routes: Routes = [
  {
    path: 'sign-in',
    component: SignInComponent,
  },
  {
    path: 'credits',
    component: CreditsComponent,
  },
  {
    path: 'workspaces',
    component: WorkspacesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'workspaces/:id/fs',
    component: FileSysComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'sharedworkspace',
    component: SharedWorkspaceComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'file/:id/edit',
    component: FileComponent,
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: '/sign-in',
  },
];
