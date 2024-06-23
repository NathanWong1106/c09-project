import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { AuthService } from './shared/services/auth/auth.service';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ButtonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  isAuth: boolean = false;
  client: any;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.setAuthStatus();
    this.initGoogleClient();
  }

  initGoogleClient() {
    // @ts-ignore
    this.client = google.accounts.oauth2.initTokenClient({
      client_id: environment.googleClientId,
      scope: 'email profile',
      ux_mode: 'popup',
      callback: (response: any) => {
        this.authService.login(response.access_token).subscribe((data) => {
          this.setAuthStatus();
        });
      }
    });
  }

  handleGoogleSignIn() {
    this.client.requestAccessToken();
  }

  handleSignOut() {
    this.authService.logout().subscribe((data) => {
      this.setAuthStatus();
    });
  }

  setAuthStatus() {
    this.authService.me().subscribe({
      next: (data) => {
        console.log(data);
        this.isAuth = true;
      },
      error: (err) => { 
        this.isAuth = false;
      }
    })
  }
}
