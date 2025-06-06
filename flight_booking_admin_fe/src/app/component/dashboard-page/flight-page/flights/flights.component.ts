import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  Airlines,
  FilterStats,
  Location,
  PriceRange,
  Stop,
  TimeRange,
} from 'src/app/models/cardFilter.model';
import {
  Flight,
  TransformedFlight,
  TransformedItinerary,
} from 'src/app/models/flight.model';
import { FlightSearchService } from 'src/app/services/flightSearch.service';

@Component({
  selector: 'app-flights',
  templateUrl: './flights.component.html',
  styleUrls: ['./flights.component.css'],
})
export class FlightsComponent implements OnInit {
  flights = signal<Flight[]>([]);
  data = signal<any>({});

  filterStats = signal<FilterStats>({} as FilterStats);
  isLoading = signal<boolean>(true);
  allFlights: any[] = [];

  currentPage = signal<number>(1);
  flightListResult = signal<any[]>([]);
  pageSize = signal<number>(20);

  totalPages = signal<number>(0);
  searchType = signal<string>('flight');

  paramsFlightSearch = signal<{
    flightSearch: string;
    sortBy: string;
    sortOrder: string;
  }>({
    flightSearch: '',
    sortBy: '',
    sortOrder: '',
  });

  itineararyListResult = signal<any[]>([]);
  itineararyListFilter = signal<any[]>([]);
  resultFilterItinearary = signal<any>({});

  constructor(
    private _flightSearchService: FlightSearchService,
    private flightSearchService: FlightSearchService
  ) {}

  ngOnInit() {
    // Get all flight data with statistics
    this._flightSearchService
      .getAllFlights(true, this.currentPage(), this.pageSize())
      .subscribe((data) => {
        this.isLoading.set(true);
        this.searchType.set('flight');
        const transformedFlights = data.flights.map((flight: any) =>
          this.transformFlightData(flight)
        );
        this.flights.set(transformedFlights);
        this.totalPages.set(Math.ceil(data.total / this.pageSize()));

        this.data.set({
          searchType: this.searchType(),
          data: this.flights(),
          totalPage: this.totalPages(),
        });

        console.log('data', data);

        this.filterStats.set({
          duration: {
            min: data.statistics.duration.min,
            max: data.statistics.duration.max,
          },
          searchType: this.searchType(),
          airports: [] as Location[],
          carriers: [] as Airlines[],
          stopPrices: {} as Stop,
          timeRange: {
            minTimeDeparture: new Date().toDateString(),
            maxTimeDeparture: new Date().toDateString(),
            minTimeLanding: new Date().toDateString(),
            maxTimeLanding: new Date().toDateString(),
          },
          priceRange: {} as PriceRange,
        });

        this.isLoading.set(false);
      });
  }

  // Flight Search Change
  searchTypeChange(searchType: string) {
    this.searchType.set(searchType);
  }

  paramsFlightSearchChange(param: any) {
    console.log('params: ', param);
    this.isLoading.set(true);

    const { flightSearch, sortBy, sortOrder } = param;

    this.paramsFlightSearch.set({ flightSearch, sortBy, sortOrder });

    this.flightSearchService
      .getFlightByField(
        {
          flightSearch,
          sortBy,
          sortOrder,
        },
        this.currentPage(),
        this.pageSize()
      )
      .subscribe((data: any) => {
        this.searchType.set('flight');
        if (data) {
          const transformedFlights = data.flights.map((flight: any) =>
            this.transformFlightData(flight)
          );
          this.flights.set(transformedFlights);
          this.totalPages.set(Math.ceil(data.total / this.pageSize()));

          this.data.update(() => {
            return {
              searchType: this.searchType(),
              data: this.flights(),
              totalPage: this.totalPages(),
            };
          });

          console.log('data', data);

          this.filterStats.set({
            duration: {
              min: data.statistics.duration.min,
              max: data.statistics.duration.max,
            },
            searchType: this.searchType(),
            airports: [] as Location[],
            carriers: [] as Airlines[],
            stopPrices: {} as Stop,
            timeRange: {
              minTimeDeparture: new Date().toDateString(),
              maxTimeDeparture: new Date().toDateString(),
              minTimeLanding: new Date().toDateString(),
              maxTimeLanding: new Date().toDateString(),
            },
            priceRange: {} as PriceRange,
          });

          this.isLoading.set(false);
        } else {
          this.data.set({
            searchType: this.searchType(),
            data: [],
            totalPage: 1,
          });
          this.filterStats.set({
            duration: {
              min: 10,
              max: 100,
            },
            searchType: this.searchType(),
            airports: [] as Location[],
            carriers: [] as Airlines[],
            stopPrices: {} as Stop,
            timeRange: {} as TimeRange,
            priceRange: {} as PriceRange,
          });
          this.isLoading.set(false);
        }
      });
  }

  transformFlightData(apiResponse: any): TransformedFlight {
    return {
      flight_id: apiResponse.flight_id,
      airline: apiResponse.aircraft.name,
      departure: apiResponse.departureAirport.iata,
      destination: apiResponse.arrivalAirport.iata,
      departure_time: apiResponse.depature_time,
      arrival_time: apiResponse.arrival_time,
      duration_in_minutes: apiResponse.duration_in_minutes,
      available_seats: apiResponse.capacity, // You might need to calculate this based on bookings
      capacity: apiResponse.capacity,
      status: 'on_time', // Default status, adjust as needed
    };
  }

  itinerarySearchResultChange(data: any) {
    this.isLoading.set(true);

    setTimeout(() => {
      this.searchType.set('itinerary');

      this.itineararyListResult.set(data.itinerary);

      this.itineararyListFilter.set(this.itineararyListResult());

      const transformedItinerary = data.itinerary.map((flight: any) =>
        this.transformItineraryData(flight)
      );

      const firstPage = transformedItinerary.slice(0, this.pageSize());

      this.totalPages.set(Math.ceil(data.total / this.pageSize()));

      this.data.set({
        searchType: this.searchType(),
        data: firstPage,
        totalPage: this.totalPages(),
      });

      console.log('data itinerary', this.data());

      // Set up Filter Stats for Itinerary
      this.setFilterStats(data.itinerary, data.filterStats);
      this.isLoading.set(false);
    }, 1000);
  }

  transformItineraryData(apiResponse: any): TransformedItinerary {
    const leg = apiResponse.legs[0]; // Getting first leg since it's a direct flight

    let duration = 0;
    let stops = 0;

    apiResponse.legs.forEach((leg: any) => {
      if (leg.durationInMinutes > 0) {
        duration += leg.durationInMinutes;
      }

      if (leg.stopCount > 0) {
        stops = Math.max(leg.stopCount, stops);
      }
    });

    return {
      itinerary_id: apiResponse.id,
      airline: leg.carriers.marketing[0].name,
      departure: leg.origin.displayCode,
      destination: leg.destination.displayCode,

      departure_time: leg.departure,
      arrival_time: leg.arrival,
      duration: `${Math.floor(duration / 60)}h ${duration % 60}m`,
      stops: stops,
    };
  }

  setFilterStats(itineraries: any, filterStats: any) {
    console.log('Received filterStats:', filterStats); // Add this

    this.filterStats.update(() => {
      const { duration, airports, carriers } = filterStats;

      const stopPrices = filterStats.stopPrices;
      stopPrices.direct.isActive = stopPrices.direct.isPresent;
      stopPrices.one.isActive = stopPrices.one.isPresent;
      stopPrices.twoOrMore.isActive = stopPrices.twoOrMore.isPresent;

      carriers.forEach((carrier: Airlines) => {
        carrier.isActive = true;
      });

      airports.forEach((location: Location) => {
        location.airports.forEach((airport) => {
          airport.isActive = true;
        });
      });

      const { minTime: minTimeDeparture, maxTime: maxTimeDeparture } =
        this.getMinMaxTimes(itineraries, 'departure');

      const { minTime: minTimeLanding, maxTime: maxTimeLanding } =
        this.getMinMaxTimes(itineraries, 'arrival');

      const timeRange = {
        minTimeDeparture: minTimeDeparture || new Date().toISOString(),
        maxTimeDeparture: maxTimeDeparture || new Date().toISOString(),
        minTimeLanding: minTimeLanding || new Date().toISOString(),
        maxTimeLanding: maxTimeLanding || new Date().toISOString(),
      };

      console.log('timeRange:', timeRange); // Add this

      const priceRange: PriceRange = this.getMinMaxPrice(itineraries);

      return {
        searchType: this.searchType(),
        duration,
        airports,
        carriers,
        stopPrices,
        timeRange,
        priceRange,
      };
    });
  }

  getMinMaxTimes(
    itineraries: any[],
    field: string
  ): {
    minTime: string;
    maxTime: string;
  } {
    const timesRange = itineraries.map((itinerary) => itinerary.legs[0][field]);

    const sortedTimes = timesRange.sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateA.getTime() - dateB.getTime();
    });

    return {
      minTime: sortedTimes[0],
      maxTime: sortedTimes[sortedTimes.length - 1],
    };
  }

  getMinMaxPrice(itineraries: any[]): PriceRange {
    const prices: number[] = itineraries.map((itinerary: any) =>
      Math.round(itinerary.price.raw)
    );
    return {
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
    };
  }

  // Setup Filter Stats
  filterStatsChange(filterStats: FilterStats) {
    // window.scrollTo({ top: 0, behavior: 'smooth' });
    console.log('filterStats', filterStats);

    setTimeout(() => {
      this.isLoading.set(true);
      if (filterStats.searchType === 'flight') {
        const maxDuration = filterStats.duration.max;

        this.flightSearchService
          .getFlightByField(
            {
              flightSearch: this.paramsFlightSearch().flightSearch,
              sortBy: this.paramsFlightSearch().sortBy,
              sortOrder: this.paramsFlightSearch().sortOrder,
              durationFilter: maxDuration,
            },
            this.currentPage(),
            this.pageSize()
          )
          .subscribe((data) => {
            this.searchType.set('flight');
            if (data) {
              const transformedFlights = data.flights.map((flight: any) =>
                this.transformFlightData(flight)
              );
              this.flights.set(transformedFlights);
              this.totalPages.set(Math.ceil(data.total / this.pageSize()));

              this.data.update(() => {
                return {
                  searchType: this.searchType(),
                  data: this.flights(),
                  totalPage: this.totalPages(),
                };
              });
            } else {
              this.data.set({
                searchType: this.searchType(),
                data: [],
                totalPage: 1,
              });
            }
          });
      } else {
        if (this.itineararyListResult()) {
          this.itineararyListFilter.set(
            this._flightSearchService.filterFlights(
              this.itineararyListResult(),
              filterStats
            )
          );

          console.log('filtered Flights', this.itineararyListFilter());

          this.currentPage.set(1);
          this.totalPages.set(
            Math.ceil(this.itineararyListFilter().length / this.pageSize())
          );

          const filterItinearary = this.itineararyListFilter().slice(
            0,
            this.pageSize()
          );

          console.log('filter Itinearary', filterItinearary);

          const transformedItinerary = filterItinearary.map((itinerary: any) =>
            this.transformItineraryData(itinerary)
          );

          this.data.set({
            searchType: this.searchType(),
            data: transformedItinerary,
            totalPage: this.totalPages(),
          });

          this.isLoading.set(false);
        }
      }
      this.isLoading.set(false);
    }, 1000);
  }

  flightPageChange(page: number) {
    console.log('flight page', page);
    this.currentPage.set(page);

    this.flightSearchService
      .getFlightByField(this.paramsFlightSearch(), page, this.pageSize())
      .subscribe((data: any) => {
        console.log('data', data);
        const transformedFlights = data.flights.map((flight: any) =>
          this.transformFlightData(flight)
        );
        this.flights.set(transformedFlights);
        this.totalPages.set(Math.ceil(data.total / this.pageSize()));

        this.data.set({
          searchType: this.searchType(),
          data: this.flights(),
          totalPage: this.totalPages(),
        });
      });
  }

  itineraryPageChange(page: number) {
    console.log('itinerary page', page);
    this.currentPage.set(page);

    const startIndex = page * this.pageSize();
    const endIndex = startIndex + this.pageSize();

    const nextPageData = this.itineararyListFilter().slice(
      startIndex,
      endIndex
    );

    console.log('nextPageData', nextPageData);

    const transformedItinerary = nextPageData.map((itinerary: any) =>
      this.transformItineraryData(itinerary)
    );

    this.data.set({
      searchType: this.searchType(),
      data: transformedItinerary,
      totalPage: this.totalPages(),
    });
  }
}
