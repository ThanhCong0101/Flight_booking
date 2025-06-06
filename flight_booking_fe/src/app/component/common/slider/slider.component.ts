import {
  LabelType,
  NgxSliderModule,
  Options,
} from '@angular-slider/ngx-slider';
import { CommonModule } from '@angular/common';
import { Component, computed, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-slider',
  standalone: true,
  imports: [CommonModule, NgxSliderModule],
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.css',
})
export class SliderComponent {
  min = input.required<number>();
  max = input.required<number>();
  label = input.required<string>();

  dataChange = output<number>();

  value = signal<number>(0);
  options!: Options;

  ngOnInit(): void {
    const dateRange = computed(() => this.createRange());

    this.value.set(this.max());
    this.options = {
      stepsArray: dateRange().map((data: number) => {
        return { value: data };
      }),
      translate: (value: number, label: LabelType): string => {
        return this.label() + value;
      },
      showSelectionBar: true,
    };
  }

  onChange() {
    this.dataChange.emit(this.value());
  }

  createRange() {
    let min = this.min();
    const max = this.max();

    const range: number[] = [];

    while (min <= max) {
      range.push(min);
      min = min + 10;
    }
    return range;
  }
}
