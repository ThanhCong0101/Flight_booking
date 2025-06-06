import {
  LabelType,
  NgxSliderModule,
  Options,
} from '@angular-slider/ngx-slider';
import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';

@Component({
  selector: 'app-date-slider',
  standalone: true,
  imports: [CommonModule, NgxSliderModule],
  templateUrl: './date-slider.component.html',
  styleUrl: './date-slider.component.css',
})
export class DateSliderComponent {
  minTime = input<string>();
  maxTime = input<string>();

  minTimeValueChanged = output<number>();
  maxTimeValueChanged = output<number>();

  minTimeValue: number = 0;
  maxTimeValue: number = 0;

  options!: Options;

  isLoad = signal<boolean>(true);

  // Set default values if inputs are undefined
  defaultDate = new Date().toISOString();

  minTimeValueInit = computed(() => {
    console.log('minTime', this.minTime());
    if (!this.minTime()) {
      return this.minTime();
    } else {
      console.log('defaultDate', this.defaultDate);
      return this.defaultDate;
    }
  });

  maxTimeValueInit = computed(() => {
    console.log('maxTime', this.maxTime());

    if (!this.maxTime()) {
      return this.maxTime();
    } else {
      return this.defaultDate;
    }
  });

  dateRange = computed(() => {
    if (
      this.minTime() &&
      this.maxTime() &&
      this.minTime()!.length > 0 &&
      this.maxTime()!.length > 0
    ) {
      return this.createDateRange(this.minTime()!, this.maxTime()!);
    }
    return [];
  });

  constructor() {
    effect(() => {
      console.log('min Time input', this.minTime());
      console.log('max Time input', this.maxTime());
    });
  }
  ngOnInit(): void {
    if (this.dateRange().length > 0) {
      this.options = {
        floor: new Date(this.minTimeValueInit()!).getTime(),
        ceil: new Date(this.maxTimeValueInit()!).getTime(),
        stepsArray: this.dateRange().map((date: Date) => {
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

      this.minTimeValue = this.dateRange()[0].getTime();

      this.maxTimeValue =
        this.dateRange()[this.dateRange().length - 1].getTime();

      this.isLoad.set(false);
    }
  }
  onChange(event: any): void {
    this.minTimeValueChanged.emit(this.minTimeValue);
    this.maxTimeValueChanged.emit(this.maxTimeValue);
  }

  createDateRange(minDateInput: string, maxDateInput: string) {
    const minDate = new Date(minDateInput);
    const maxDate = new Date(maxDateInput);

    const range: Date[] = [];
    let current = new Date(minDate);

    while (current <= maxDate) {
      range.push(new Date(current));
      current.setMinutes(current.getMinutes() + 1); // 15-minute intervals
    }

    return range;
  }
}
