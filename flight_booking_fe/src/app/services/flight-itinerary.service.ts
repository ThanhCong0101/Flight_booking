import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { APIUrl } from 'src/environments/enviroment';

@Injectable({
  providedIn: 'root',
})
export class FlightItineraryService {
  constructor(private http: HttpClient) {}

  getFlightItinerarybyID(itinerary_id: any): Observable<any> {
    return this.http.get<any>(`${APIUrl}/flightsItinerary/${itinerary_id}`);
  }
}
