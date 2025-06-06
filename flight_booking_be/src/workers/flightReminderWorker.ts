import { Worker } from "bullmq";
import { sendFlightReminder } from "../utils/emailService";

import { redisConfig } from "../config/redis";

export const FlightReminderWorker = new Worker(
  "flight-reminders",
  async (job) => {
    const { itinerary, booking, user } = job.data;
    await sendFlightReminder(itinerary, booking, user);
  },
  {
    connection: redisConfig,
  }
);

FlightReminderWorker.on("completed", (job) => {
  console.log(`Reminder job ${job.id} completed`);
});

FlightReminderWorker.on("failed", (job, error) => {
  console.error(`Reminder job ${job.id} failed:`, error);
});
