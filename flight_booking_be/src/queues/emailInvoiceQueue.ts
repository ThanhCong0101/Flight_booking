import { Queue } from "bullmq";

import { redisConfig } from "../config/redis";

export const emailInvoiceQueue = new Queue("email-invoice", {
  connection: redisConfig,
});

export const addEmailInvoiceJob = async (booking, itinerary) => {
  console.log("Adding email invoice job:");
  await emailInvoiceQueue.add(
    "send-invoice",
    {
      booking,
      itinerary,
    },
    {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
    }
  );
};
