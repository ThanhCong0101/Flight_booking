import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './component/authentication/login/login.component';
import { LoginGuard } from './guard/login.guard';

const routes: Routes = [
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./component/dashboard-page/dashboard.module').then(
        (m) => m.DashboardModule
      ),
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [LoginGuard],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
