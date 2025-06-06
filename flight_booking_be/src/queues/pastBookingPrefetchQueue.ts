import { Queue } from "bullmq";
import { redisConfig } from "../config/redis";

export const pastBookingPrefetchQueue = new Queue("past-booking-prefetch", {
  connection: redisConfig,
});
