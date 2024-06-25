import { Routes } from '@angular/router';
import { SignInComponent } from './pages/sign-in/sign-in.component';
import { WorkspacesComponent } from './pages/workspaces/workspaces.component';
import { FileSysComponent } from './pages/file-sys/file-sys.component';
import { AuthGuard } from './guards/auth.guards';

export const routes: Routes = [
  {
    path: 'sign-in',
    component: SignInComponent,
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
    path: '**',
    redirectTo: '',
  },
];
