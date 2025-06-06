import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from './component/home-page/home-page.component';
import { RegisterComponent } from './component/login/register/register.component';
import { PasswordResetComponent } from './component/login/password-reset/password-reset.component';
import { EmailResetPasswordComponent } from './component/login/email-reset-password/email-reset-password.component';
import { NotFoundComponent } from './component/not-found/not-found.component';
import { AuthGuard } from './guard/auth.guard';
import { BookingFormComponent } from './component/booking/booking-form/booking-form.component';
import { LoginPageComponent } from './component/login/login-page/login-page.component';
import { LoginGuard } from './guard/login.guard';
import { InvoiceComponent } from './component/booking/invoice/invoice.component';
import { RegisterPageComponent } from './component/login/register-page/register-page.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: HomePageComponent,
  },
  {
    path: 'flight',
    loadChildren: () =>
      import('./component/flight/flight.module').then((m) => m.FlightModule),
  },
  {
    path: 'account',
    loadChildren: () =>
      import('./component/account/account.module').then((m) => m.AccountModule),
  },
  {
    path: 'booking',
    component: BookingFormComponent,
  },
  {
    path: 'invoice',
    component: InvoiceComponent,
  },
  {
    path: 'login',
    component: LoginPageComponent,
    canActivate: [LoginGuard],
  },
  {
    path: 'register',
    component: RegisterPageComponent,
    canActivate: [LoginGuard],
  },
  {
    path: 'password-reset',
    component: PasswordResetComponent,
  },
  {
    path: 'email-reset-password',
    component: EmailResetPasswordComponent,
  },
  {
    path: '**',
    component: NotFoundComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
