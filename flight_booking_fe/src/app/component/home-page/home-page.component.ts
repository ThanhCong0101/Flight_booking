import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
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
import { FlightServiceAPI } from 'src/app/services/flight.service';
import { validateForm } from 'src/app/util/validation';
import { PriceDate } from '../common/calendar/calendar.component';
import { CalendarService } from 'src/app/services/calender.service';
import { userService } from 'src/app/services/user.service';
import { TokenService } from 'src/app/services/token.service';

export interface DepDes {
  from: string;
  to: string;
}

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css'],
})
export class HomePageComponent implements OnInit, OnDestroy {
  formSubmit$ = new Subject<any>();
  flightSearchForm!: FormGroup;
  destroy$ = new Subject<void>();
  fromResults: any[] = [];
  toResults: any[] = [];
  selectedFlightType: 'oneWay' | 'roundTrip' = 'oneWay';
  selectedMultiCity: boolean = false;

  selectedClassType = ['Economy', 'Premium Economy', 'Business', 'First'];

  selectedTravellerType = ['Adult', 'Children', 'Infant', 'Senior', 'Student'];

  isCalendarOpen = signal<boolean>(false);

  DepDesCalendar = signal<DepDes>({
    from: '',
    to: '',
  });

  isLoggedIn: boolean = false;
  avatar: string = '';

  constructor(
    private _fb: FormBuilder,
    private _flightServiceAPI: FlightServiceAPI,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private calendarService: CalendarService,
    private userService: userService,
    private tokenService: TokenService
  ) {}
  ngOnInit(): void {
    this.initForm();
    this.setupAutocomplete();
    this.selectFlightType('oneWay');

    this.formSubmit$
      .pipe(
        tap(() => this.flightSearchForm.markAsDirty()),
        switchMap(() => validateForm(this.flightSearchForm)),
        filter((isValid) => {
          console.log(isValid);
          return isValid;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.submitForm());

    this.checkAuth();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  checkAuth() {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      this.isLoggedIn = true;
      this.avatar =
        localStorage.getItem('avatar') ||
        'https://static-00.iconduck.com/assets.00/avatar-default-icon-2048x2048-h6w375ur.png';
    } else {
      this.isLoggedIn = false;
    }
  }

  initForm() {
    this.flightSearchForm = this._fb.group(
      {
        from_departure: ['', [Validators.required, Validators.minLength(3)]],
        from_departure_skyID: [''],
        to_destination: ['', [Validators.required, Validators.minLength(3)]],
        to_destination_skyID: [''],
        depart_date: [new Date().toISOString(), [Validators.required]],
        return_date: [new Date().toISOString(), [Validators.required]],
        class_type: ['Economy'],
        traveller_type: ['Adult'],
      },
      { validator: this.differentDestinationsValidator }
    );
  }

  submitForm() {
    const departureEntityId = this.flightSearchForm.get(
      'from_departure_skyID'
    )!.value;

    const toEntityId = this.flightSearchForm.get('to_destination_skyID')!.value;

    const departureEntity = this.flightSearchForm.get('from_departure')!.value;

    const toEntity = this.flightSearchForm.get('to_destination')!.value;

    const classType = this.flightSearchForm.get('class_type')!.value;

    const travellerType = this.flightSearchForm.get('traveller_type')!.value;

    const departDate = this.flightSearchForm.get('depart_date')!.value;

    if (this.selectedFlightType === 'oneWay') {
      this.router.navigate(['/flight'], {
        queryParams: {
          from_departure_id: departureEntityId,
          to_destination_id: toEntityId,
          from_departure: departureEntity,
          to_destination: toEntity,
          depart_date: departDate,
          class_type: classType,
          traveller_type: travellerType,
        },
      });
    } else {
      const returnDate = this.flightSearchForm.get('return_date')!.value;

      this.router.navigate(['/flight'], {
        queryParams: {
          from_departure_id: departureEntityId,
          to_destination_id: toEntityId,
          from_departure: departureEntity,
          to_destination: toEntity,
          depart_date: departDate,
          return_date: returnDate,
          class_type: classType,
          traveller_type: travellerType,
        },
      });
    }
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
        debounceTime(300),
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

    if (controlName === 'to_destination') {
      const from_departure_skyID = this.flightSearchForm.get(
        'from_departure_skyID'
      )!.value;

      const to_destination_skyID = this.flightSearchForm.get(
        'to_destination_skyID'
      )!.value;

      console.log('from_departure_skyID', from_departure_skyID);
      console.log('to_destination_skyID', to_destination_skyID);

      this.DepDesCalendar.set({
        from: from_departure_skyID,
        to: to_destination_skyID,
      });

      console.log('DepDesCalendar', this.DepDesCalendar());
      // const to_destination_skyID = this.calendarService.searchCalenderPrice();
    }

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

  toggleMultiCity() {
    this.selectedMultiCity = !this.selectedMultiCity;
  }

  openCalendar() {
    this.isCalendarOpen.set(!this.isCalendarOpen());
  }

  closeCalendar() {
    this.isCalendarOpen.set(false);
  }

  closeAutoComplete() {
    this.fromResults = [];
    this.toResults = [];
  }

  onInputClick(event: any, fieldName: string) {
    console.log('Input clicked');
    const value = event.target.value;
    if (value) {
      const formattedValue = value.replace(/\s+/g, '-').toLowerCase();

      // Trigger your existing search/autocomplete logic here
      this._flightServiceAPI
        .getLocations(formattedValue)
        .pipe(
          catchError((error) => {
            console.error(`Error fetching locations:`, error);
            return of({ data: [] });
          })
        )
        .subscribe((results) => {
          const resultArray =
            fieldName === 'from_departure' ? 'fromResults' : 'toResults';
          console.log('results', results);
          this[resultArray] =
            results.data.length > 0
              ? results.data
              : [{ presentation: { title: 'No data found' } }];
          console.log(`${fieldName} results:`, this[resultArray]);
        });
    }
  }

  priceDayChange(date: PriceDate) {
    console.log('day', date);
    const depart_date = date.departure;
    const return_date = date.return;

    if (this.selectedFlightType === 'oneWay') {
      this.flightSearchForm.get('depart_date')?.setValue(depart_date);
    } else {
      this.flightSearchForm.get('depart_date')?.setValue(depart_date);
      this.flightSearchForm.get('return_date')?.setValue(return_date);
    }

    this.isCalendarOpen.set(false);
  }

  logout() {
    const token = this.tokenService.getAccessToken();
    let tokenPayload;
    if (token) {
      tokenPayload = JSON.parse(atob(token.split('.')[1]));
    }
    const email = tokenPayload.email;
    console.log(tokenPayload);
    this.userService
      .logout(email)
      .pipe(
        tap(() => {
          this.tokenService.clearTokens();
          localStorage.clear();
          window.location.reload();
        })
      )
      .subscribe();
  }

  // VALIDATOR
  // dateValidator() {
  //   return (control: AbstractControl): { [key: string]: any } | null => {
  //     // console.log(control.value);
  //     const selectedDate = new Date(control.value);
  //     const currentDate = new Date();
  //     currentDate.setHours(0, 0, 0, 0);

  //     if (selectedDate < currentDate) {
  //       return { pastDate: true };
  //     }
  //     return null;
  //   };
  // }

  differentDestinationsValidator(
    group: FormGroup
  ): { [key: string]: any } | null {
    const fromDestination = group.get('from_departure')?.value;
    const toDestination = group.get('to_destination')?.value;

    return fromDestination &&
      toDestination &&
      fromDestination.toLowerCase() === toDestination.toLowerCase()
      ? { sameDestinations: true }
      : null;
  }

  getErrorMessage(controlName: string): string {
    const control = this.flightSearchForm.get(controlName);

    // console.log(control?.errors);
    if (control?.errors && Object.keys(control?.errors).length > 0) {
      if (control.errors['required']) {
        return 'This field is required';
      }
      if (control.errors['minlength']) {
        return 'This field must be at least 3 characters long';
      }
      if (control.errors['pastDate']) {
        return 'Please select a future date';
      }
      if (control.errors['sameDestinations']) {
        return 'From and To destinations cannot be the same';
      }
    }
    return '';
  }
}
