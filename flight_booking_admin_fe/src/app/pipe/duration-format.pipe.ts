import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'durationFormat',
  pure: true,
  standalone: true,
})
export class DurationFormatPipe implements PipeTransform {
  transform(durationInMinutes: number | string): string {
    if (typeof durationInMinutes === 'string') {
      durationInMinutes = parseInt(durationInMinutes, 10);
    }
    const hours = Math.floor(durationInMinutes / 60);
    const minutes = durationInMinutes % 60;

    if (minutes === 0) {
      return `${hours}h`;
    }

    return `${hours}h${minutes.toString().padStart(2, '0')}m`;
  }
}
