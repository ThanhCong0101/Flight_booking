import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BookingService } from './services/booking.service';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { LoginComponent } from './component/authentication/login/login.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthInterceptor } from './interceptor/auth.interceptor';
import { CacheInterceptor } from './interceptor/cache.interceptor';
import { ErrorInterceptor } from './interceptor/error.interceptor';
import { RetryInterceptor } from './interceptor/retry.interceptor';
import { TokenInterceptor } from './interceptor/token.interceptor';
import { FlightService } from './services/flight.service';
import { AuthService } from './services/auth.service';
import { CachingService } from './services/caching.service';
import { DashboardService } from './services/dashboard.service';
import { FlightSearchService } from './services/flightSearch.service';
import { TimezoneService } from './services/timezone.service';
import { UserService } from './services/user.service';
import { UserServiceMongoDB } from './services/mongoDB/user.service';
import { TokenService } from './services/token.service';
import { RoomService } from './services/mongoDB/room.service';
import { MessageService } from './services/mongoDB/message.service';

@NgModule({
  declarations: [AppComponent, LoginComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    RouterModule,
  ],
  providers: [
    BookingService,
    FlightService,
    AuthService,
    BookingService,
    CachingService,
    DashboardService,
    FlightSearchService,
    TimezoneService,
    TokenService,
    UserService,
    RoomService,
    UserServiceMongoDB,
    MessageService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CacheInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: RetryInterceptor,
      multi: true,
    },
    provideHttpClient(withInterceptorsFromDi()),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
