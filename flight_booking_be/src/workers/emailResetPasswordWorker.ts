import { Worker } from "bullmq";
import { sendPasswordResetEmail } from "../utils/emailService";
import { redisConfig } from "../config/redis";

export const EmailResetPasswordWorker = new Worker(
  "email-reset-password",
  async (job) => {
    const { user, link_reset_password } = job.data;
    await sendPasswordResetEmail(user, link_reset_password);
    return { sent: true };
  },
  {
    connection: redisConfig,
    autorun: true,
    concurrency: 1,
  }
);

EmailResetPasswordWorker.on("completed", (job) => {
  console.log(`Email reset-password job ${job.id} completed`);
});

EmailResetPasswordWorker.on("failed", (job, error) => {
  console.error(`Email reset-password job ${job.id} failed:`, error);
});
