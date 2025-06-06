import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mediumDate',
  standalone: true,
})
export class MediumDatePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    return value.substring(0, 16).replace('T', ' ');
  }
}
