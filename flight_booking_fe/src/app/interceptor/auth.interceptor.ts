import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { catchError, Observable, switchMap, tap, throwError } from 'rxjs';
import { TokenService } from '../services/token.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private tokenService: TokenService,
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    console.log('AuthInterceptor');
    return next.handle(request).pipe(
      catchError((error) => {
        if (error.status === 401 && this.authService.isTokenExpired()) {
          console.log('Token expired, refreshing...');
          return this.authService.refreshToken().pipe(
            switchMap((response) => {
              // Update access token
              this.tokenService.setAccessToken(response.accessToken);

              // Retry original request with new token
              const newReq = request.clone({
                headers: request.headers.set(
                  'Authorization',
                  `Bearer ${response.accessToken}`
                ),
              });
              return next.handle(newReq);
            })
          );
        }

        return throwError(() => error);
      })
    );
  }
}
