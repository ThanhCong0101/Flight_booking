import { Worker } from "bullmq";
import { Booking } from "../models/entity/Booking";
import { getRedis, redisConfig } from "../config/redis";
import { Flight } from "../models/entity/Flight";

export const flightPrefetchWorker = new Worker(
  "flight-prefetch",
  async (job) => {
    const client = getRedis();
    const ttl_flight = 60 * 3; // Cache for 3 minutes
    const redisClient = client.instanceConnect;
    const { page, pageSize, timestamp, getStats } = job.data;
    console.log("job data", job.data);

    const [flights, total] = await Flight.createQueryBuilder("flight")
      .leftJoinAndSelect("flight.aircraft", "aircraft")
      .leftJoinAndSelect("flight.departureAirport", "departure_airport")
      .leftJoinAndSelect("flight.arrivalAirport", "arrival_airport")
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    // Cache key format: bookings:${roundedTimestamp}:${page}
    let response: { flights: Flight[]; total: number; statistics?: any } = {
      flights,
      total,
    };

    // If statistics are requested, fetch them separately
    if (getStats) {
      const stats = await Flight.createQueryBuilder("flight")
        .select([
          "MIN(flight.duration_in_minutes) as minDuration",
          "MAX(flight.duration_in_minutes) as maxDuration",
          "AVG(flight.duration_in_minutes) as avgDuration",
          "COUNT(*) as totalFlights",
        ])
        .getRawOne();

      const statistics = {
        duration: {
          min: stats.minDuration,
          max: stats.maxDuration,
          average: Math.round(stats.avgDuration),
        },
        totalFlights: stats.totalFlights,
      };

      response = { ...response, statistics };
    }

    console.log("flight", flights.length, " at ", page);
    if (flights.length > 0) {
      const cacheKey = `flight:${timestamp}:${page}`;
      console.log("cacheKey", cacheKey);

      await redisClient.set(
        cacheKey,
        JSON.stringify(response),
        "NX",
        "EX",
        ttl_flight
      );
    }
  },
  {
    connection: redisConfig,
  }
);

flightPrefetchWorker.on("completed", (job) => {
  console.log(`Flight Prefetch job ${job.id} completed`);
});

flightPrefetchWorker.on("failed", (job, error) => {
  console.error(`Flight Prefetch job ${job.id} failed:`, error);
});
