import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { DurationFormatPipe } from '../../../../pipe/duration-format.pipe';

@Component({
  selector: 'app-flight-table',
  standalone: true,
  imports: [CommonModule, DurationFormatPipe],
  templateUrl: './flight-table.component.html',
  styleUrls: ['./flight-table.component.css'],
})
export class FlightTableComponent implements OnInit {
  data = input.required<any>({});
  isLoading = input.required<boolean>();

  searchType = computed(() => this.data().searchType);
  flightData = computed(() => {
    if (this.searchType() === 'flight') {
      return this.data().data;
    }
    return [];
  });
  itineraryData = computed(() => {
    if (this.searchType() === 'itinerary') {
      return this.data().data;
    }
    return [];
  });

  totalPage = computed(() => this.data().totalPage);

  currentPage = signal<number>(1);
  pageSize = signal<number>(5);

  flightPageChange = output<number>();
  itineraryPageChange = output<number>();

  constructor() {
    effect(() => {
      console.log('data table:', this.data());
    });
  }

  ngOnInit() {}

  changePage(page: number) {
    this.currentPage.set(page);
    if (this.searchType() === 'flight') {
      this.flightPageChange.emit(page);
    } else if (this.searchType() === 'itinerary') {
      this.itineraryPageChange.emit(page);
    }
  }

  getVisiblePages(): number[] {
    const current = this.currentPage();
    const total = this.totalPage();

    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    if (current <= 3) {
      return [1, 2, 3, 4, 5];
    }

    if (current >= total - 2) {
      return [total - 4, total - 3, total - 2, total - 1, total];
    }

    return [current - 1, current, current + 1];
  }
}
