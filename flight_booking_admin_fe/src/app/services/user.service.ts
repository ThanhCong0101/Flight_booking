import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserModel } from '../models/user.model';
import { query } from '@angular/animations';
import { User } from '../component/dashboard-page/user/user.component';
import { APIUrl } from 'src/environments/enviroment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) {}

  getAllUsers(page: number = 1, limit: number = 10): Observable<any> {
    return this.http.get<any>(`${APIUrl}/users`, {
      params: { page, limit },
    });
  }

  searchUsers(
    criteria: Record<string, string | number>
  ): Observable<UserModel[]> {
    return this.http.get<UserModel[]>(`${APIUrl}/users/search`, {
      params: criteria,
    });
  }

  searchUserByEmailOrFullname(
    query: string,
    page: number = 1,
    limit: number = 10
  ): Observable<User[]> {
    return this.http.get<User[]>(`${APIUrl}/users/search/users`, {
      params: { query, page, limit },
    });
  }

  searchUserByRole(
    role: string,
    page: number = 1,
    limit: number = 10
  ): Observable<User[]> {
    return this.http.get<User[]>(`${APIUrl}/users/search/role`, {
      params: { role, page, limit },
    });
  }

  getUserById(userId: string): Observable<UserModel> {
    return this.http.get<UserModel>(`${APIUrl}/users/${userId}`);
  }

  createUser(userData: UserModel): Observable<UserModel> {
    return this.http.post<UserModel>(`${APIUrl}/users`, userData);
  }

  updateUserByEmail(
    email: string,
    userData: Partial<UserModel>
  ): Observable<UserModel> {
    return this.http.patch<UserModel>(`${APIUrl}/users`, userData, {
      params: { email },
    });
  }

  updateUserTimezone(timezone: string): Observable<UserModel> {
    return this.http.patch<UserModel>(`${APIUrl}/users/timezone`, {
      timezone,
    });
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.delete<any>(`${APIUrl}/users/${userId}`);
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
}
