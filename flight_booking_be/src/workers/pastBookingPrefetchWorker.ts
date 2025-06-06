import { Worker } from "bullmq";
import { Booking } from "../models/entity/Booking";
import { redisConfig, getRedis } from "../config/redis";

export const PastBookingPrefetchWorker = new Worker(
  "past-booking-prefetch",
  async (job) => {
    const ttl_booking = 60 * 3; // Cache for 3 minutes
    const client = getRedis();
    const redisClient = client.instanceConnect;
    const { page, pageSize, timestamp, user_id } = job.data;

    let queryBuilder = Booking.createQueryBuilder("booking");

    queryBuilder = queryBuilder
      .leftJoinAndSelect("booking.passengers", "passengers")
      .leftJoinAndSelect("booking.itinerary", "itinerary")
      .leftJoinAndSelect("itinerary.legs", "legs")
      .leftJoinAndSelect("legs.segments", "segments")
      .leftJoinAndSelect("segments.aircraft", "aircraft")
      .leftJoin("booking.user", "user")
      .addSelect([
        "user.user_id",
        "user.email",
        "user.first_name",
        "user.last_name",
        "user.phone_number",
        "user.profile_picture",
      ])
      .where("booking.status = :completeStatus", { completeStatus: "complete" })
      .orWhere("booking.status = :pendingStatus", {
        pendingStatus: "pending",
      });

    if (user_id) {
      queryBuilder = queryBuilder.andWhere("booking.user_id = :user_id", {
        user_id,
      });
    }

    const [pastBookings, totalPast] = await queryBuilder
      .skip((parseInt(page) - 1) * parseInt(pageSize))
      .take(parseInt(pageSize))
      .getManyAndCount();

    // Cache key format: bookings:${roundedTimestamp}:${page}

    console.log("pastBookings", pastBookings.length, " at ", page);
    if (pastBookings.length > 0) {
      const cacheKey = `past-bookings:${timestamp}:${page}`;
      console.log("cacheKey", cacheKey);
      await redisClient.set(
        cacheKey,
        JSON.stringify({ bookings: pastBookings, total: totalPast }),
        "EX",
        ttl_booking
      );
    }
  },
  {
    connection: redisConfig,
  }
);

PastBookingPrefetchWorker.on("completed", (job) => {
  console.log(`Booking Prefetch job ${job.id} completed`);
});

PastBookingPrefetchWorker.on("failed", (job, error) => {
  console.error(`Booking Prefetch job ${job.id} failed:`, error);
});
