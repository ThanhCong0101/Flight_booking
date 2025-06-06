import { CommonModule } from '@angular/common';
import {
  Component,
  effect,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { BookingService } from 'src/app/services/booking.service';

@Component({
  selector: 'app-booking-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './booking-search.component.html',
  styleUrls: ['./booking-search.component.css'],
})
export class BookingSearchComponent implements OnInit {
  searchBookingForm!: FormGroup;

  activeTab = input.required<'upcoming' | 'past'>();

  currentPageUpcoming = input.required<number>();
  currentPagePast = input.required<number>();

  pageSize = input.required<number>();

  upcomingBookingsChange = output<{
    bookings: any[];
    total: number;
    isLoading: boolean;
  }>();

  pastBookingsChange = output<{
    bookings: any[];
    total: number;
    isLoading: boolean;
  }>();

  constructor(private bookingService: BookingService, private fb: FormBuilder) {
    effect(() => {
      if (this.activeTab() === 'upcoming') {
        this.initBookingSearchForm();
      } else {
        this.initBookingSearchForm();
      }
    });
  }

  ngOnInit() {
    this.initBookingSearchForm();
    this.setUpSearch();
  }

  initBookingSearchForm() {
    this.searchBookingForm = this.fb.group({
      search: [''],
      dateFilterType: ['specific'], // default to specific date
      specificDate: [''],
      departDate: [''],
      endDate: [''],
      sortBy: [''],
      sortOrder: [''],
    });
  }

  setUpSearch() {
    this.setUpSearchByCriteria('search');
    this.setUpSearchByCriteria('specificDate');
    this.setUpSearchByCriteria('departDate');
    this.setUpSearchByCriteria('endDate');
    this.setUpSearchByCriteria('sortBy');
    this.setUpSearchByCriteria('sortOrder');
  }

  setUpSearchByCriteria(field: string) {
    this.searchBookingForm
      .get(field)!
      .valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(() => {
          console.log('change');
          let search = this.searchBookingForm.get('search')!.value;
          let specificDate = this.searchBookingForm.get('specificDate')!.value;
          let departDate = this.searchBookingForm.get('departDate')!.value;
          let endDate = this.searchBookingForm.get('endDate')!.value;
          let sortBy = this.searchBookingForm.get('sortBy')!.value;
          let sortOrder = this.searchBookingForm.get('sortOrder')!.value;
          if (this.activeTab() === 'upcoming') {
            this.upcomingBookingsChange.emit({
              bookings: [],
              total: 0,
              isLoading: true,
            });
            console.log('upcomming');
            return this.bookingService.getBookingByField(
              {
                search,
                specificDate,
                departDate,
                endDate,
                sortBy,
                activeTab: this.activeTab(),
                sortOrder,
              },
              this.currentPageUpcoming(),
              this.pageSize()
            );
          } else {
            console.log('past');
            this.pastBookingsChange.emit({
              bookings: [],
              total: 0,
              isLoading: true,
            });
            return this.bookingService.getBookingByField(
              {
                search,
                specificDate,
                departDate,
                endDate,
                sortBy,
                activeTab: this.activeTab(),
                sortOrder,
              },
              this.currentPagePast(),
              this.pageSize()
            );
          }
        })
      )
      .subscribe((booking_data) => {
        console.log('booking_data', booking_data);
        if (this.activeTab() === 'upcoming') {
          this.upcomingBookingsChange.emit({
            bookings: booking_data.bookings,
            total: Math.ceil(booking_data.total / this.pageSize()),
            isLoading: false,
          });
        } else {
          this.pastBookingsChange.emit({
            bookings: booking_data.bookings,
            total: Math.ceil(booking_data.total / this.pageSize()),
            isLoading: false,
          });
        }
      });
  }

  onSortChange(event: Event) {
    const sort = (event.target as HTMLSelectElement).value;
    if (sort === '') {
      this.searchBookingForm.get('sortOrder')!.setValue('ASC');
    }
  }
}
