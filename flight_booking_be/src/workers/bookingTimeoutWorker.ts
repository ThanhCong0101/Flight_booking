import { Worker } from "bullmq";
import { Booking } from "../models/entity/Booking";
import { AppDataSource } from "../config/db";
import { Flight } from "../models/entity/Flight";

import { redisConfig } from "../config/redis";

export const BookingTimeoutWorker = new Worker(
  "booking-timeout",
  async (job) => {
    const { bookingId } = job.data;

    console.log(`Processing booking timeout for booking: ${bookingId}`);

    const booking = await Booking.findOne({
      where: {
        booking_id: bookingId,
        status: "pending",
      },
      relations: {
        itinerary: {
          legs: {
            segments: true,
          },
        },
      },
    });

    if (booking) {
      const queryRunner = AppDataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        for (const leg of booking.itinerary.legs) {
          for (const segment of leg.segments) {
            await queryRunner.manager.update(
              Flight,
              { flight_id: segment.flight_id },
              { capacity: () => `capacity - ${booking.noPassengers}` }
            );
          }
        }

        await queryRunner.manager.remove(booking);
        console.log(`Removed expired pending booking: ${bookingId}`);
        await queryRunner.commitTransaction();
      } catch (error) {
        await queryRunner.rollbackTransaction();
      } finally {
        await queryRunner.release();
      }
      // Restore seats for each flight segment
    }
  },
  {
    connection: redisConfig,
  }
);
