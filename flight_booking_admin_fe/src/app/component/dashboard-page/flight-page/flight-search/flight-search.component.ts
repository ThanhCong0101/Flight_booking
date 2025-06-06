import { CommonModule } from '@angular/common';
import { Component, OnInit, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  of,
  Subject,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import {
  Airlines,
  FilterStats,
  Location,
  PriceRange,
} from 'src/app/models/cardFilter.model';
import { FlightService } from 'src/app/services/flight.service';
import { FlightSearchService } from 'src/app/services/flightSearch.service';

@Component({
  selector: 'app-flight-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './flight-search.component.html',
  styleUrls: ['./flight-search.component.css'],
})
export class FlightSearchComponent implements OnInit {
  searchFlightForm!: FormGroup;

  fromResults: any[] = [];
  toResults: any[] = [];

  allFlights: any[] = [];
  filteredFlights: any[] = [];

  flightListResult = signal<any[]>([]);
  isLoading = true;
  pageSize = 10;

  filterStats = signal<FilterStats>({} as FilterStats);

  paramsFlightSearchChange = output<any>();

  itinerarySearchChange = output<any>();

  destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder, private flightService: FlightService) {}

  ngOnInit() {
    this.initFlightSearchForm();
    this.setupAutocomplete();
    this.setupSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initFlightSearchForm() {
    this.searchFlightForm = this.fb.group({
      searchType: ['flight'],
      // Itinerary search controls
      flightSearch: [''],
      sortBy: [''],
      sortOrder: ['ASC'],
      // Flight search controls
      departureAirport: ['Hanoi'],
      departureAirport_skyID: ['HAN'],
      arrivalAirport: ['Tokyo Narita'],
      arrivalAirport_skyID: ['NRT'],
      dateFilterType: ['specific'],
      departDate: ['2024-12-12'],
      returnDate: [''],
    });
  }

  setupSearch() {
    this.setUpSearchByCriteria('flightSearch');
    this.setUpSearchByCriteria('sortBy');
    this.setUpSearchByCriteria('sortOrder');
  }

  setUpSearchByCriteria(field: string) {
    this.searchFlightForm
      .get(field)!
      .valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => {
          const flightSearch = this.searchFlightForm.get('flightSearch')!.value;
          const sortBy = this.searchFlightForm.get('sortBy')!.value;
          const sortOrder = this.searchFlightForm.get('sortOrder')!.value;

          this.paramsFlightSearchChange.emit({
            flightSearch,
            sortBy,
            sortOrder,
          });
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  setupAutocomplete() {
    this.setupFieldAutocomplete('departureAirport');
    this.setupFieldAutocomplete('arrivalAirport');
  }

  setupFieldAutocomplete(fieldName: 'departureAirport' | 'arrivalAirport') {
    this.searchFlightForm
      .get(fieldName)!
      .valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap((value) => {
          if (value.length < 3) {
            this[
              fieldName === 'departureAirport' ? 'fromResults' : 'toResults'
            ] = [];
          }
        }),
        filter((value) => value.length >= 3),
        switchMap((value) => {
          const formattedValue = value.replace(/\s+/g, '-').toLowerCase();
          return this.flightService.getLocations(formattedValue).pipe(
            catchError((error) => {
              console.error(`Error fetching ${fieldName} locations:`, error);
              return of({ data: [] });
            })
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((results) => {
        const resultArray =
          fieldName === 'departureAirport' ? 'fromResults' : 'toResults';
        this[resultArray] =
          results.data.length > 0
            ? results.data
            : [{ presentation: { title: 'No data found' } }];
        console.log(`${fieldName} results:`, this[resultArray]);
      });
  }

  selectResult(controlName: string, result: any) {
    const visibleControl = this.searchFlightForm.get(controlName)!;
    const skyIDControl = this.searchFlightForm.get(`${controlName}_skyID`)!;

    visibleControl.setValue(result.presentation.title, { emitEvent: false });
    skyIDControl.setValue(result.navigation!.relevantFlightParams!.skyId, {
      emitEvent: false,
    });

    if (controlName === 'departureAirport') {
      this.fromResults = [];
    } else {
      this.toResults = [];
    }

    console.log(skyIDControl!.value);
  }

  submitItineraryForm() {
    console.log('Submitted itinerary form:', this.searchFlightForm.value);

    const departureEntityId = this.searchFlightForm.get(
      'departureAirport_skyID'
    )!.value;
    const arrivalEntityId = this.searchFlightForm.get(
      'arrivalAirport_skyID'
    )!.value;
    const dateFilterType = this.searchFlightForm.get('dateFilterType')!.value;
    const departDate = this.searchFlightForm.get('departDate')!.value;
    const returnDate = this.searchFlightForm.get('returnDate')!.value;

    console.log('return data: ', returnDate);

    if (dateFilterType == 'specific') {
      this.flightService
        .searchOneWay({
          departureEntityId,
          arrivalEntityId,
          departDate,
        })
        .subscribe(
          (results) => {
            console.log('results', results);

            this.itinerarySearchChange.emit({
              filterStats: results.data.filterStats,
              itinerary: results.data.itineraries,
              total: results.data.context.totalResults,
            });
          },
          (error) => {
            console.error('Error fetching flight results:', error);
            this.isLoading = false;
            // Handle error (e.g., show error message)
          }
        );
    } else {
      this.flightService
        .searchRoundTrip({
          departureEntityId,
          arrivalEntityId,
          departDate,
          returnDate,
        })
        .subscribe(
          (results) => {
            console.log('results', results);

            this.itinerarySearchChange.emit({
              filterStats: results.data.filterStats,
              itinerary: results.data.itineraries,
              total: results.data.context.totalResults,
            });
          },
          (error) => {
            console.error('Error fetching flight results:', error);
            this.isLoading = false;
          }
        );
    }
  }

  onSortChange(event: Event) {
    const sort = (event.target as HTMLSelectElement).value;
    if (sort === '') {
      this.searchFlightForm.get('sortOrder')!.setValue('ASC');
    }
  }
}
