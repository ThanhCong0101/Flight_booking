import { BookingModel } from './booking.model';
import { PassengerModel } from './passenger.model';

// export interface UserModel {
//   user_id?: number;
//   first_name?: string;
//   last_name?: string;
//   email: string;
//   password?: string;
//   phone?: number;
//   address?: string;
//   profile_picture?: string;
//   isAdmin?: string;
//   date_of_birth?: Date;
//   date_joined?: Date;
// }

export interface UserModel {
  user_id?: number;
  first_name?: string;
  last_name?: string;
  gender?: 'male' | 'female' | 'other';
  email?: string;
  password?: string;
  refresh_token?: string | null;
  access_token_password?: string | null;
  phone_number?: string | null;
  passport_number?: string | null;
  passport_expiry?: Date | null;
  nationality?: string | null;
  street_address?: string | null;
  city?: string | null;
  country?: string | null;
  postal_code?: string | null;
  profile_picture?: string | null;
  role?: 'admin' | 'user';
  booking?: BookingModel[];
  passengers?: PassengerModel[];
  date_of_birth?: Date;
  date_joined?: Date;
}
