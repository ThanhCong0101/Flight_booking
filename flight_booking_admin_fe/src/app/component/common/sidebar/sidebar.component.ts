import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterModule,
  RouterOutlet,
} from '@angular/router';
import { tap } from 'rxjs';
import { TokenService } from 'src/app/services/token.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent {
  navItems = [
    {
      path: 'dashboard',
      icon: 'dashboard',
      label: 'Dashboard',
    },
    {
      path: 'user',
      icon: 'account_circle',
      label: 'User',
    },
    {
      path: 'admin',
      icon: 'shield_person',
      label: 'Admin',
    },
    {
      path: 'message',
      icon: 'chat',
      label: 'Message',
    },
    {
      path: 'flight',
      icon: 'travel',
      label: 'Flight',
    },
    {
      path: 'notification',
      icon: 'notifications',
      label: 'Notification',
    },
    {
      path: 'bookings',
      icon: 'airplane_ticket',
      label: 'Bookings',
    },
  ];
  constructor(
    private router: Router,
    private tokenService: TokenService,
    private userService: UserService
  ) {}

  ngOnInit() {}

  navigate(path: string) {
    this.router.navigate([path]);
  }

  logout() {
    const token = this.tokenService.getAccessToken();
    let tokenPayload;
    if (token) {
      tokenPayload = JSON.parse(atob(token.split('.')[1]));
    }
    const email = tokenPayload.email;
    console.log(tokenPayload);
    this.userService
      .logout(email)
      .pipe(
        tap(() => {
          this.tokenService.clearTokens();
          window.location.reload();
        })
      )
      .subscribe();
  }
}
