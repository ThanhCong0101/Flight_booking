import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";
import { Passenger } from "./Passenger";
import { FlightItinerary } from "./FlightItinerary";

@Entity("booking")
export class Booking extends BaseEntity {
  @PrimaryGeneratedColumn()
  booking_id: number;

  @Column()
  booking_date: Date;

  @Column({
    type: "enum",
    enum: ["pending", "approved", "rejected", "complete", "cancel"],
  })
  status: string;

  @Column()
  total_price: string;

  @Column({
    default: 1,
  })
  noPassengers: number;

  @ManyToOne(() => FlightItinerary, (itinerary) => itinerary.bookings, {
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "itinerary_id",
  })
  itinerary: FlightItinerary;

  @ManyToOne(() => User, (user) => user.booking, { nullable: false })
  @JoinColumn({
    name: "user_id",
  })
  user: User;

  @OneToMany(() => Passenger, (passenger) => passenger.booking, {
    cascade: true,
    onDelete: "CASCADE",
  })
  passengers: Passenger[];
}
