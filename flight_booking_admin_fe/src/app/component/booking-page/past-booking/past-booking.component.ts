import {
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { ShortDatePipe } from 'src/app/pipe/short-date.pipe';
import { TimeFormatPipe } from 'src/app/pipe/time-format.pipe';
import { LegDetailComponent } from '../../common/leg-detail/leg-detail.component';
import { CommonModule, NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-past-booking',
  standalone: true,
  imports: [
    CommonModule,
    ShortDatePipe,
    TimeFormatPipe,
    NgOptimizedImage,
    LegDetailComponent,
  ],
  templateUrl: './past-booking.component.html',
  styleUrl: './past-booking.component.css',
})
export class PastBookingComponent {
  isLoading = input.required<boolean>();
  activeTab = input<'upcoming' | 'past'>();

  bookings = input.required<any[]>();
  totalBookings = input.required<number>();

  currentPageChange = output<number>();

  pageSize = input.required<number>();
  currentPage = input.required<number>();
  currentPagePastBooking = signal<number>(1);

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

  expandedIndex: number = -1;

  ngOnInit() {}

  toggleFlightDetails(index: number) {
    this.expandedIndex = this.expandedIndex === index ? -1 : index;
  }

  changePage(page: number) {
    this.currentPagePastBooking.update(() => page);
    this.currentPageChange.emit(page);
  }

  getPagesArray(): number[] {
    return Array(this.totalBookings())
      .fill(0)
      .map((_, i) => i);
  }
}
