import { BookingModel } from './booking.model';

export interface FlightItineraryModel {
  itinerary_id: string;
  raw_price: number;
  formatted_price: string;
  is_self_transfer: boolean;
  is_protected_self_transfer: boolean;
  is_change_allowed: boolean;
  is_cancellation_allowed: boolean;
  score: number;
  legs: FlightLegModel[];
  bookings: BookingModel[];
}

export interface FlightLegModel {
  leg_id: string;
  duration_in_minutes: number;
  stop_count: number;
  is_smallest_stops: boolean;
  departure_time: Date;
  arrival_time: Date;
  time_delta_in_days: number;
  origin_iata: string;
  origin_name: string;
  destination_iata: string;
  destination_name: string;
  segments: FlightModel[];
  itinerary_id: FlightItineraryModel;
}

export interface FlightModel {
  flight_id: number;
  flight_number: string;
  depature_time: string;
  arrival_airport: string;
  departure_date: Date;
  arrival_date: Date;
  origin_iata: string;
  origin_name: string;
  destination_iata: string;
  destination_name: string;
  status: string;
  duration_in_minutes: number;
  departureAirport: string;
  arrivalAirport: string;
  leg: FlightLegModel;
}
