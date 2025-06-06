import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, input, Input } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
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
import { CardSearch } from 'src/app/models/cardSearch.model';
import { FlightServiceAPI } from 'src/app/services/flight.service';
import { validateForm } from 'src/app/util/validation';

@Component({
  selector: 'app-card-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './card-search.component.html',
  styleUrl: './card-search.component.css',
})
export class CardSearchComponent {
  paramSearch = input.required<CardSearch>();

  formSubmit$ = new Subject<any>();
  flightSearchForm!: FormGroup;
  destroy$ = new Subject<void>();
  fromResults: any[] = [];
  toResults: any[] = [];

  selectedFlightType: 'oneWay' | 'roundTrip' = 'oneWay';

  constructor(
    private _flightServiceAPI: FlightServiceAPI,
    private _fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm(this.paramSearch());

    if (this.paramSearch().return_date) {
      this.selectedFlightType = 'roundTrip';
    }
    this.setupAutocomplete();

    this.formSubmit$.pipe(
      tap(() => this.flightSearchForm.markAsDirty()),
      switchMap(() => validateForm(this.flightSearchForm)),
      filter((isValid) => {
        console.log(isValid);
        return isValid;
      }),
      takeUntil(this.destroy$)
    );
    // .subscribe(() => this.submitForm());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm(paramSearch: any) {
    let parsedReturnDate!: string;
    const parsedDepartureDate = new Date(paramSearch.depart_date)
      .toISOString()
      .split('T')[0];
    if (paramSearch.return_date) {
      parsedReturnDate = new Date(paramSearch.return_date)
        .toISOString()
        .split('T')[0];
    } else {
      parsedReturnDate = '';
    }

    this.flightSearchForm = this._fb.group({
      from_departure: [
        paramSearch.from_departure,
        [Validators.required, Validators.minLength(3)],
      ],
      from_departure_skyID: [paramSearch.from_departure_id],
      to_destination: [
        paramSearch.to_destination,
        [Validators.required, Validators.minLength(3)],
      ],
      to_destination_skyID: [paramSearch.to_destination_id],
      tripType: ['oneWay'],
      depart_date: [parsedDepartureDate, [Validators.required]],
      return_date: [parsedReturnDate, [Validators.required]],
      class_type: [paramSearch.class_type],
      traveller_type: [paramSearch.traveller_type],
    });
  }

  setupAutocomplete() {
    this.setupFieldAutocomplete('from_departure');
    this.setupFieldAutocomplete('to_destination');
  }

  private setupFieldAutocomplete(
    fieldName: 'from_departure' | 'to_destination'
  ) {
    this.flightSearchForm
      .get(fieldName)!
      .valueChanges.pipe(
        debounceTime(500),
        distinctUntilChanged(),
        tap((value) => {
          if (value.length < 3) {
            this[fieldName === 'from_departure' ? 'fromResults' : 'toResults'] =
              [];
          }
        }),
        filter((value) => value.length >= 3),
        switchMap((value) => {
          const formattedValue = value.replace(/\s+/g, '-').toLowerCase();
          return this._flightServiceAPI.getLocations(formattedValue).pipe(
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
          fieldName === 'from_departure' ? 'fromResults' : 'toResults';
        this[resultArray] =
          results.data.length > 0
            ? results.data
            : [{ presentation: { title: 'No data found' } }];
        console.log(`${fieldName} results:`, this[resultArray]);
      });
  }

  selectResult(controlName: string, result: any) {
    const visibleControl = this.flightSearchForm.get(controlName)!;
    const skyIDControl = this.flightSearchForm.get(`${controlName}_skyID`)!;

    visibleControl.setValue(result.presentation.title, { emitEvent: false });
    skyIDControl.setValue(result.navigation!.relevantFlightParams!.skyId, {
      emitEvent: false,
    });

    if (controlName === 'from_departure') {
      this.fromResults = [];
    } else {
      this.toResults = [];
    }

    console.log(skyIDControl!.value);
  }

  selectFlightType(type: 'oneWay' | 'roundTrip'): void {
    this.selectedFlightType = type;

    if (type === 'oneWay') {
      const returnDateControl = this.flightSearchForm.get('return_date');
      returnDateControl?.clearValidators();
      returnDateControl?.setValue('');
    } else {
      const departDateControl = this.flightSearchForm.get('depart_date');
      const returnDateControl = this.flightSearchForm.get('return_date');

      departDateControl?.setValidators([Validators.required]);
      returnDateControl?.setValidators([Validators.required]);
    }

    this.flightSearchForm.updateValueAndValidity();
    this.cdr.detectChanges();
  }
}
