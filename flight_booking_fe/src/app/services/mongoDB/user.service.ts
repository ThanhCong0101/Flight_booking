import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { APIUrl } from 'src/environments/enviroment';

@Injectable({
  providedIn: 'root',
})
export class UserServiceMongoDB {
  constructor(private http: HttpClient) {}

  getUserByField(criteria: Record<string, string | number>): Observable<any> {
    const queryParams = Object.entries(criteria)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    return this.http.get<any>(`${APIUrl}/mongo/user/search?${queryParams}`);
  }

  getUserByID(_id: string): Observable<any> {
    return this.http.get<any>(`${APIUrl}/mongo/user/${_id}`);
  }

  createUser(userData: any): Observable<any> {
    return this.http.post<any>(`${APIUrl}/mongo/user/create`, userData);
  }
}
