import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Booking } from "./Booking";

@Entity("payment")
export class Payment extends BaseEntity {
  @PrimaryGeneratedColumn()
  payment_id: number;

  @Column()
  amount: number;

  @Column()
  payment_date: Date;

  @Column()
  payment_method: string;

  @Column()
  transaction_id: number;

  // @ManyToOne(() => Booking, (booking) => booking.payments, {
  //   nullable: false,
  // })
  // @JoinColumn({
  //   name: "booking_id",
  // })
  // booking: Booking;
}
