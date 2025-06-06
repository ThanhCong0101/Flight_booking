import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { APIUrl } from 'src/environments/enviroment';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(private http: HttpClient) {}

  getDashboardMetrics(): Observable<any> {
    return this.http.get<any>(`${APIUrl}/dashboard/metrics`);
  }

  getDashboardBookingTrends(): Observable<any> {
    return this.http.get<any>(`${APIUrl}/dashboard/trends`);
  }

  getDashboardDestination(): Observable<any> {
    return this.http.get<any>(`${APIUrl}/dashboard/destinations`);
  }
}
