import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from '../shared/services/auth/auth.service';
import { inject } from '@angular/core';

export const AuthGuard: CanActivateFn = (
  next: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  
  if(inject(AuthService).isAuthenticated()) {
    return true;
  } else {
    inject(AuthService).setRedirectUrl(state.url);
    inject(Router).navigate(['/sign-in']);
    return false;
  }
};
