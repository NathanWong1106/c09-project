import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../shared/services/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.css',
})
export class SignInComponent implements OnInit {
  constructor(private authService: AuthService, private router: Router) {}

  /**
   * Automatically try to authenticate the user.
   * If the user is authenticated, redirect to the specified URL or to the workspaces page.
   */
  ngOnInit(): void {
    this.authService.checkAuth().subscribe((isAuth) => {
      if (isAuth) {
        if (this.authService.getRedirectUrl()) {
          this.router.navigate([this.authService.getRedirectUrl()]);
        } else {
          this.router.navigate(['/workspaces']);
        }
      }
    });
  }
}
