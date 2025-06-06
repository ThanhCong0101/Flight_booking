import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { APIUrl } from 'src/environments/enviroment';


@Injectable({
  providedIn: 'root',
})
export class BookingService {
  constructor(private http: HttpClient) {}

  createBooking(bookingData: any): Observable<any> {
    return this.http.post<any>(`${APIUrl}/bookings`, bookingData);
  }

  getBookingById(bookingId: number): Observable<any> {
    return this.http.get<any>(`${APIUrl}/bookings/${bookingId}`);
  }

  getBookingByUserId(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${APIUrl}/bookings/user/${userId}`);
  }

  getUpcomingBookings(
    user_id: string | number,
    page: number = 1,
    limit: number = 10
  ): Observable<any> {
    return this.http.get<any>(
      `${APIUrl}/bookings/upcoming/${user_id}?page=${page}&limit=${limit}`
    );
  }

  getPastBookings(
    user_id: string | number,
    page: number = 1,
    limit: number = 10
  ): Observable<any> {
    return this.http.get<any>(
      `${APIUrl}/bookings/past/${user_id}?page=${page}&limit=${limit}`
    );
  }

  availabilitySeat(itinerary_id: string, token: string) {
    return this.http.get<any>(
      `${APIUrl}/bookings/availability-seat/${itinerary_id}?token=${token}`
    );
  }

  bookingPending(booking_data: any) {
    return this.http.post<any>(
      `${APIUrl}/bookings/booking-pending?token=${'adgf'}`,
      booking_data
    );
  }

  updateNewPassenger(bookingId: string | number) {
    return this.http.patch<any>(`${APIUrl}/bookings/add-new-passenger`, {
      booking_id: bookingId,
    });
  }

  updateBokingById(booking_id: string, bookingData: any): Observable<any> {
    return this.http.put<any>(
      `${APIUrl}/bookings/${booking_id}`,
      bookingData
    );
  }

  removeBookingByUserIdAndBookingId(user_id: number, booking_id: string) {
    return this.http.delete<any>(`${APIUrl}/bookings/${booking_id}`);
  }

  removeBookingPending(booking_id: string | number) {
    return this.http.delete<any>(
      `${APIUrl}/bookings/pending/${booking_id}`
    );
  }

  removePassengerBookingPending(booking_id: string | number) {
    return this.http.delete<any>(
      `${APIUrl}/bookings/remove-passenger/${booking_id}`
    );
  }
}
