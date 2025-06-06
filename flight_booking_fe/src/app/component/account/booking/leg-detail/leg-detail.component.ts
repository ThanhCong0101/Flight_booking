import { CommonModule } from '@angular/common';
import { Component, computed, input, Signal, signal } from '@angular/core';
import { LayoverInfo, LegInfo } from 'src/app/models/cardDetail.model';
import { DurationFormatPipe } from '../../../../pipe/duration-format.pipe';
import { TimeFormatPipe } from '../../../../pipe/time-format.pipe';
import { calculateDuration } from 'src/app/util/time';

@Component({
  selector: 'app-leg-detail',
  standalone: true,
  imports: [CommonModule, DurationFormatPipe, TimeFormatPipe],
  templateUrl: './leg-detail.component.html',
  styleUrl: './leg-detail.component.css',
})
export class LegDetailComponent {
  leg = input.required<any>();
  headerText = input<'Depart' | 'Return'>('Depart');

  layoverInfo: Signal<LayoverInfo[]> = computed(() => {
    let layoverData: LayoverInfo[] = [];
    this.leg().segments.map((segment: any, index: number, array: any[]) => {
      const arrivalAirport =
        segment.arrivalAirport.name + ' (' + segment.arrivalAirport.iata + ')';

      if (index < array.length - 1) {
        const nextSegment = array[index + 1];
        const layoverDuration = calculateDuration(
          nextSegment.depature_time,
          segment.arrival_time
        );

        layoverData.push({
          duration: layoverDuration,
          layoverAirport: arrivalAirport,
        });
      }
    });
    return layoverData;
  });
}
