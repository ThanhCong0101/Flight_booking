import { FlightItineraryModel } from './flight.model';
import { PassengerModel } from './passenger.model';
import { UserModel } from './user.model';

export interface BookingModel {
  booking_id: number;
  booking_date: Date;
  status: String;
  flight: number;
  user: UserModel;
  total_price: number;
}

export interface BookingModel {
  booking_id: number;
  booking_date: Date;
  status: String;
  itinerary: FlightItineraryModel;
  user: UserModel;
  passengers: PassengerModel[];
  total_price: number;
}

export interface BookingSearchData {
  bookings: any[];
  total: number;
  isLoading: boolean;
}
