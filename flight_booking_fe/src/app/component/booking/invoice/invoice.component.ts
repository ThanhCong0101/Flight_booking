import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserTimezonePipe } from 'src/app/pipe/timezone.pipe';
import { BookingService } from 'src/app/services/booking.service';
import {
  convertToAMPMFormat,
  formatDateToShortString,
} from 'src/app/util/time';
import { DurationFormatPipe } from '../../../pipe/duration-format.pipe';
import { WeekMonthDayPipe } from '../../../pipe/week-month-day.pipe';
import { MediumDatePipe } from '../../../pipe/medium-date.pipe';

@Component({
  selector: 'app-invoice',
  standalone: true,
  imports: [CommonModule, UserTimezonePipe, DurationFormatPipe, MediumDatePipe],
  templateUrl: './invoice.component.html',
  styleUrl: './invoice.component.css',
})
export class InvoiceComponent implements OnInit {
  flightItinerary: any;
  booking: any;
  passengers: any;

  flightInfo: any;
  passengersInfo: any;
  bookingInfo: any;
  contactInfo: any;

  isInvoiceEmail = signal<boolean>(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService
  ) {}

  invoiceNumber = 'INV-2024-001';
  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params['booking_id']) {
        const booking_id = params['booking_id'];
        this.bookingService.getBookingById(booking_id).subscribe((data) => {
          console.log(data);
          this.booking = data;
          this.flightItinerary = data.itinerary;
          this.passengers = data.passengers;

          this.isInvoiceEmail.set(true);

          this.setInvoice();
        });
      } else {
        const state = history.state;
        console.log(state);

        this.flightItinerary = state.itinerary;
        this.booking = state.booking;
        this.passengers = state.passenger;

        this.isInvoiceEmail.set(false);

        this.setInvoice();
      }
    });
  }

  setInvoice() {
    console.log('booking: ', this.booking);
    console.log('itinerary: ', this.flightItinerary);
    console.log('passenger: ', this.passengers);
    this.flightInfo = {
      departure: this.flightItinerary.legs[0].origin_name,
      arrival: this.flightItinerary.legs[0].destination_name,
      date:
        formatDateToShortString(this.flightItinerary.legs[0].departure_time) +
        ' ' +
        convertToAMPMFormat(this.flightItinerary.legs[0].departure_time),

      flightNumber: this.flightItinerary.legs[0].segments[0].flight_number,
    };

    this.passengersInfo = this.passengers.map((passenger: any) => {
      return {
        name: passenger.first_name + ' ' + passenger.last_name,
        type: 'Adult',
        seat: '12A',
      };
    });

    this.bookingInfo = {
      reference: '#' + this.booking.booking_id,
      date:
        formatDateToShortString(this.booking.booking_date) +
        ' ' +
        convertToAMPMFormat(this.booking.booking_date),
      status: this.booking.status,
    };

    this.contactInfo = {
      email: this.booking.user.email,
      phone: this.booking.user.phone_number,
    };
  }

  calculateLayover(firstSegment: any, secondSegment: any): number {
    const firstArrival = new Date(firstSegment.arrival_time);
    const secondDeparture = new Date(secondSegment.depature_time);
    return Math.floor(
      (secondDeparture.getTime() - firstArrival.getTime()) / (1000 * 60)
    );
  }

  downloadInvoice() {
    // Implement download logic
  }

  printInvoice() {
    window.print();
  }
}
