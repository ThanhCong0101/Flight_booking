import { RouterModule, Routes } from '@angular/router';
import { FlightComponent } from './home/flight.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DetailComponent } from './detail/detail.component';

const routes: Routes = [
  {
    path: '',
    component: FlightComponent,
    children: [
      {
        path: 'detail',
        component: DetailComponent,
      },
    ],
  },
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [],
  exports: [RouterModule],
})
export class FlightRoutingModule {}
