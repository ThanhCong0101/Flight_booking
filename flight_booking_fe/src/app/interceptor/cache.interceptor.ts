import { inject, Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
} from '@angular/common/http';
import { Observable, of, shareReplay, tap } from 'rxjs';
import { CachingService } from '../services/caching.service';

@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  // private cache = new Map<string, HttpResponse<any>>();
  constructor(private caching: CachingService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    if (request.method !== 'GET') {
      return next.handle(request);
    }

    const cachedResponse = this.caching.get(request.urlWithParams);

    if (cachedResponse instanceof HttpResponse) {
      console.log('Serving from cache:', request.urlWithParams);
      return of(cachedResponse);
    }

    return next.handle(request).pipe(
      tap((event) => {
        if (event instanceof HttpResponse) {
          console.log('Caching response for:', request.urlWithParams);
          this.caching.set(request.urlWithParams, event);
        }
      }),
      shareReplay(1)
    );
  }
}
