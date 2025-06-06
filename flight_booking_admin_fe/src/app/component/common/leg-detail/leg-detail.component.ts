import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  input,
  OnInit,
  Signal,
} from '@angular/core';
import { DurationFormatPipe } from 'src/app/pipe/duration-format.pipe';
import { TimeFormatPipe } from 'src/app/pipe/time-format.pipe';
export interface LayoverInfo {
  duration: string;
  layoverAirport: string;
}

const calculateDuration = (endTime: string, startTime: string): string => {
  const end = new Date(endTime);
  const start = new Date(startTime);
  const durationMs = end.getTime() - start.getTime();

  return convertMinutesToHoursAndMinutes(durationMs / (1000 * 60));
};
const convertMinutesToHoursAndMinutes = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
};

@Component({
  selector: 'app-leg-detail',
  standalone: true,
  imports: [CommonModule, DurationFormatPipe, TimeFormatPipe],
  templateUrl: './leg-detail.component.html',
  styleUrls: ['./leg-detail.component.css'],
})
export class LegDetailComponent implements OnInit {
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
  constructor() {
    effect(() => {
      console.log(this.leg());
    });
  }

  ngOnInit() {}
}
