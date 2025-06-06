import { Injectable, input } from '@angular/core';
import dayjs from 'dayjs';
import localeData from 'dayjs/plugin/localeData';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { Observable } from 'rxjs';
import { APIUrl } from 'src/environments/enviroment';
import { HttpClient } from '@angular/common/http';

dayjs.extend(customParseFormat);
dayjs.extend(localeData);

export interface GeneratedCalendarObject {
  days: number[];
  day: number;
  prevMonthDays: number[];
  remainingDays: number[];
  months: string[];
}

export interface DayPrice {
  day: string;
  group: 'high' | 'medium' | 'low' | 'init';
  price: number;
}

export interface CalendarMonth {
  monthYear: string;
  days: DayPrice[];
  prevMonthDays: Array<number>;
}

@Injectable({
  providedIn: 'root',
})
export class CalendarService {
  constructor(private http: HttpClient) {}

  generateCalendarRange(lastPriceDate: string): CalendarMonth[] {
    const startDate = dayjs();
    const endDate = dayjs(lastPriceDate);
    const months: CalendarMonth[] = [];

    let currentMonth = startDate.startOf('month');

    while (
      currentMonth.isBefore(endDate) ||
      currentMonth.isSame(endDate, 'month')
    ) {
      months.push({
        monthYear: currentMonth.format('YYYY-MM'),
        days: this.generateDaysForMonth(currentMonth),
        prevMonthDays: this.generateCalendarObject(
          currentMonth.format('YYYY-MM')
        ),
      });

      currentMonth = currentMonth.add(1, 'month');
    }

    return months;
  }

  private generateDaysForMonth(date: dayjs.Dayjs): DayPrice[] {
    const daysInMonth = date.daysInMonth();
    const days: DayPrice[] = [];

    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = date.date(i);
      days.push({
        day: currentDate.format('YYYY-MM-DD'),
        group: 'init', // This will be replaced with actual price data
        price: 0, // This will be replaced with actual price data
      });
    }

    return days;
  }

  mergePriceData(
    months: CalendarMonth[],
    priceData: DayPrice[]
  ): CalendarMonth[] {
    const priceMap = new Map(priceData.map((price) => [price.day, price]));

    return months.map((month) => ({
      ...month,
      days: month.days.map((day) => ({
        ...day,
        ...priceMap.get(day.day),
      })),
    }));
  }

  generateCalendarObject(currentDate: string) {
    const date = dayjs(currentDate);
    const firstDayOfCurrentMonth = date.startOf('month').day();
    const numOfDaysInPrevMonth = date.subtract(1, 'month').daysInMonth();

    // This creates an array of previous month days to fill the first week
    const prevMonthDays = Array.from(
      { length: firstDayOfCurrentMonth },
      (_, index) => numOfDaysInPrevMonth - index
    ).reverse();

    return prevMonthDays;
  }

  searchCalenderPrice(
    fromEntityId: string,
    departDate: string,
    toEntityId: string
  ): Observable<any> {
    return this.http.get(`${APIUrl}/flights/search/price-oneway`, {
      params: { fromEntityId, departDate, toEntityId },
    });
  }

  searchCalenderPriceReturn(
    fromEntityId: string,
    departDate: string,
    toEntityId: string,
    returnDate: string
  ): Observable<any> {
    return this.http.get(`${APIUrl}/flights/search/price-return`, {
      params: { fromEntityId, departDate, toEntityId, returnDate },
    });
  }
}
