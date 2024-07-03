import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { AuthService } from '../../shared/services/auth/auth.service';
import { environment } from '../../../environments/environment';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    MenubarModule,
    AvatarModule,
    AvatarGroupModule,
    TieredMenuModule,
    ButtonModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {
  menuItems: MenuItem[] = [
    {
      label: 'Logout',
      command: () => this.handleSignOut(),
    },
  ];

  isAuth: boolean = false;
  client: any;
  profilePicture: string = '';

  constructor(private authService: AuthService, private router: Router) {
    this.authService.user$.subscribe((user) => {
      if (user) {
        this.isAuth = true;
        this.profilePicture = user.picture;
      } else {
        this.isAuth = false;
      }
    });
  }

  ngOnInit(): void {
    this.initGoogleClient();
  }

  initGoogleClient() {
    // @ts-ignore
    this.client = google.accounts.oauth2.initTokenClient({
      client_id: environment.googleClientId,
      scope: 'email profile',
      ux_mode: 'popup',
      callback: (response: any) => {
        this.authService.login(response.access_token).subscribe({
          next: (_) => {
            this.router.navigate([this.authService.getRedirectUrl()]);
          },
          error: (error) => {
            console.error(error);
          },
        });
      },
    });
  }

  handleGoogleSignIn() {
    this.client.requestAccessToken();
  }

  handleSignOut() {
    this.authService.logout().subscribe((_) => {
      this.router.navigate(['/sign-in']);
    });
  }
}
