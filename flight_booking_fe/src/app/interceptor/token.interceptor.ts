import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TokenService } from '../services/token.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private protectedPaths = [
    '/auto-complete',
    '/users/search',
    'bookings',
    'users/timezone',
  ];

  constructor(private tokenService: TokenService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const needsToken = this.protectedPaths.some((path) =>
      req.url.includes(path)
    );

    if (needsToken) {
      const token = this.tokenService.getAccessToken();
      req = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`),
      });
    }

    return next.handle(req);
  }
}
