import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Booking } from "./Booking";
import { User } from "./User";

@Entity("passenger")
export class Passenger extends BaseEntity {
  @PrimaryGeneratedColumn()
  passenger_id: number;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({
    type: "enum",
    enum: ["male", "female", "other"],
  })
  gender: string;

  @Column()
  passport_number: string;

  @Column({ type: "date" })
  passport_expiry: Date;

  @Column()
  nationality: string;

  @Column({ type: "timestamp" })
  date_of_birth: Date;

  @Column()
  street_address: string;

  @Column()
  city: string;

  @Column()
  country: string;

  @Column()
  postal_code: string;

  @ManyToOne(() => Booking, (booking) => booking.passengers, {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "booking_id",
    referencedColumnName: "booking_id",
  })
  booking: Booking;

  @ManyToOne(() => User, (user) => user.passengers, { nullable: false })
  @JoinColumn({
    name: "user_id",
  })
  user: User;

  @BeforeInsert()
  @BeforeUpdate()
  validatePassportExpiry() {
    if (new Date(this.passport_expiry) <= new Date()) {
      throw new Error("Passport must not be expired");
    }
  }
}
