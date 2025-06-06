import { Component, input, Input } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { LegInfo } from 'src/app/models/cardDetail.model';
import { TimeFormatPipe } from '../../../pipe/time-format.pipe';
import { DurationFormatPipe } from '../../../pipe/duration-format.pipe';
import { WeekMonthDayPipe } from '../../../pipe/week-month-day.pipe';

@Component({
  selector: 'app-card-detail-leg',
  standalone: true,
  imports: [
    CommonModule,
    NgOptimizedImage,
    TimeFormatPipe,
    DurationFormatPipe,
    WeekMonthDayPipe,
  ],
  templateUrl: './card-detail-leg.component.html',
  styleUrl: './card-detail-leg.component.css',
})
export class CardDetailLegComponent {
  @Input() legInfo: LegInfo | undefined;
  isLoading = input<boolean>(false);
  headerText = input<'Depart' | 'Return'>('Depart');
  constructor() {}

  ngOnInit() {
  }

  toggleDetail(index: number) {
    this.legInfo!.isDetailSegmentAmenities[index] =
      !this.legInfo!.isDetailSegmentAmenities[index];
  }
}
