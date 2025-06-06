import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { catchError, map, Observable, of, switchMap } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  constructor(
    private authService: AuthService,
    private router: Router,
    private tokenService: TokenService
  ) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return this.authService.isAuthenticated().pipe(
      switchMap((isAuth) => {
        console.log(isAuth);
        if (isAuth) {
          return of(true);
        }

        // Try refresh token first
        return this.authService.refreshToken().pipe(
          map((response) => {
            console.log(response);
            if (response.accessToken) {
              this.tokenService.setAccessToken(response.accessToken);
              // Successfully refreshed
              return true;
            }
            // Only redirect to login if refresh fails
            return this.router.createUrlTree(['/login']);
          }),
          catchError(() => {
            return of(this.router.createUrlTree(['/login']));
          })
        );
      })
    );
  }
}
