import { Pipe, PipeTransform } from '@angular/core';
import { formatInTimeZone } from 'date-fns-tz';

@Pipe({
  name: 'userTimezone',
  standalone: true,
})
export class UserTimezonePipe implements PipeTransform {
  constructor() {}
  transform(date: Date | string, format: string = 'yyyy-MM-dd HH:mm'): string {
    const userTimezone =
      localStorage.getItem('userTimezone') ||
      Intl.DateTimeFormat().resolvedOptions().timeZone;
    return formatInTimeZone(new Date(date), userTimezone, format);
  }
}
