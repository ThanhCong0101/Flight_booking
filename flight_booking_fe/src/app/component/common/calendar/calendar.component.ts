import { CommonModule } from '@angular/common';
import {
  Component,
  effect,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import dayjs from 'dayjs';
import {
  CalendarMonth,
  CalendarService,
} from 'src/app/services/calender.service';
import { DepDes } from '../../home-page/home-page.component';
import { forkJoin } from 'rxjs';

interface PriceData {
  day: string;
  group: 'high' | 'medium' | 'low';
  price: number;
}

export interface PriceDate {
  departure: string;
  return: string;
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
})
export class CalendarComponent {
  isCalendarOpen = input.required<boolean>();
  selectedFlightType = input.required<'oneWay' | 'roundTrip'>();

  DepDesCalendar = input.required<DepDes>();

  priceDay = output<PriceDate>();

  isLoad = signal<boolean>(true);

  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'];

  currentMonthDays: PriceData[] = [];
  nextMonthDays: PriceData[] = [];

  calendarMonths: CalendarMonth[] = [];
  currentMonthIndex = 0;

  // Add these properties
  hoveredDate: string | null = null;
  startDate = signal<string>('');
  endDate = signal<string>('');

  constructor(private calendarService: CalendarService) {
    this.initCalendar();
    
    effect(
      () => {
        if (this.DepDesCalendar()?.from && this.DepDesCalendar()?.to) {
          const today = new Date();

          const fromEntityId = this.DepDesCalendar()?.from;
          const departDate = today.toISOString().split('T')[0];
          const toEntityId = this.DepDesCalendar()?.to;
          const returnDate = new Date(
            today.getFullYear(),
            today.getMonth() + 10,
            0
          )
            .toISOString()
            .split('T')[0];

          this.getPriceCalendar(
            fromEntityId,
            departDate,
            toEntityId,
            returnDate
          );
        }
      },
      {
        allowSignalWrites: true,
      }
    );
  }

  initCalendar() {
    // Initialize empty calendar first
    const today = new Date();
    this.calendarMonths = this.calendarService.generateCalendarRange(
      new Date(today.getFullYear(), today.getMonth() + 2, 0).toISOString()
    );

    this.isLoad.set(false);
  }

  getPriceCalendar(
    fromEntityId: string,
    departDate: string,
    toEntityId: string,
    returnDate: string
  ) {
    forkJoin({
      oneWay: this.calendarService.searchCalenderPrice(
        fromEntityId,
        departDate,
        toEntityId
      ),
      roundTrip: this.calendarService.searchCalenderPriceReturn(
        fromEntityId,
        departDate,
        toEntityId,
        returnDate
      ),
    }).subscribe(({ oneWay, roundTrip }) => {
      if (this.selectedFlightType() === 'roundTrip') {
        this.updateCalendar(roundTrip);
      } else {
        this.updateCalendar(oneWay);
      }
    });
    this.isLoad.set(false);
  }

  updateCalendar(response: any) {
    const priceData = response.data.flights.days;

    const thelastDayPrice = priceData[priceData.length - 1].day;

    this.calendarMonths =
      this.calendarService.generateCalendarRange(thelastDayPrice);

    this.calendarMonths = this.calendarService.mergePriceData(
      this.calendarMonths,
      priceData
    );
  }

  getPriceColorClass(
    group: 'high' | 'medium' | 'low' | 'init',
    date: string
  ): string {
    if (this.isPastDate(date)) {
      return 'text-gray-400'; // Style for past dates
    }
    const colorMap = {
      high: 'bg-red-500 text-white',
      medium: 'bg-yellow-500 text-white',
      low: 'bg-green-500 text-white',
      init: 'bg-gray-200 text-black',
    };
    return colorMap[group] || 'bg-gray-200';
  }

  // Add this method to check if date is in the past
  isPastDate(date: string): boolean {
    return new Date(date) < new Date(new Date().setHours(0, 0, 0, 0));
  }

  getPriceDate(date: string) {
    if (this.selectedFlightType() === 'roundTrip') {
      const clickedDate = new Date(date);
      if (!this.startDate() || (this.startDate() && this.endDate())) {
        this.startDate.set(date);
        this.endDate.set('');

        console.log('date 1', this.startDate(), this.endDate());
      } else {
        // Second click or hover selection
        if (clickedDate < new Date(this.startDate())) {
          // If clicked date is before start date, swap them
          this.endDate.set(this.startDate());
          this.startDate.set(date);
        } else {
          this.endDate.set(date);
        }
        console.log('date 2', this.startDate(), this.endDate());

        this.priceDay.emit({
          departure: this.startDate(),
          return: this.endDate(),
        });
      }
    } else {
      this.priceDay.emit({
        departure: date,
        return: '',
      });
    }
  }
  // Add method to handle hover states
  onDateHover(date: string) {
    if (
      this.selectedFlightType() === 'roundTrip' &&
      this.startDate() &&
      !this.endDate()
    ) {
      this.hoveredDate = date;
      console.log('hoverDate', this.hoveredDate);
    }
  }

  // Add method to check if date is in range
  isInRange(date: string): boolean {
    const currentDate = new Date(date);

    if (this.startDate() && this.endDate()) {
      const start = new Date(this.startDate());
      const end = new Date(this.endDate());
      return currentDate > start && currentDate < end;
    }

    if (!this.startDate() || !this.hoveredDate) return false;
    // Handle both forward and backward hover ranges
    const start = new Date(this.startDate());
    const hover = new Date(this.hoveredDate);

    if (hover < start) {
      return currentDate >= hover && currentDate < start;
    } else {
      return currentDate > start && currentDate <= hover;
    }
  }

  isChosenDate(date: string): boolean {
    return date === this.startDate() || date === this.endDate();
  }

  formatPrice(price: number): string {
    return `$${price.toFixed(2)}`;
  }

  get currentMonth(): CalendarMonth {
    return this.calendarMonths[this.currentMonthIndex];
  }

  get nextMonth(): CalendarMonth {
    return this.calendarMonths[this.currentMonthIndex + 1];
  }

  navigateNext() {
    if (this.currentMonthIndex < this.calendarMonths.length - 2) {
      this.currentMonthIndex++;
    }
  }

  navigatePrev() {
    if (this.currentMonthIndex > 0) {
      this.currentMonthIndex--;
    }
  }

  formatDate(dateString: string): string {
    return dayjs(dateString).format('D');
  }

  formatMonthYear(dateString: string): string {
    const date = dayjs(dateString);
    return `${date.format('YYYY')} ${date.format('MMM')}`;
  }
}
