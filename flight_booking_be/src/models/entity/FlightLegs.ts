import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Flight } from "./Flight";
import { FlightItinerary } from "./FlightItinerary";

@Entity("flight_leg")
export class FlightLeg extends BaseEntity {
  @PrimaryColumn()
  leg_id: string;

  @Column()
  duration_in_minutes: number;

  @Column()
  stop_count: number;

  @Column({ type: "boolean" })
  is_smallest_stops: boolean;

  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    precision: 0,
  })
  departure_time: Date;

  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    precision: 0,
  })
  arrival_time: Date;

  @Column()
  time_delta_in_days: number;

  @Column()
  origin_iata: string;

  @Column()
  origin_name: string;

  @Column()
  destination_iata: string;

  @Column()
  destination_name: string;

  @Column()
  day_change: number;

  @OneToMany(() => Flight, (flight) => flight.leg, {
    cascade: true,
    onDelete: "CASCADE",
    eager: true,
  })
  segments: Flight[];

  @ManyToOne(() => FlightItinerary, (itinerary) => itinerary.legs, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "itinerary_id" })
  itinerary_id: FlightItinerary;
}
