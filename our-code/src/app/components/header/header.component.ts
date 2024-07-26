import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { AuthService } from '../../shared/services/auth/auth.service';
import { environment } from '../../../environments/environment';
import { ButtonModule } from 'primeng/button';
import { InputSwitchModule } from 'primeng/inputswitch';
import { FormsModule } from '@angular/forms';
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
    InputSwitchModule,
    FormsModule,
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

  isDarkMode: boolean = false;
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
    this.authService.prepareLogOut();
    this.router.navigate(['/sign-in']).then(() =>{
      this.authService.logout().subscribe();
    });
  }

  // Toggle for themes: https://medium.com/@mathieu.schnoor/light-dark-theme-switcher-in-angular-with-primeng-dad1c1d4a067
  toggleLightDarkMode() {
    const linkRef = document.getElementById('app-theme') as HTMLLinkElement;
    if (linkRef.href.includes('light')) {
      linkRef.href = 'theme-dark.css';
      this.isDarkMode = true;
    } else {
      linkRef.href = 'theme-light.css';
      this.isDarkMode = false;
    }
  }
}
