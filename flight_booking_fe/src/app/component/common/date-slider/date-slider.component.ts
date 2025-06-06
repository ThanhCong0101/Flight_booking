import {
  LabelType,
  NgxSliderModule,
  Options,
} from '@angular-slider/ngx-slider';
import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-date-slider',
  standalone: true,
  imports: [CommonModule, NgxSliderModule],
  templateUrl: './date-slider.component.html',
  styleUrl: './date-slider.component.css',
})
export class DateSliderComponent {
  minTime = input.required<string>();
  maxTime = input.required<string>();

  minTimeValueChanged = output<number>();
  maxTimeValueChanged = output<number>();

  minTimeValue: number = 0;
  maxTimeValue: number = 0;

  options!: Options;

  ngOnInit(): void {
    const dateRange = computed(() => this.createDateRange());

    this.minTimeValue = dateRange()[0].getTime();

    this.maxTimeValue = dateRange()[dateRange().length - 1].getTime();

    this.options = {
      stepsArray: dateRange().map((date: Date) => {
        return { value: date.getTime() };
      }),
      translate: (value: number, label: LabelType): string => {
        const date = new Date(value);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');

        return `${day}/${month} - ${hours}:${minutes}`;
      },
      hideLimitLabels: true,
      hidePointerLabels: false,
      draggableRange: true,
      enforceRange: false,
      enforceStep: true,
      noSwitching: true,
    };
  }
  onChange(event: any): void {
    this.minTimeValueChanged.emit(this.minTimeValue);
    this.maxTimeValueChanged.emit(this.maxTimeValue);
  }

  createDateRange() {
    const minDate = new Date(this.minTime());
    const maxDate = new Date(this.maxTime());

    const range: Date[] = [];
    let current = new Date(minDate);

    while (current <= maxDate) {
      range.push(new Date(current));
      current.setMinutes(current.getMinutes() + 1); // 15-minute intervals
    }

    return range;
  }
}
