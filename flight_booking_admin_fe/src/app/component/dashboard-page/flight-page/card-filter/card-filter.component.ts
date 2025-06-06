import {
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Airlines,
  FilterStats,
  Location,
  PriceRange,
  Stop,
  TimeRange,
} from 'src/app/models/cardFilter.model';
import { debounceTime, distinctUntilChanged, filter, skip } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { DateSliderComponent } from 'src/app/component/common/date-slider/date-slider.component';
import { SliderComponent } from 'src/app/component/common/slider/slider.component';
import { convertTimestampToISOString } from 'src/app/utils/time';

@Component({
  selector: 'app-card-filter',
  standalone: true,
  imports: [CommonModule, DateSliderComponent, SliderComponent],
  templateUrl: './card-filter.component.html',
  styleUrl: './card-filter.component.css',
})
export class CardFilterComponent {
  filterStats = input.required<FilterStats>();
  searchType = computed(() => this.filterStats().searchType);

  // Stop Data
  stopData = signal<Stop>({} as Stop);

  // Airport Data
  airportData = signal<Location[]>([]);

  // Airline Data
  airlineData = signal<Airlines[]>([]);

  // Price Change
  priceData = signal<number>(0);

  // Duration Data
  durationData = signal<number>(0);

  // State Departure Time Range
  minTimeDeparture = signal<string>('');
  maxTimeDeparture = signal<string>('');

  // State Landing Time Range
  minTimeLanding = signal<string>('');
  maxTimeLanding = signal<string>('');

  allState = signal([
    this.priceData,
    this.durationData,
    this.minTimeDeparture,
    this.maxTimeDeparture,
    this.minTimeLanding,
    this.maxTimeLanding,
    this.stopData,
    this.airportData,
    this.airlineData,
  ]);

  latestState = computed(() => this.allState().map((x) => x()));
  latestState$ = toObservable(this.latestState);

  filterChange = output<FilterStats>();

  constructor() {
    effect(
      () => {
        if (this.searchType() === 'flight') {
          console.log('flight', this.searchType());
          this.durationData.set(this.filterStats().duration.max);

          this.stopData.set({} as Stop);
          this.airportData.set([]);
          this.airlineData.set([]);
          this.priceData.set(0);
          this.minTimeDeparture.set(new Date().toDateString());
          this.maxTimeDeparture.set(new Date().toDateString());
          this.minTimeLanding.set(new Date().toDateString());
          this.maxTimeLanding.set(new Date().toDateString());
        }

        if (this.searchType() === 'itinerary') {
          this.durationData.set(this.filterStats().duration.max);

          this.minTimeDeparture.set(
            this.filterStats().timeRange!.minTimeDeparture
          );
          this.maxTimeDeparture.set(
            this.filterStats().timeRange!.maxTimeDeparture
          );

          this.minTimeLanding.set(this.filterStats().timeRange!.minTimeLanding);
          this.maxTimeLanding.set(this.filterStats().timeRange!.maxTimeLanding);

          this.stopData.set(this.filterStats().stopPrices!);

          this.airlineData.set(this.filterStats().carriers!);

          this.airportData.set(this.filterStats().airports!);
        }
      },
      { allowSignalWrites: true }
    );
  }

  ngOnInit(): void {
    this.handleFilter();
  }

  handleFilter() {
    this.latestState$
      .pipe(skip(2), debounceTime(500), distinctUntilChanged())
      .subscribe(() => {
        this.handleFilterChange();
      });
  }

  handleFilterChange() {
    console.log('filterStats', this.filterStats());

    if (this.filterStats()) {
      if (this.searchType() === 'flight') {
        this.filterChange.emit({
          duration: {
            min: this.filterStats().duration.min,
            max: this.durationData(),
          },
          searchType: this.searchType(),
          airports: this.filterStats().airports,
          carriers: this.filterStats().carriers,
          stopPrices: this.filterStats().stopPrices,
          timeRange: this.filterStats().timeRange,
          priceRange: this.filterStats().priceRange,
        });
        return;
      } else {
        this.filterChange.emit({
          duration: this.filterStats().duration,
          airports: this.airportData(),
          carriers: this.airlineData(),
          stopPrices: this.stopData(),
          timeRange: {
            minTimeDeparture: this.minTimeDeparture(),
            maxTimeDeparture: this.maxTimeDeparture(),
            minTimeLanding: this.minTimeLanding(),
            maxTimeLanding: this.maxTimeLanding(),
          },
          priceRange: {
            minPrice: this.filterStats().priceRange!.minPrice || 0,
            maxPrice: this.priceData(),
          },
          searchType: this.searchType(),
        });
      }
    }
  }

  handleMinTimeDepartureValueChange(valueTime: number) {
    this.minTimeDeparture.set(convertTimestampToISOString(valueTime));
  }

  handleMaxTimeDepartureValueChange(valueTime: number) {
    this.maxTimeDeparture.set(convertTimestampToISOString(valueTime));
  }

  handleMinTimeLandingValueChange(valueTime: number) {
    this.minTimeLanding.set(convertTimestampToISOString(valueTime));
  }

  handleMaxTimeLandingValueChange(valueTime: number) {
    this.maxTimeLanding.set(convertTimestampToISOString(valueTime));
  }

  handlePriceChange(value: number) {
    this.priceData.set(value);
  }

  handleDurationChange(value: number) {
    this.durationData.set(value);
  }

  onStopSelect(event: any) {
    const stopType = event.target.value as keyof Stop;

    this.stopData.set({
      ...this.stopData(),
      [stopType]: {
        ...this.stopData()[stopType],
        isActive: event.target.checked,
      },
    });
  }

  onAirlinesSelect(event: any) {
    console.log(parseInt(event.target.value) === -32690);
    console.log(event.target.checked);
    this.airlineData.set(
      this.airlineData().map((airline) =>
        airline.id === parseInt(event.target.value)
          ? { ...airline, isActive: event.target.checked }
          : airline
      )
    );
  }

  onAirportSelect(event: any) {
    console.log(event.target.value);
    console.log(event.target.checked);

    this.airportData.set(
      this.airportData().map((location: Location) => {
        const airportData = location.airports.map((airport) => {
          if (parseInt(airport.entityId) === parseInt(event.target.value)) {
            return {
              ...airport,
              isActive: event.target.checked,
            };
          }
          return airport;
        });

        return {
          ...location,
          airports: airportData,
        };
      })
    );

    console.log('airportData', this.airportData());
  }

  clearAirlineCheckboxes() {
    this.airlineData.set(
      this.airlineData().map((airline) => ({
        ...airline,
        isActive: false,
      }))
    );

    // Trigger filter change after clearing
    this.handleFilterChange();
  }

  clearAirportCheckboxes() {
    this.airportData.set(
      this.airportData().map((location: Location) => {
        const airportdata = location.airports.map((airport) => ({
          ...airport,
          isActive: false,
        }));
        return {
          ...location,
          airports: airportdata,
        };
      })
    );

    console.log(this.airportData());

    // Trigger filter change after clearing
    this.handleFilterChange();
  }

  formatDurationLabel(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    console.log('minutes', minutes);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  }
}
