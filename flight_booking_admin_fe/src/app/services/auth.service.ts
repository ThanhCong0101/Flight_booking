import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { Router } from '@angular/router';
import { TokenService } from './token.service';
import { APIUrl } from 'src/environments/enviroment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    private router: Router
  ) {}

  sendEmailResetPassword(userEmail: string): Observable<any> {
    console.log('sendEmailResetPassword', userEmail);
    return this.http.post<any>(`${APIUrl}/auth/request-password-reset`, {
      email: userEmail,
    });
  }

  validateToken(token: string): Observable<any> {
    return this.http.post<any>(`${APIUrl}/auth/password/edit`, {
      token: token,
    });
  }

  resetPassword(token: string, password: string): Observable<any> {
    return this.http.post<any>(`${APIUrl}/auth/reset-password`, {
      token: token,
      password: password,
    });
  }

  isAuthenticated(): Observable<boolean> {
    const token = this.tokenService.getAccessToken();

    if (!token) {
      return of(false);
    }
    // Check token expiration
    const tokenPayload = JSON.parse(atob(token.split('.')[1]));

    const isTokenValid = tokenPayload.email ? true : false;
    return of(isTokenValid);
  }

  isTokenExpired(): boolean {
    const token = this.tokenService.getAccessToken();
    if (!token) return true;

    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
    return Date.now() >= tokenPayload.exp * 1000;
  }

  refreshToken(): Observable<any> {
    return this.http.post(
      `${APIUrl}/auth/refresh`,
      {},
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${this.tokenService.getAccessToken()}`,
        },
      }
    );
  }

  isRefreshTokenExpired(): Observable<boolean> {
    return this.http
      .get<any>(`${APIUrl}/auth/check-refresh-token`, {
        withCredentials: true,
      })
      .pipe(
        map((response) => {
          console.log(response);
          if (response.expired) {
            // this.tokenService.clearTokens();
            // this.router.navigate(['/login']);
            return true;
          }
          return false;
        }),
        catchError(() => {
          // this.tokenService.clearTokens();
          // this.router.navigate(['/login']);
          return of(true);
        })
      );
  }

  getDataFromAccessToken(): Observable<any> {
    const token = this.tokenService.getAccessToken();
    if (!token) {
      return of(null);
    }
    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
    return of(tokenPayload);
  }

  updateUserPassword(password: string, user_id: string) {
    return this.http.patch<any>(`${APIUrl}/auth/password/reset`, {
      password: password,
      user_id: user_id,
    });
  }
}
