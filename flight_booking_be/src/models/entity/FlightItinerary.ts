import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { FlightLeg } from "./FlightLegs";
import { Booking } from "./Booking";
// import { FlightLeg } from "./FlightLeg";

@Entity("flight_itinerary")
export class FlightItinerary extends BaseEntity {
  @PrimaryColumn()
  itinerary_id: string;

  @Column()
  token: string;

  @Column("decimal", { precision: 10, scale: 2 })
  raw_price: number;

  @Column()
  formatted_price: string;

  @Column({ type: "boolean", default: false })
  is_self_transfer: boolean;

  @Column({ type: "boolean", default: false })
  is_protected_self_transfer: boolean;

  @Column({ type: "boolean", default: false })
  is_change_allowed: boolean;

  @Column({ type: "boolean", default: false })
  is_cancellation_allowed: boolean;

  @Column("decimal", { precision: 10, scale: 6 })
  score: number;

  @OneToMany(() => FlightLeg, (leg) => leg.itinerary_id, {
    cascade: true,
    onDelete: "CASCADE",
    eager: true,
  })
  legs: FlightLeg[];

  @OneToMany(() => Booking, (booking) => booking.itinerary, {
    cascade: true,
    onDelete: "CASCADE",
    eager: true, // Add this to ensure related entities are loaded
  })
  bookings: Booking[];
}
