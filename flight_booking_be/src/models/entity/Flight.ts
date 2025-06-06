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
import { Aircraft } from "./Aircraft";
import { Airport } from "./Airport";
import { User } from "./User";
import { Booking } from "./Booking";
import { FlightLeg } from "./FlightLegs";

@Entity("flight")
export class Flight extends BaseEntity {
  @PrimaryColumn({ length: 40 })
  flight_id: string;

  @Column()
  flight_number: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  depature_time: Date;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  arrival_time: Date;

  @Column()
  origin_name: string;

  @ManyToOne(() => Airport, (airport) => airport.departureFlights, {
    nullable: false,
  })
  @JoinColumn({ name: "departure_airport_id", referencedColumnName: "iata" })
  departureAirport: Airport;

  @Column()
  destination_name: string;

  @ManyToOne(() => Airport, (airport) => airport.arrivalFlights, {
    nullable: false,
  })
  @JoinColumn({ name: "arrival_airport_id", referencedColumnName: "iata" })
  arrivalAirport: Airport;

  @Column()
  duration_in_minutes: number;

  @Column({ default: 0 })
  capacity: number;

  @ManyToOne(() => FlightLeg, (leg) => leg.segments, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "leg_id" })
  leg: FlightLeg;

  @ManyToOne(() => Aircraft, (aircraft) => aircraft.flights, {
    eager: true,
  })
  @JoinColumn({ name: "aircraft_id", referencedColumnName: "aircraft_id" })
  aircraft: Aircraft;
}
