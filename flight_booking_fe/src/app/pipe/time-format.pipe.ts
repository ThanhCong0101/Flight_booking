import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeFormat',
  standalone: true,
})
export class TimeFormatPipe implements PipeTransform {
  transform(dateTime: string | number): string {
    const date = new Date(dateTime);
    return date
      .toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
      .toUpperCase();
  }
}
