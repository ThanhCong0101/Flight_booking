import { Component, computed, effect, input, output, signal } from '@angular/core';
import { DateSliderComponent } from '../../common/date-slider/date-slider.component';
import { CommonModule } from '@angular/common';
import { convertTimestampToISOString } from 'src/app/util/time';
import { SliderComponent } from '../../common/slider/slider.component';
import {
  Airlines,
  FilterStats,
  Location,
  Stop,
} from 'src/app/models/cardFilter.model';
import { debounceTime, distinctUntilChanged, skip } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-card-filter',
  standalone: true,
  imports: [CommonModule, DateSliderComponent, SliderComponent],
  templateUrl: './card-filter.component.html',
  styleUrl: './card-filter.component.css',
})
export class CardFilterComponent {
  filterStats = input.required<FilterStats>();

  // Stop Data
  stopData = signal<Stop>({} as Stop);

  // Airport Data
  airportData = signal<Location[]>([]);

  // Airline Data

  airlineData = signal<Airlines[]>([]);

  // Price Change
  priceData = signal<number>(0);

  // State Departure Time Range
  minTimeDeparture = signal<string>('');
  maxTimeDeparture = signal<string>('');

  // State Landing Time Range
  minTimeLanding = signal<string>('');
  maxTimeLanding = signal<string>('');

  allState = signal([
    this.priceData,
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

  ngOnInit(): void {
      console.log("filterStats", this.filterStats());
    this.minTimeDeparture.set(this.filterStats().timeRange.minTimeDeparture);
    this.maxTimeDeparture.set(this.filterStats().timeRange.maxTimeDeparture);

    this.minTimeLanding.set(this.filterStats().timeRange.minTimeLanding);
    this.maxTimeLanding.set(this.filterStats().timeRange.maxTimeLanding);

    this.stopData.set(this.filterStats().stopPrices);

    this.airlineData.set(this.filterStats().carriers);

    this.airportData.set(this.filterStats().airports);

    this.handleFilterChange();
  }

  handleFilterChange() {
    this.latestState$
      .pipe(skip(2), debounceTime(500), distinctUntilChanged())
      .subscribe(() => {
        this.handleFiterChange();
      });
  }

  handleFiterChange() {
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
        minPrice: this.filterStats().priceRange.minPrice,
        maxPrice: this.priceData(),
      },
    });

    console.log("filterChange", JSON.stringify(this.filterStats()));
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
    this.handleFiterChange();
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
    this.handleFiterChange();
  }
}

