import { Worker } from "bullmq";
import { sendBookingInvoice } from "../utils/emailService";
import { redisConfig } from "../config/redis";

console.log("redisConfig", redisConfig);

export const EmailInvoiceWorker = new Worker(
  "email-invoice",
  async (job) => {
    const { booking, itinerary } = job.data;
    await sendBookingInvoice(booking, itinerary);
    return { sent: true };
  },
  {
    connection: redisConfig,
    autorun: true,
    concurrency: 1,
  }
);

EmailInvoiceWorker.on("completed", (job) => {
  console.log(`Email invoice job ${job.id} completed`);
});

EmailInvoiceWorker.on("failed", (job, error) => {
  console.error(`Email invoice job ${job.id} failed:`, error);
});
