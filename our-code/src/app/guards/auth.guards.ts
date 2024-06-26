import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from '../shared/services/auth/auth.service';
import { inject } from '@angular/core';
import { map } from 'rxjs';

export const AuthGuard: CanActivateFn = (
  next: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  return inject(AuthService)
    .me()
    .pipe(
      map((response) => {
        if (response.user) {
          return true;
        }
        return false;
      }),
    );
};
