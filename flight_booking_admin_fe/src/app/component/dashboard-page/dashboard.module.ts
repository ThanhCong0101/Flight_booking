import { NgModule } from '@angular/core';
import { BookingComponent } from '../booking-page/booking/booking.component';
import { AdminComponent } from './admin/admin.component';
import { FlightsComponent } from './flight-page/flights/flights.component';
import { NotificationComponent } from './notification/notification.component';
import { UserComponent } from './user/user.component';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { DurationFormatPipe } from 'src/app/pipe/duration-format.pipe';
import { ShortDatePipe } from 'src/app/pipe/short-date.pipe';
import { TimeFormatPipe } from 'src/app/pipe/time-format.pipe';
import { BookingDetailComponent } from '../booking-page/booking-detail/booking-detail.component';
import { PastBookingComponent } from '../booking-page/past-booking/past-booking.component';
import { UpcommingBookingComponent } from '../booking-page/upcomming-booking/upcomming-booking.component';
import { SidebarComponent } from '../common/sidebar/sidebar.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DashboardPageComponent } from './dashboard-page/dashboard-page.component';
import { CardFilterComponent } from './flight-page/card-filter/card-filter.component';
import { BookingSearchComponent } from '../booking-page/booking-search/booking-search.component';
import { FlightSearchComponent } from './flight-page/flight-search/flight-search.component';
import { FlightTableComponent } from './flight-page/flight-table/flight-table.component';
import { LoadingPageComponent } from '../common/loading-page/loading-page.component';
import { MessageComponent } from './message/message.component';

@NgModule({
  imports: [
    CommonModule,
    DashboardRoutingModule,
    ReactiveFormsModule,
    NgxChartsModule,
    BookingDetailComponent,
    NgOptimizedImage,
    SidebarComponent,
    UpcommingBookingComponent,
    PastBookingComponent,
    NgxChartsModule,
    FormsModule,
    DurationFormatPipe,
    TimeFormatPipe,
    ShortDatePipe,
    FlightSearchComponent,
    CardFilterComponent,
    BookingSearchComponent,
    FlightTableComponent,
    FlightTableComponent,
    LoadingPageComponent
  ],
  declarations: [
    DashboardComponent,
    UserComponent,
    AdminComponent,
    MessageComponent,
    FlightsComponent,
    NotificationComponent,
    BookingComponent,
    DashboardPageComponent,
  ],
})
export class DashboardModule {}
