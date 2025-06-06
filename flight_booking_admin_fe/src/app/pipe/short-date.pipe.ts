import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shortDate',
  standalone: true,
})
export class ShortDatePipe implements PipeTransform {
  transform(dateTimeString: string): string {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }
}
