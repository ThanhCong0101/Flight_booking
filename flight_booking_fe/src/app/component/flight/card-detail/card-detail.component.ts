import { Component, input, Input } from '@angular/core';
import { Router } from '@angular/router';
import { map, of, switchMap, tap } from 'rxjs';
import {
  FlightSegmentInfo,
  LayoverInfo,
  LegInfo,
} from 'src/app/models/cardDetail.model';
import { BookingService } from 'src/app/services/booking.service';
import { FlightServiceAPI } from 'src/app/services/flight.service';
import { createFlightSegment } from 'src/app/util/flight';
import { calculateDuration, convertToUserTimezone, transformDate } from 'src/app/util/time';

@Component({
  selector: 'app-card-detail',
  templateUrl: './card-detail.component.html',
  styleUrl: './card-detail.component.css',
})
export class CardDetailComponent {
  itineraryId = input<string>('');
  tokenItinerary = input<string>('');
  isLoading: boolean = true;

  flightSegmentInfo: FlightSegmentInfo[] = [];
  layoverInfo: LayoverInfo[] = [];

  fullDurationSegment: string = '';
  departureDate: string = '';

  legInfo: LegInfo[] = [];

  toastMessages: string[] = [];

  constructor(
    private flightServiceAPI: FlightServiceAPI,
    private router: Router,
    private bookingService: BookingService
  ) {}

  ngOnInit() {
    this.loadFlightDetails();
  }

  loadFlightDetails() {
    this.isLoading = true;

    console.log(this.itineraryId());
    this.flightServiceAPI
      .searchDetail(this.itineraryId(), this.tokenItinerary())
      .subscribe((res) => {
        console.log('res search detail', res);
        if (res.status) {
          this.legInfo = res.data.itinerary.legs.map((leg: any) => {
            const fullDurationSegment = leg.durationMinutes;
            const headerDate = transformDate(leg.departure);

            const { flightSegmentInfo, layoverInfo } = createFlightSegment(
              leg.segments, res.data.itineraryLegacyInfo.carrierLogos[leg.segments[0].marketingCarrier.id],
            );

            const isDetailSegmentAmenities = new Array(
              this.flightSegmentInfo.length
            ).fill(false);

            return {
              flightSegmentInfo,
              layoverInfo,
              fullDurationSegment,
              headerDate,
              isDetailSegmentAmenities,
            };
          });
        }
        this.isLoading = false;
      });
  }

  navigateToBooking() {
    this.bookingService
      .availabilitySeat(this.itineraryId(), this.tokenItinerary())
      .pipe(
        tap((data: any) => {
          const isAvailableSeat = data.isAvailableSeat;
          console.log('noAvailableSeat', data.isAvailableSeat);

          if (isAvailableSeat) {
            this.router.navigate(['/booking'], {
              queryParams: {
                itineraryId: this.itineraryId(),
              },
              state: {
                legInfo: this.legInfo,
              },
            });
          } else {
            this.showToast('No available seats for this flight.');
          }
        })
      )
      .subscribe();
  }

  showToast(message: string) {
    this.toastMessages.push(message);
    setTimeout(() => {
      this.toastMessages.pop();
    }, 3000);
  }
}
