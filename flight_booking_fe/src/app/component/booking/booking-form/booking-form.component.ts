import { CommonModule } from '@angular/common';
import { Component, HostListener, signal } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { LoginComponent } from '../../login/login/login.component';
import { AuthService } from 'src/app/services/auth.service';
import { filter, map, of, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { PassengerService } from 'src/app/services/passenger.service';
import { TimerService } from 'src/app/services/timer.service';
import { ActivatedRoute, Router } from '@angular/router';
import { convertSecondsToTime } from 'src/app/util/time';
import { BookingService } from 'src/app/services/booking.service';
import { validateForm } from 'src/app/util/validation';
import { LegInfo } from 'src/app/models/cardDetail.model';
import { RegisterComponent } from '../../login/register/register.component';
import { FlightServiceAPI } from 'src/app/services/flight.service';
import { createFlightSegment } from 'src/app/util/flight';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LoginComponent,
    RegisterComponent,
  ],
  templateUrl: './booking-form.component.html',
  styleUrls: ['./booking-form.component.css'],
})
export class BookingFormComponent {
  recentPassengers: any[] = [];
  timeRemainingDisplay: string = '';

  currentStep: number[] = [1];
  isAuth = signal<boolean>(false);
  hasFormChanged = false;

  dataEmail: string = '';
  user_id = signal<string>('');
  legInfo: LegInfo[] = [];
  itinerary_id = signal<string>('');
  booking_id = signal<number>(0);

  formSubmit$ = new Subject<any>();
  passengers!: FormArray;
  bookingForm!: FormGroup;
  destroy$ = new Subject<void>();

  booking: any;
  passenger: any;
  flightItinerary: any;

  activeAuthTab: 'register' | 'login' = 'register';

  // Create validation groups
  step1Fields = ['firstName', 'lastName', 'dateOfBirth', 'gender'];
  step2Fields = ['passportNumber', 'passportExpiry', 'nationality'];
  step3Fields = ['address', 'city', 'country', 'postalCode'];
  tokenService: any;

  toastMessages: string[] = [];

  constructor(
    private _fb: FormBuilder,
    private authService: AuthService,
    private timerService: TimerService,
    private flightServiceAPI: FlightServiceAPI,
    private router: Router,
    private bookingService: BookingService,
    private route: ActivatedRoute,
    private passengerService: PassengerService
  ) {}

  ngOnInit() {
    this.getItineraryID();
    this.checkAuthAndInitForm();
    this.createBookingPending();

    this.formSubmit$
      .pipe(
        tap(() => this.bookingForm.markAsDirty()),
        switchMap(() => validateForm(this.bookingForm)),
        filter((isValid) => isValid),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.confirmBooking());
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.timerService.stopTimer();
    localStorage.removeItem('bookingTimer');
    window.onbeforeunload = null;
    this.bookingService.removeBookingPending(this.booking_id());
  }

  @HostListener('window:beforeunload', ['$event'])
  handleBeforeUnload(event: BeforeUnloadEvent) {
    console.log('handleBeforeUnload', event);

    event.preventDefault();
    this.bookingService.removeBookingPending(this.booking_id()).subscribe();

    return false;
  }

  createBookingPending() {
    const booking_data = {
      itinerary_id: this.itinerary_id(),
      user_id: this.user_id(),
    };

    if (this.isAuth()) {
      this.bookingService
        .bookingPending(booking_data)
        .pipe(
          tap((booking) => {
            console.log('createBookingPending', booking.booking_id);
            this.booking_id.set(booking.booking_id);
            this.startBookingTimer();
          })
        )
        .subscribe();
    }
  }

  private initEmptyForm(): void {
    this.bookingForm = this._fb.group({
      itineraryId: ['', Validators.required],
      passengers: this._fb.array([]),
    });

    // Add first passenger by default
    this.initFirstPassenger();
  }

  get passengersFormArray() {
    return this.bookingForm.get('passengers') as FormArray;
  }

  // Method to add new passenger
  addPassenger() {
    this.bookingService
      .updateNewPassenger(this.booking_id())
      .subscribe((res) => {
        if (res.status) {
          this.currentStep.push(1);
          this.passengersFormArray.push(this.createPassengerForm());
        } else {
          this.showToast('No available seat');
        }
      });
  }

  showToast(message: string) {
    this.toastMessages.push(message);
    setTimeout(() => {
      this.toastMessages.pop();
    }, 3000);
  }

  initFirstPassenger() {
    this.currentStep.push(1);
    this.passengersFormArray.push(this.createPassengerForm());
  }

  // Method to remove passenger
  removePassenger(index: number) {
    this.bookingService
      .removePassengerBookingPending(this.booking_id())
      .pipe(
        tap((res) => {
          console.log('res', res);
          this.passengersFormArray.removeAt(index);
          this.currentStep.splice(index, 1);
        })
      )
      .subscribe();
  }

  // Method to create single passenger form group
  createPassengerForm(): FormGroup {
    return this._fb.group({
      passengerID: ['', Validators.required],
      firstName: [{ value: '', disabled: !this.isAuth() }, Validators.required],
      lastName: [{ value: '', disabled: !this.isAuth() }, Validators.required],
      gender: [{ value: '', disabled: !this.isAuth() }, Validators.required],
      passportNumber: [
        { value: '', disabled: !this.isAuth() },
        Validators.required,
      ],
      passportExpiry: [
        { value: '', disabled: !this.isAuth() },
        Validators.required,
      ],
      nationality: [
        { value: '', disabled: !this.isAuth() },
        Validators.required,
      ],
      dateOfBirth: [
        { value: '', disabled: !this.isAuth() },
        Validators.required,
      ],
      address: [{ value: '', disabled: !this.isAuth() }, Validators.required],
      city: [{ value: '', disabled: !this.isAuth() }, Validators.required],
      country: [{ value: '', disabled: !this.isAuth() }, Validators.required],
      postalCode: [
        { value: '', disabled: !this.isAuth() },
        Validators.required,
      ],
    });
  }

  getItineraryID() {
    this.route.queryParams.subscribe((params) => {
      const state = history.state;
      console.log('state', state);
      this.legInfo = state.legInfo;

      const itinerary_id = params['itineraryId'];
      const token = params['token'];
      if (!itinerary_id && !token) {
        this.router.navigate(['/']);
        return;
      } else if (!this.legInfo) {
        this.flightServiceAPI
          .searchDetail(itinerary_id, token)
          .subscribe((res) => {
            console.log('res', res);
            if (res.status) {
              this.legInfo = res.data.itinerary.legs.map((leg: any) => {
                const fullDurationSegment = leg.duration;
                const headerDate = leg.departure;

                const { flightSegmentInfo, layoverInfo } = createFlightSegment(
                  leg.segments,
                  res.data.itineraryLegacyInfo.carrierLogos[
                    leg.segments[0].marketingCarrier.id
                  ]
                );

                const isDetailSegmentAmenities = new Array(
                  flightSegmentInfo.length
                ).fill(false);

                return {
                  flightSegmentInfo,
                  layoverInfo,
                  fullDurationSegment,
                  headerDate,
                  isDetailSegmentAmenities,
                };
              });

              this.itinerary_id.set(itinerary_id);
            } else {
              this.router.navigate(['/']);
            }

            console.log('legInfo', this.legInfo);
          });
      }

      this.itinerary_id.set(params['itineraryId']);
    });
  }

  private checkAuthAndInitForm(): void {
    this.authService
      .isAuthenticated()
      .pipe(
        map((auth) => {
          this.isAuth.set(auth);
          this.initEmptyForm();
          const itineraryIdFormControl = this.bookingForm.get('itineraryId');
          itineraryIdFormControl?.setValue(this.itinerary_id());
          return auth;
        }),
        switchMap((isAuth) => {
          if (isAuth) {
            return this.authService.getDataFromAccessToken().pipe(
              tap((data) => {
                this.user_id.set(data.user_id);
                this.loadRecentPassengers();
              })
            );
          }
          return of(null);
        })
      )
      .subscribe();
  }

  loadRecentPassengers() {
    this.passengerService
      .getPassengerRecentByUserId(this.user_id())
      .pipe(
        tap((passengers) => {
          this.recentPassengers = passengers;
          if (passengers.length > 0) {
            this.initFormWithPassengerData(passengers[0]); // Load most recent by default
          }
        })
      )
      .subscribe();
  }

  private initFormWithPassengerData(passenger: any): void {
    const lastIndex = this.passengersFormArray.length - 1;
    const lastPassengerForm = this.passengersFormArray.at(lastIndex);

    const formValues = {
      passengerID: passenger.passenger_id,
      firstName: passenger.first_name,
      lastName: passenger.last_name,
      dateOfBirth: new Date(passenger.date_of_birth)
        .toISOString()
        .split('T')[0],
      gender: passenger.gender,
      passportNumber: passenger.passport_number,
      passportExpiry: passenger.passport_expiry,
      nationality: passenger.nationality,
      address: passenger.street_address,
      city: passenger.city,
      country: passenger.country,
      postalCode: passenger.postal_code,
    };

    lastPassengerForm.patchValue(formValues);
  }

  startBookingTimer() {
    this.timerService.startTimer();
    this.timerService.timeout$.subscribe((time) => {
      this.timeRemainingDisplay = convertSecondsToTime(time);
      if (time === 0) {
        console.log('timeout');
        this.showTimeoutModal();
      }
    });
  }

  showTimeoutModal() {
    const modal = document.getElementById('timeoutModal') as HTMLDialogElement;
    modal.showModal();
  }

  selectPassenger(passenger: any) {
    this.initFormWithPassengerData(passenger);
  }

  confirmBooking(): void {
    const itinerary_id = this.bookingForm.get('itineraryId')?.value;
    const passengers_data = this.passengersFormArray.value.map(
      (passengerForm: any) => ({
        first_name: passengerForm.firstName,
        last_name: passengerForm.lastName,
        gender: passengerForm.gender,
        passport_number: passengerForm.passportNumber,
        passport_expiry: passengerForm.passportExpiry,
        nationality: passengerForm.nationality,
        date_of_birth: passengerForm.dateOfBirth,
        street_address: passengerForm.address,
        city: passengerForm.city,
        country: passengerForm.country,
        postal_code: passengerForm.postalCode,
      })
    );

    this.proceedWithBooking(itinerary_id, passengers_data);
  }

  private proceedWithBooking(itinerary_id: string, passenger_data: any) {
    // Common booking logic
    this.bookingService
      .createBooking({
        booking_id: this.booking_id(),
        itinerary_id: itinerary_id,
        user_id: this.user_id(),
        passenger_data: passenger_data,
      })
      .subscribe((data) => {
        if (data.booking && data.passenger) {
          this.booking = data.booking;
          this.passenger = data.passenger;
          this.flightItinerary = data.itinerary;
          this.closeDialog();
          this.redirectToInvoicePage();
        }
      });
  }

  redirectToInvoicePage() {
    this.router.navigate(['/invoice'], {
      state: {
        user_id: this.user_id(),
        booking: this.booking,
        passenger: this.passenger,
        itinerary: this.flightItinerary,
      },
    });
  }

  openConfirmDialog(): void {
    const dialog = document.getElementById('my_modal_1') as HTMLDialogElement;
    dialog.showModal();
  }

  closeDialog(): void {
    const dialog = document.getElementById('my_modal_1') as HTMLDialogElement;
    dialog.close();
  }
  // Add this method to check current step validation
  isCurrentStepValid(index: number): boolean {
    let fieldsToCheck: string[] = [];

    // this.passengers
    switch (this.currentStep[index]) {
      case 1:
        fieldsToCheck = this.step1Fields;
        break;
      case 2:
        fieldsToCheck = this.step2Fields;
        break;
      case 3:
        fieldsToCheck = this.step3Fields;
        break;
    }

    const passengerForm = (this.bookingForm.get('passengers') as FormArray).at(
      index
    ) as FormGroup;
    return fieldsToCheck.every((field) => {
      const control = passengerForm.get(field);
      return control && control.valid;
    });
  }

  // Modify your nextStep method
  nextStep(index: number) {
    if (this.isCurrentStepValid(index)) {
      this.currentStep[index]++;
    } else {
      // Mark all fields as touched to trigger validation messages
      const passengerForm = (
        this.bookingForm.get('passengers') as FormArray
      ).at(index) as FormGroup;
      Object.keys(passengerForm.controls).forEach((key) => {
        // const control = this.bookingForm.get(key);
        // control?.markAsTouched();
        passengerForm.get(key)?.markAsTouched();
      });
    }
  }

  previousStep(index: number) {
    if (this.currentStep[index] > 1) {
      this.currentStep[index]--;
    }
  }

  private getBackendFieldName(controlName: string): string {
    return controlName.replace(
      /[A-Z]/g,
      (letter) => `_${letter.toLowerCase()}`
    );
  }

  setAuthTab(tab: 'register' | 'login') {
    this.activeAuthTab = tab;
  }

  routeToBookingFormLogin() {
    console.log('routeToBookingForm Login');
    window.location.reload();
  }

  routeToBookingFormRegister() {
    console.log('routeToBookingForm Register');
    this.activeAuthTab = 'login';
  }

  redirectToSearch() {
    this.router.navigate(['/home']);
    this.bookingService
      .removeBookingPending(this.booking_id())
      .subscribe(() => {
        window.location.reload();
      });
  }
}
