import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToMany,
  AfterLoad,
  BeforeInsert,
  BeforeUpdate,
} from "typeorm";
import { Booking } from "./Booking";
import { Passenger } from "./Passenger";

@Entity("user")
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column({ nullable: true })
  first_name: string;

  @Column({ nullable: true })
  last_name: string;

  @Column({ nullable: true })
  full_name: string;

  @AfterLoad()
  @BeforeInsert()
  @BeforeUpdate()
  computeFullName() {
    this.full_name = `${this.first_name || ""} ${this.last_name || ""}`.trim();
  }

  @Column({
    type: "enum",
    enum: ["male", "female", "other"],
  })
  gender: string;

  @Column({
    unique: true,
  })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  refresh_token: string;

  @Column({ nullable: true })
  access_token_password: string;

  @Column({ nullable: true, unique: true })
  phone_number: string;

  @Column({ nullable: true })
  passport_number: string;

  @Column({ type: "date", nullable: true })
  passport_expiry: Date;

  @Column({ nullable: true })
  nationality: string;

  @Column({ nullable: true })
  street_address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  postal_code: string;

  @Column({ nullable: true })
  profile_picture: string;

  @Column({
    type: "enum",
    enum: ["admin", "user"],
    default: "user",
    // enumName: "user_role_enum",
    // charset: "utf8mb4",
    // collation: "utf8mb4_unicode_ci",
  })
  role: string;

  @Column({
    default: "UTC",
    nullable: true,
  })
  timezone: string;

  @OneToMany(() => Booking, (booking) => booking.user)
  booking: Booking[];

  @OneToMany(() => Passenger, (passenger) => passenger.user)
  passengers: Passenger[];

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  date_of_birth: Date;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  date_joined: Date;
}
