import { Component, ElementRef, signal, viewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { map, tap } from 'rxjs';
import { AccountPageService } from 'src/app/services/account-page.service';
import { BookingService } from 'src/app/services/booking.service';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.component.html',
  styleUrls: ['./bookings.component.css'],
})
export class BookingsComponent {
  isLoading = signal<boolean>(true);

  modifyButtonArray = viewChildren<ElementRef>('.booking-detail-drawer');

  bookings = signal<any[]>([]); // Array to store bookings
  upcomingBookings = signal<any[]>([]);
  pastBookings = signal<any[]>([]);

  pageSize = signal<number>(4);

  currentPageUpcoming = signal<number>(1);
  totalPageUpcomming = signal<number>(1);

  currentPagePast = signal<number>(1);
  totalPagePast = signal<number>(1);

  user_id: number = 0;

  activeTab: 'upcoming' | 'past' = 'upcoming';
  ticketUrl =
    'https://c8.alamy.com/comp/2AFH8GT/vector-boarding-pass-modern-airline-ticket-for-a-flight-2AFH8GT.jpg'; // or image URL

  constructor(
    private router: Router,
    private bookingService: BookingService,
    private accountPageService: AccountPageService
  ) {}

  ngOnInit(): void {
    console.log(Intl.DateTimeFormat().resolvedOptions().timeZone);

    this.accountPageService.sharedData$
      .pipe(
        map((data) => {
          this.user_id = data.user_id;
        }),
        tap(() => {
          this.setupUpcomingPastBooking();
        })
      )
      .subscribe();
  }

  setupUpcomingPastBooking() {
    this.bookingService
      .getUpcomingBookings(
        this.user_id,
        this.currentPageUpcoming(),
        this.pageSize()
      )
      .subscribe((bookingData) => {
        console.log('bookingData', bookingData);
        this.upcomingBookings.set(bookingData.bookings);
        this.totalPageUpcomming.set(
          Math.ceil(bookingData.total / this.pageSize())
        );
        this.isLoading.set(false);
      });
    this.bookingService
      .getPastBookings(this.user_id, this.currentPagePast(), this.pageSize())
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
      .removeBookingByUserIdAndBookingId(this.user_id, bookingId)
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
      .updateBokingById(bookingData.booking_id, bookingData.booking_data)
      .subscribe((booking) => {
        console.log('booking', booking);
      });
  }

  changePastBookingPage(page: number) {
    this.currentPagePast.update(() => page);
    console.log('upcoming page', page);
    this.bookingService
      .getPastBookings(this.user_id, this.currentPagePast(), this.pageSize())
      .subscribe((bookingData) => {
        console.log('bookingData', bookingData);
        this.pastBookings.set(bookingData.bookings);
      });
  }

  changeUpcomingBookingPage(page: number) {
    this.currentPageUpcoming.set(page);
    console.log('past page', page);
    this.bookingService
      .getUpcomingBookings(
        this.user_id,
        this.currentPageUpcoming(),
        this.pageSize()
      )
      .subscribe((bookingData) => {
        console.log('bookingData', bookingData);
        this.upcomingBookings.set(bookingData.bookings);
      });
  }
}
