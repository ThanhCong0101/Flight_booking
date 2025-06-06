import { Component, input, Input, signal } from '@angular/core';
import { BrandFlight, FlightLegInfo } from 'src/app/models/cardList.model';
import {
  convertMinutesToHoursAndMinutes,
  convertToAMPMFormat,
  convertToUserTimezone,
} from 'src/app/util/time';

@Component({
  selector: 'app-card-list',
  templateUrl: './card-list.component.html',
  styleUrl: './card-list.component.css',
})
export class CardListComponent {
  flightCard = input.required<any>();
  tokenItinerary = input.required<string>();
  isDetailVisible: boolean = false;
  tagsFlight: string[] = [];

  legs: FlightLegInfo[] = [];

  flight = input<any>();

  constructor() {}

  ngOnInit() {
    console.log(this.flightCard());
    this.formatTagFlight(this.flightCard().tags);

    this.legs = this.flightCard().legs.map((leg: any) => {
      const timeDeparture = leg.departure;
      const timeArrival = leg.arrival;
      const duration = leg.durationInMinutes;
      const stopCount = leg.stopCount;
      const brandFlight = leg.carriers.marketing;
      const brandNameFlight = this.formatBrandFlight(brandFlight);
      const origin = leg.origin.id;
      const destination = leg.destination.id;
      const airlinePhoto = leg.carriers.marketing[0].logoUrl;
      const airline = leg.carriers.marketing[0].name;
      const flightNumber = leg.carriers.marketing[0].alternateId;
      const formatedDepDesCode = this.formatDepDesCode(leg);

      return {
        timeDeparture,
        timeArrival,
        duration,
        stopCount,
        brandFlight,
        brandNameFlight,
        origin,
        destination,
        formatedDepDesCode,
        airlinePhoto,
        airline,
        flightNumber,
      };
    });
  }

  toggleDetail() {
    this.isDetailVisible = !this.isDetailVisible;
  }

  formatTagFlight(tags: any) {
    tags?.map((tag: any) => {
      this.tagsFlight.push(tag);
    });
  }

  formatBrandFlight(brandFlight: any) {
    return brandFlight.map((brand: BrandFlight) => brand.name).join(', ');

    // return brandFlight.join(', ');
  }

  formatDepDesCode(leg: any): string {
    return `${leg?.origin.id} - ${leg?.destination.id}`;
  }
}
