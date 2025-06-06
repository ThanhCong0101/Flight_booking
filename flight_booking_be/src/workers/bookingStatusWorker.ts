import { Worker } from "bullmq";
import { Booking } from "../models/entity/Booking";
import { Not } from "typeorm";
import { AppDataSource } from "../config/db";

import { redisConfig } from "../config/redis";

export const BookingStatusWorker = new Worker(
  "booking-status-updates",
  async (job) => {
    const now = new Date();
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const approvedBookings = await queryRunner.manager.find(Booking, {
        where: {
          status: "approved",
        },
        relations: ["itinerary", "itinerary.legs"],
      });

      if (approvedBookings.length) {
        for (const booking of approvedBookings) {
          const legs = booking.itinerary.legs;
          const lastLeg = legs[legs.length - 1];

          if (new Date(lastLeg.arrival_time) < now) {
            booking.status = "complete";
            await booking.save();

            console.log(
              `Booking ${booking.booking_id} status updated to complete`
            );
          }
        }
      }
      await queryRunner.commitTransaction();
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  },
  {
    connection: redisConfig,
  }
);

BookingStatusWorker.on("completed", (job) => {
  console.log(`Booking status update job completed`);
});

BookingStatusWorker.on("failed", (job, error) => {
  console.error("Booking status update job failed:", error);
});
