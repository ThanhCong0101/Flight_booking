import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { UserModel } from '../models';
import { APIUrl } from 'src/environments/enviroment';

@Injectable()
export class userService {
  public $refreshToken = new Subject<boolean>();
  public $refreshTokenReceived = new Subject<boolean>();
  constructor(private http: HttpClient) {}

  validateEmail(email: string): Observable<boolean> {
    console.log('Trigger API call');
    return this.checkEmailExists(email).pipe(
      map((user: UserModel) => !!user),
      catchError((error) => {
        console.log(error);
        return of(false);
      })
    );
  }

  checkEmailExists(email: string): Observable<UserModel> {
    return this.http.get<UserModel>(`${APIUrl}/users/search`, {
      params: { email: email },
    });
  }

  register(user: UserModel): Observable<any> {
    return this.http.post<UserModel>(`${APIUrl}/auth/register`, user);
  }

  login(user: UserModel): Observable<any> {
    return this.http.post(`${APIUrl}/auth/login`, user, {
      withCredentials: true,
    });
  }

  logout(email: string): Observable<any> {
    return this.http.post(`${APIUrl}/auth/logout`, email, {
      withCredentials: true,
    });
  }

  getUserByEmail(email: string) {
    return this.http.get<UserModel>(`${APIUrl}/users/search`, {
      params: { email: email },
    });
  }

  updateUser(email: string, user: any): Observable<any> {
    console.log(email);
    return this.http.patch<any>(`${APIUrl}/users`, user, {
      params: { email: email },
    });
  }

  updateTimezonePreference(timezone: string): Observable<any> {
    return this.http.patch(`${APIUrl}/users/timezone`, { timezone });
  }
}
