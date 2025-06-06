import { Component, ElementRef, signal, viewChildren } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { BookingSearchData } from 'src/app/models/booking.model';
import { BookingService } from 'src/app/services/booking.service';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css'],
})
export class BookingComponent {
  isLoading = signal<boolean>(true);

  modifyButtonArray = viewChildren<ElementRef>('.booking-detail-drawer');

  bookings = signal<any[]>([]); // Array to store bookings
  upcomingBookings = signal<any[]>([]);
  pastBookings = signal<any[]>([]);

  pageSize = signal<number>(10);

  currentPageUpcoming = signal<number>(1);
  totalPageUpcomming = signal<number>(1);

  currentPagePast = signal<number>(1);
  totalPagePast = signal<number>(1);

  user_id: number = 0;

  activeTab = signal<'upcoming' | 'past'>('upcoming');
  ticketUrl =
    'https://c8.alamy.com/comp/2AFH8GT/vector-boarding-pass-modern-airline-ticket-for-a-flight-2AFH8GT.jpg'; // or image URL

  successMessages: string[] = [];
  errorMessages: string[] = [];

  constructor(private router: Router, private bookingService: BookingService) {}

  ngOnInit(): void {
    this.setUpUpcomingPastBookings();
  }

  setUpUpcomingPastBookings() {
    this.isLoading.set(true);

    this.bookingService
      .getUpcomingBookings(0, this.currentPageUpcoming(), this.pageSize())
      .subscribe((bookingData) => {
        console.log('bookingData', bookingData);
        this.upcomingBookings.set(bookingData.bookings);
        this.totalPageUpcomming.set(
          Math.ceil(bookingData.total / this.pageSize())
        );
        this.isLoading.set(false);
      });
    this.bookingService
      .getPastBookings(0, this.currentPagePast(), this.pageSize())
      .subscribe((bookingData) => {
        this.pastBookings.set(bookingData.bookings);
        this.totalPagePast.set(Math.ceil(bookingData.total / this.pageSize()));
        this.isLoading.set(false);
      });
  }

  downloadTicket() {
    // Implementation for downloading the ticket
    window.open(this.ticketUrl, '_blank');
  }

  deleteBooking(bookingId: string) {
    console.log('bookingId', bookingId);
    this.bookingService
      .removeBookingByUserIdAndBookingId(13, bookingId)
      .subscribe((res) => {
        if (res.status == 200) {
          this.bookings.set(
            this.bookings().filter(
              (booking) => parseInt(booking.booking_id) !== parseInt(bookingId)
            )
          );
          console.log(this.bookings());
        }
      });
  }

  bookingDetailChange(bookingData: any) {
    console.log('bookingData', bookingData);
    this.bookingService
      .updateBooking(bookingData.booking_id, bookingData.booking_data)
      .subscribe((booking) => {
        console.log('booking', booking);
        this.showSuccessToast('Booking detail Change');
      });
  }

  changePastBookingPage(page: number) {
    this.currentPagePast.update(() => page);
    console.log('page', page);
    this.bookingService
      .getPastBookings(0, this.currentPagePast(), this.pageSize())
      .subscribe((bookingData) => {
        console.log('bookingData', bookingData);
        this.pastBookings.set(bookingData.bookings);
      });
  }

  changeUpcomingBookingPage(page: number) {
    this.currentPageUpcoming.set(page);
    console.log('page', page);
    this.bookingService
      .getUpcomingBookings(0, this.currentPageUpcoming(), this.pageSize())
      .subscribe((bookingData) => {
        console.log('bookingData', bookingData);
        this.upcomingBookings.set(bookingData.bookings);
      });
  }

  changeActiveTab(tab: 'upcoming' | 'past') {
    this.activeTab.set(tab);
  }

  upcomingBookingsChange(upcomingBookingsData: BookingSearchData) {
    this.upcomingBookings.set(upcomingBookingsData.bookings);
    this.totalPageUpcomming.set(upcomingBookingsData.total);
    this.isLoading.set(upcomingBookingsData.isLoading);
  }
  pastBookingsChange(pastBookingData: BookingSearchData) {
    this.pastBookings.set(pastBookingData.bookings);
    this.totalPagePast.set(pastBookingData.total);
    this.isLoading.set(pastBookingData.isLoading);
  }

  showSuccessToast(message: string) {
    this.successMessages.push(message);
    setTimeout(() => {
      this.successMessages.pop();
    }, 3000);
  }

  showErrorToast(message: string) {
    this.errorMessages.push(message);
    setTimeout(() => {
      this.errorMessages.pop();
    }, 3000);
  }
}
