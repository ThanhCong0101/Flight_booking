import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileComponent } from './profile/profile.component';
import { BookingsComponent } from './booking/bookings/bookings.component';
import { BookingDetailComponent } from './booking/booking-detail/booking-detail.component';
import { AccountComponent } from './account/account.component';
import { PaymentsComponent } from './payments/payments.component';
import { RoleGuard } from 'src/app/guard/role.guard';
import { AuthGuard } from 'src/app/guard/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: AccountComponent,
    canActivate: [RoleGuard, AuthGuard],
    data: {
      expectedRole: ['user' , 'admin'],
    },
    children: [
      {
        path: '',
        redirectTo: 'profile',
        pathMatch: 'full',
      },
      {
        path: 'profile',
        component: ProfileComponent,
      },
      {
        path: 'bookings',
        component: BookingsComponent
      },
      {
        path: 'payment-methods',
        component: PaymentsComponent,
      },
    ],
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  declarations: [],
  exports: [RouterModule],
})
export class AccountRoutingModule {}
