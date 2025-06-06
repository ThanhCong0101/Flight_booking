import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import {
  OneWaySearchParams,
  RoundTripSearchParams,
} from '../models/flightService.model';
import { TokenService } from './token.service';
import { APIUrl } from 'src/environments/enviroment';

@Injectable()
export class FlightServiceAPI {
  constructor(private http: HttpClient, private tokenService: TokenService) {}

  getLocations(location: string): Observable<any> {
    console.log('API call initiated for:', location);
    const token = this.tokenService.getAccessToken();
    const results = this.http.get<any>(
      `${APIUrl}/flights/search/auto-complete`,
      {
        params: { keyword: location },
      }
    );

    return results.pipe(
      tap((data) => console.log('API response received:', data))
    );
  }

  searchOneWay(params: OneWaySearchParams): Observable<any> {
    const url = `${APIUrl}/flights/search/one-way`;

    const httpParams = new HttpParams({
      fromObject: params as unknown as { [key: string]: string },
    });

    return this.http.get<any>(url, { params: httpParams }).pipe(
      catchError((error) => {
        console.error('An error occurred:', error);
        return throwError(
          () => new Error('Something went wrong; please try again later.')
        );
      })
    );
  }

  searchRoundTrip(params: RoundTripSearchParams): Observable<any> {
    const url = `${APIUrl}/flights/search/round-trip`;

    const httpsParams = new HttpParams({
      fromObject: params as unknown as { [key: string]: string },
    });

    return this.http.get<any>(url, { params: httpsParams }).pipe(
      catchError((error) => {
        console.error('An error occurred:', error);
        return throwError(
          () => new Error('Something went wrong; please try again later.')
        );
      })
    );
  }

  searchDetail(itineraryId: string, token: string): Observable<any> {
    const url = `${APIUrl}/flights/search/detail`;
    const params = {
      itineraryId,
      token,
    };

    return this.http.get<any>(url, { params });
  }
}
