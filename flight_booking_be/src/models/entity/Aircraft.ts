import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from "typeorm";
import { Flight } from "./Flight";

@Entity("aircraft")
export class Aircraft extends BaseEntity {
  @PrimaryColumn()
  aircraft_id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  alternateId: string;

  @Column({ nullable: true })
  displayCode: string;

  @Column({ nullable: true })
  logoUrl: string;

  @OneToMany(() => Flight, (flight) => flight.aircraft, {
    nullable: false,
  })
  flights: Flight[];

  // @OneToMany(() => Flight, (flight) => flight.aircraft)
  // flights: Flight[];
}
