import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { APIUrl } from 'src/environments/enviroment';

@Injectable({
  providedIn: 'root',
})
export class PassengerService {
  constructor(private http: HttpClient) {}

  getPassengerByUserId(userId: string) {
    return this.http.get<any>(`${APIUrl}/passengers/search`, {
      params: { user_id: userId },
    });
  }

  getPassengerRecentByUserId(userId: string) {
    return this.http.get<any>(`${APIUrl}/passengers/recent/${userId}}`);
  }

  createPassenger(passengerData: any) {
    return this.http.post<any>(`${APIUrl}/passengers`, passengerData);
  }

  updatePassenger(passengerId: string, passengerData: any) {
    return this.http.patch<any>(
      `${APIUrl}/passengers/${passengerId}`,
      passengerData
    );
  }
}
