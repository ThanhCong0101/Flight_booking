import { Queue } from "bullmq";

import { redisConfig } from "../config/redis";

export const upcomingBookingPrefetchQueue = new Queue(
  "upcoming-booking-prefetch",
  {
    connection: redisConfig,
  }
);
