import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './shared/services/auth/auth.service';
import { HeaderComponent } from "./components/header/header.component";

@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
    imports: [CommonModule, RouterOutlet, HeaderComponent]
})
export class AppComponent{
  constructor(private authService: AuthService, private router: Router) { 
    this.authService.user$.subscribe((user) => {
      if (user) {
        router.navigate(['/workspaces']);
      } else {
        router.navigate(['/sign-in']);
      }
    });
  }
}
