import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, map, of, switchMap, tap } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';

@Injectable({
  providedIn: 'root',
})
export class LoginGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private tokenService: TokenService
  ) {}

  canActivate(): Observable<boolean> {
    console.log('login guard');
    return this.authService.isAuthenticated().pipe(
      map((isAuth) => isAuth),
      switchMap((isAccessTokenValid) => {
        console.log('isAccessTokenValid', isAccessTokenValid);

        if (isAccessTokenValid) {
          return this.authService.isRefreshTokenExpired().pipe(
            switchMap((isExpired) => {
              console.log('isExpired', isExpired);
              if (!isExpired) {
                return this.authService.refreshToken().pipe(
                  map((response) => {
                    console.log('response', response);
                    this.tokenService.setAccessToken(response.accessToken);
                    // User has valid refresh token, redirect to home
                    this.router.navigate(['/dashboard']);
                    return false;
                  })
                );
              }
              // No valid refresh token, allow access to login page
              return of(true);
            })
          );
        }
        return of(true);
      })
    );
  }
}
