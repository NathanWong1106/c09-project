import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ExampleMessage, ExampleService } from './shared/services/example.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ButtonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  exampleMessage!: Promise<ExampleMessage>;

  constructor(private exampleService: ExampleService) {}

  ngOnInit(): void {
    this.exampleMessage = this.exampleService.getExampleText();
  }
}
