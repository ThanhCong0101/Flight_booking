import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private readonly ACCESS_TOKEN_KEY = 'accessToken';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';

  setAccessToken(accessToken: string): void {
    sessionStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
  }

  getAccessToken(): string | null {
    return sessionStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  clearAccessToken(): void {
    sessionStorage.removeItem(this.ACCESS_TOKEN_KEY);
  } 

  clearTokens(): void {
    sessionStorage.removeItem(this.ACCESS_TOKEN_KEY);

    // Clear refresh token cookie by setting expired date
    document.cookie = `refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
}
