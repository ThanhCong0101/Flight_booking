import { CommonModule, NgOptimizedImage } from '@angular/common';
import {
  Component,
  computed,
  effect,
  ElementRef,
  input,
  output,
  signal,
  viewChildren,
} from '@angular/core';
import { DurationFormatPipe } from 'src/app/pipe/duration-format.pipe';
import { ShortDatePipe } from 'src/app/pipe/short-date.pipe';
import { TimeFormatPipe } from 'src/app/pipe/time-format.pipe';
import { LegDetailComponent } from '../../common/leg-detail/leg-detail.component';
import { BookingDetailComponent } from '../booking-detail/booking-detail.component';

@Component({
  selector: 'app-upcomming-booking',
  standalone: true,
  imports: [
    CommonModule,
    TimeFormatPipe,
    ShortDatePipe,
    NgOptimizedImage,
    LegDetailComponent,
    BookingDetailComponent,
  ],
  templateUrl: './upcomming-booking.component.html',
  styleUrls: ['./upcomming-booking.component.css'],
})
export class UpcommingBookingComponent {
  isLoading = input.required<boolean>();
  cancelButtons = viewChildren<ElementRef<HTMLButtonElement>>('cancelBtn');
  selectedBookingId: string | null = null;
  selectedBooking: any;
  selectedFormatedDepDes: any;

  bookingsChanged = output<string>();
  BookingDetailChange = output<any>();

  bookings = input.required<any[]>();
  totalBookings = input.required<number>();
  currentPageChange = output<number>();

  pageSize = input.required<number>();
  currentPage = input.required<number>();
  currentPageUpcomingBooking = signal<number>(1);

  formatedDepDes = computed(() => {
    return this.bookings().map((booking: any) => {
      if (booking?.itinerary?.legs[0]?.segments[0]) {
        const legs = booking?.itinerary.legs;
        if (legs.length > 1) {
          let depDesTemp: string = '';
          legs.forEach((leg: any, index: number) => {
            depDesTemp +=
              `${leg.origin_iata} - ${leg.destination_iata}` +
              `${index < legs.length - 1 ? ' | ' : ''}`;
          });
          return depDesTemp;
        } else {
          return `${booking?.itinerary?.legs[0]?.origin_iata} - ${booking?.itinerary?.legs[0]?.destination_iata}`;
        }
      }
      return '';
    });
  });

  activeTab = input<'upcoming' | 'past'>();

  expandedIndex: number = -1;

  constructor() {
    effect(() => {
      const buttons = this.cancelButtons();
      buttons.forEach((button, index) => {
        // Work with each button element
        const booking_id = button.nativeElement.getAttribute('booking-id');
        button.nativeElement.addEventListener(
          'click',
          () => this.showModal(booking_id)
          // this.cancelBtn(booking_id)
        );
      });
    });
  }

  ngOnInit(): void {}

  showModal(booking_id: string | null) {
    this.selectedBookingId = booking_id;
    const modal = document.getElementById('cancel_modal') as HTMLDialogElement;
    modal.showModal();
  }

  confirmCancel() {
    if (this.selectedBookingId) {
      this.bookingsChanged.emit(this.selectedBookingId);
    }
  }

  toggleFlightDetails(index: number) {
    this.expandedIndex = this.expandedIndex === index ? -1 : index;
  }

  setSelectedBooking(booking: any, booking_id: string | null, index: number) {
    this.selectedBooking = booking;
    this.selectedBookingId = booking_id;
    this.selectedFormatedDepDes = this.formatedDepDes()[index];
  }

  bookingDetailChange(bookingData: any) {
    this.BookingDetailChange.emit({
      booking_data: {
        passengers: bookingData,
      },
      booking_id: this.selectedBookingId,
    });
  }

  changePage(page: number) {
    this.currentPageUpcomingBooking.update(() => page);
    this.currentPageChange.emit(page);
  }

  getPagesArray(): number[] {
    return Array(this.totalBookings())
      .fill(0)
      .map((_, i) => i);
  }
}
