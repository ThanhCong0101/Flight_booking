import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UserComponent } from './user/user.component';
import { AdminComponent } from './admin/admin.component';
import { FlightsComponent } from './flight-page/flights/flights.component';
import { NotificationComponent } from './notification/notification.component';
import { BookingComponent } from '../booking-page/booking/booking.component';
import { DashboardPageComponent } from './dashboard-page/dashboard-page.component';
import { AuthGuard } from 'src/app/guard/auth.guard';
import { RoleGuard } from 'src/app/guard/role.guard';
import { MessageComponent } from './message/message.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardPageComponent,
    canActivate: [RoleGuard, AuthGuard],
    data: {
      expectedRole: 'admin',
    },
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
      {
        path: 'user',
        component: UserComponent,
      },
      {
        path: 'admin',
        component: AdminComponent,
      },
      {
        path: 'message',
        component: MessageComponent,
      },
      {
        path: 'flight',
        component: FlightsComponent,
      },
      {
        path: 'notification',
        component: NotificationComponent,
      },
      {
        path: 'bookings',
        component: BookingComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  declarations: [],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
