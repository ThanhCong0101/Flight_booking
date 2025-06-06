import { Queue } from "bullmq";

import { redisConfig } from "../config/redis";

const bookingStatusQueue = new Queue("booking-status-updates", {
  connection: redisConfig,
});

// Add recurring job
export const addBookingStatusJob = async () => {
  await bookingStatusQueue.add(
    "update-status",
    {},
    {
      repeat: {
        every: 1000 * 60 * 60, // Run every hour
      },
    }
  );
};
