import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { APIUrl } from 'src/environments/enviroment';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  constructor(private http: HttpClient) {}

  getAllBookings(page: number = 1, limit: number = 10): Observable<any> {
    return this.http.get<any>(`${APIUrl}/bookings?page=${page}&limit=${limit}`);
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

  getBookingById(bookingId: string): Observable<any> {
    return this.http.get<any>(`${APIUrl}/bookings/${bookingId}`);
  }

  getBookingByField(
    criteria: Record<string, string | number>,
    page: number = 1,
    limit: number = 10
  ): Observable<any> {
    return this.http.get<any>(`${APIUrl}/bookings/search`, {
      params: criteria,
    });
  }

  getBookingByUserId(userId: string | number): Observable<any[]> {
    return this.http.get<any[]>(`${APIUrl}/bookings/user/${userId}`);
  }

  checkAvailabilitySeat(itineraryId: string): Observable<any> {
    return this.http.get<any>(
      `${APIUrl}/bookings/availability-seat/${itineraryId}`
    );
  }

  bookingPending(bookingData: {
    itinerary_id: string;
    user_id: string;
  }): Observable<any> {
    return this.http.post<any>(
      `${APIUrl}/bookings/booking-pending`,
      bookingData
    );
  }

  addNewPassenger(bookingId: string): Observable<any> {
    return this.http.patch<any>(`${APIUrl}/bookings/add-new-passenger`, {
      booking_id: bookingId,
    });
  }

  createBooking(bookingDetail: {
    itinerary_id: string;
    user_id: string;
    booking_id: string;
    passenger_data: any[];
  }): Observable<any> {
    return this.http.post<any>(`${APIUrl}/bookings`, bookingDetail);
  }

  removeBookingByUserIdAndBookingId(user_id: number, booking_id: string) {
    return this.http.delete<any>(`${APIUrl}/bookings/${booking_id}`);
  }

  updateBooking(bookingId: string, bookingData: any): Observable<any> {
    return this.http.put<any>(`${APIUrl}/bookings/${bookingId}`, bookingData);
  }

  deleteBooking(bookingId: string): Observable<any> {
    return this.http.delete<any>(`${APIUrl}/bookings/${bookingId}`);
  }

  deleteBookingPending(bookingId: string): Observable<any> {
    return this.http.delete<any>(`${APIUrl}/bookings/pending/${bookingId}`);
  }

  deletePassengerPendingBooking(bookingId: string): Observable<any> {
    return this.http.delete<any>(
      `${APIUrl}/bookings/remove-passenger/${bookingId}`
    );
  }
}
