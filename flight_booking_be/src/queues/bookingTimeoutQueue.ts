import { Queue } from "bullmq";

import { redisConfig } from "../config/redis";

export const bookingTimeoutQueue = new Queue("booking-timeout", {
  connection: redisConfig,
});

export const addBookingTimeoutJob = async (bookingId: string) => {
  await bookingTimeoutQueue.add(
    "remove-pending-booking",
    { bookingId },
    {
      delay: 5 * 60 * 1000, // 5 minutes
      removeOnComplete: true,
      jobId: `booking-timeout-${bookingId}`,
    }
  );
};
