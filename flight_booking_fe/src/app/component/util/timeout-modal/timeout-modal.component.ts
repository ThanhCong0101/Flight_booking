import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-timeout-modal',
  standalone: true,
  imports: [],
  templateUrl: './timeout-modal.component.html',
  styleUrl: './timeout-modal.component.css',
})
export class TimeoutModalComponent {
  constructor(private router: Router) {}

  redirectToSearch() {
    this.router.navigate(['/flights']);
  }
}
