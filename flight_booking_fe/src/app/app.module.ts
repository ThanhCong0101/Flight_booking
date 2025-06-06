import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { HomePageComponent } from './component/home-page/home-page.component';
import { PasswordResetComponent } from './component/login/password-reset/password-reset.component';
import { RegisterComponent } from './component/login/register/register.component';
import { userService } from './services/user.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { AuthInterceptor } from './interceptor/auth.interceptor';
import { EmailResetPasswordComponent } from './component/login/email-reset-password/email-reset-password.component';
import { NotFoundComponent } from './component/not-found/not-found.component';
import { FlightServiceAPI } from './services/flight.service';
import { ErrorInterceptor } from './interceptor/error.interceptor';
import { AppRoutingModule } from './app-routing.module';
import { NgClass, NgOptimizedImage, NgTemplateOutlet } from '@angular/common';
import { LoginPageComponent } from './component/login/login-page/login-page.component';
import { LoginComponent } from './component/login/login/login.component';
import { CacheInterceptor } from './interceptor/cache.interceptor';
import { RetryInterceptor } from './interceptor/retry.interceptor';
import { TokenInterceptor } from './interceptor/token.interceptor';
import { InvoiceComponent } from './component/booking/invoice/invoice.component';
import { BookingFormComponent } from './component/booking/booking-form/booking-form.component';
import { RegisterPageComponent } from './component/login/register-page/register-page.component';
import { CalendarComponent } from './component/common/calendar/calendar.component';
import { CalendarService } from './services/calender.service';
import { ClickOutsideDirective } from './directives/click-outside.directive';
import { WeekMonthDayPipe } from './pipe/week-month-day.pipe';
import { ChatBotComponent } from './component/common/chat-bot/chat-bot.component';
import { ChatBotService } from './services/chat-bot.service';
import { DynamicFormComponent } from './component/util/dynamic-form/dynamic-form.component';
import { SocketService } from './services/socket.service';
import { FlightComponent } from './component/flight/home/flight.component';

@NgModule({
  declarations: [
    AppComponent,
    HomePageComponent,
    PasswordResetComponent,
    EmailResetPasswordComponent,
    NotFoundComponent,
    LoginPageComponent,
    RegisterPageComponent,
  ],
  bootstrap: [AppComponent],
  imports: [
    FormsModule,
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    RouterModule,
    NgOptimizedImage,
    NgTemplateOutlet,
    NgClass,
    LoginComponent,
    RegisterComponent,
    InvoiceComponent,
    CalendarComponent,
    ClickOutsideDirective,
    WeekMonthDayPipe,
    ChatBotComponent,
    DynamicFormComponent,
  ],
  providers: [
    userService,
    FlightServiceAPI,
    CalendarService,
    ChatBotService,
    SocketService,
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
})
export class AppModule {}
