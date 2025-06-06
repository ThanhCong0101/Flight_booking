import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'weekMonthDay',
  standalone: true,
})
export class WeekMonthDayPipe implements PipeTransform {
  transform(dateTimeString: string): string {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }
}
