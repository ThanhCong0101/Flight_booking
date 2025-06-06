import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Flight } from "./Flight";

@Entity("airport")
export class Airport extends BaseEntity {
  @PrimaryColumn()
  iata: string;

  @Column({nullable: true})
  sky_id: string;

  @Column({nullable: true})
  icao: string;

  @Column({nullable: true})
  name: string;

  @Column({nullable: true})
  location: string;

  @Column({nullable: true})
  id: string;

  @Column({nullable: true})
  time_zone: string;

  @OneToMany(() => Flight, (flight) => flight.departureAirport)
  departureFlights: Flight[];

  @OneToMany(() => Flight, (flight) => flight.arrivalAirport)
  arrivalFlights: Flight[];
}
