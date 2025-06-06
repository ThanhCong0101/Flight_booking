import { CommonModule } from '@angular/common';
import { Component, effect, input, output } from '@angular/core';
import { WeekMonthDayPipe } from '../../../../pipe/week-month-day.pipe';
import { TimeFormatPipe } from '../../../../pipe/time-format.pipe';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-booking-detail',
  standalone: true,
  imports: [
    CommonModule,
    WeekMonthDayPipe,
    TimeFormatPipe,
    ReactiveFormsModule,
  ],
  templateUrl: './booking-detail.component.html',
  styleUrls: ['./booking-detail.component.css'],
})
export class BookingDetailComponent {
  bookingData = input.required<any>();
  bookingDataChange = output<any>();

  formatedDepDes = input.required<any>();

  bookingForm!: FormGroup;
  passengers!: FormArray;
  destroy$ = new Subject<void>();

  constructor(private _fb: FormBuilder) {
    effect(() => {
      this.bookingData()?.passengers.map((passenger: any) => [
        this.passengersFormArray.push(this.addPassengerForm(passenger)),
      ]);
    });
  }

  ngOnInit(): void {
    this.initEmptyForm();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initEmptyForm(): void {
    this.bookingForm = this._fb.group({
      passengers: this._fb.array([]),
    });
  }

  get passengersFormArray() {
    return this.bookingForm.get('passengers') as FormArray;
  }

  // Method to create single passenger form group
  addPassengerForm(passenger?: any): FormGroup {
    console.log('passenger: ', passenger);
    return this._fb.group({
      passenger_id: [passenger?.passenger_id, Validators.required],
      first_name: [passenger?.first_name, Validators.required],
      last_name: [passenger?.last_name, Validators.required],
      date_of_birth: [passenger?.date_of_birth, Validators.required],
      passport_number: [passenger?.passport_number, Validators.required],
      passport_expiry: [passenger?.passport_expiry, Validators.required],
      street_address: [passenger?.street_address, Validators.required],
    });
  }

  confirmUpdateBooking(): void {
    const passengers_data = this.passengersFormArray.value.map(
      (passengerForm: any) => ({
        passenger_id: passengerForm.passenger_id,
        first_name: passengerForm.first_name,
        last_name: passengerForm.last_name,
        date_of_birth: passengerForm.date_of_birth,
        passport_number: passengerForm.passport_number,
        passport_expiry: passengerForm.passport_expiry,
        street_address: passengerForm.street_address,
      })
    );

    this.bookingDataChange.emit(passengers_data);
  }

  closeDrawer() {
    const drawerCheckbox = document.getElementById(
      'booking-detail-drawer'
    ) as HTMLInputElement;
    drawerCheckbox.checked = false;
  }
}
