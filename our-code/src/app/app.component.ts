import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './shared/services/auth/auth.service';
import { HeaderComponent } from './components/header/header.component';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [CommonModule, RouterOutlet, HeaderComponent, ToastModule],
})
export class AppComponent {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}
}
