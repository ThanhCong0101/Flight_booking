import { BookingModel } from "./booking.model";
import { UserModel } from "./user.model";

export interface PassengerModel {
  passenger_id: number;
  first_name: string;
  last_name: string;
  gender: 'male' | 'female' | 'other';
  passport_number: string;
  passport_expiry: Date;
  nationality: string;
  date_of_birth: Date;
  street_address: string;
  city: string;
  country: string;
  postal_code: string;
  booking: BookingModel;
  user: UserModel;
}
