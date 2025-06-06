import { Injectable } from '@angular/core';
import { Airlines, FilterStats, Location } from '../models/cardFilter.model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APIUrl } from 'src/environments/enviroment';

@Injectable({
  providedIn: 'root',
})
export class FlightSearchService {
  constructor(private http: HttpClient) {}

  filterFlights(flights: any[], filterStats: FilterStats): any[] {
    return flights.filter((flight) => {
      return this.matchesAllCriteria(flight, filterStats);
    });
  }

  private matchesAllCriteria(flight: any, filterStats: FilterStats): boolean {
    return (
      this.matchesPrice(flight, filterStats.priceRange) &&
      this.matchesStops(flight, filterStats.stopPrices) &&
      this.matchesAirlines(flight, filterStats.carriers || []) &&
      this.matchesTimeRange(flight, filterStats.timeRange) &&
      this.matchesAirports(flight, filterStats.airports || [])
    );
  }

  private matchesPrice(flight: any, priceRange: any): boolean {
    const flightPrice = Math.round(flight.price.raw);
    return (
      flightPrice >= priceRange.minPrice && flightPrice <= priceRange.maxPrice
    );
  }

  private matchesStops(flight: any, stopPrices: any): boolean {
    const stopCount = flight.legs[0].stopCount;

    if (stopCount === 0 && !stopPrices.direct.isActive) return false;
    if (stopCount === 1 && !stopPrices.one.isActive) return false;
    if (stopCount >= 2 && !stopPrices.twoOrMore.isActive) return false;

    return true;
  }

  private matchesAirlines(flight: any, carriers: Airlines[]): boolean {
    const flightCarriers = flight.legs[0].carriers.marketing.map(
      (carrier: any) => carrier.id
    );

    // Check if any active carrier from filters matches any of the flight's carriers
    return flightCarriers.some((flightCarrierId: any) =>
      carriers.some(
        (carrier) => carrier.id === flightCarrierId && carrier.isActive
      )
    );
  }

  private matchesTimeRange(flight: any, timeRange: any): boolean {
    const departureTime = new Date(flight.legs[0].departure);
    const landingTime = new Date(flight.legs[0].arrival);

    const minDeparture = new Date(timeRange.minTimeDeparture);
    const maxDeparture = new Date(timeRange.maxTimeDeparture);
    const minLanding = new Date(timeRange.minTimeLanding);
    const maxLanding = new Date(timeRange.maxTimeLanding);

    return (
      departureTime >= minDeparture &&
      departureTime <= maxDeparture &&
      landingTime >= minLanding &&
      landingTime <= maxLanding
    );
  }

  private matchesAirports(flight: any, locations: Location[]): boolean {
    const departureAirport = flight.legs[0].origin.entityId;
    const arrivalAirport = flight.legs[0].destination.entityId;

    return locations.every((location: Location) => {
      const isValid = location.airports.some((airport) => {
        const hasMatchingAirport =
          parseInt(airport.entityId) === parseInt(departureAirport) ||
          parseInt(airport.entityId) === parseInt(arrivalAirport);

        return hasMatchingAirport ? airport.isActive : true;
      });
      return isValid;
    });
  }

  getAllFlights(
    getStats: boolean = false,
    page: number = 1,
    limit: number = 10
  ): Observable<any> {
    return this.http.get<any>(`${APIUrl}/flights`, {
      params: { page, limit, getStats },
    });
  }

  getFlightByField(
    criteria: Record<string, string | number>,
    page: number = 1,
    limit: number = 10
  ): Observable<any> {
    const paramsWithPagination = {
      ...criteria,
      page,
      limit,
    };

    return this.http.get<any>(`${APIUrl}/flights/search`, {
      params: paramsWithPagination,
    });
  }

  getFlightById(flight_id: string): Observable<any> {
    return this.http.get<any>(`${APIUrl}/flights/${flight_id}`);
  }

  createFlight() {}
  updateFlight(flight_id: string, flightDetail: any): Observable<any> {
    return this.http.put<any>(`${APIUrl}/flights/${flight_id}`, flightDetail);
  }
  deleteFlight() {}
}
