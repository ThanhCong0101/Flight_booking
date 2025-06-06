import { Queue } from "bullmq";
import { redisConfig } from "../config/redis";
import { User } from "../models/entity/User";

export const emailResetPasswordQueue = new Queue("email-reset-password", {
  connection: redisConfig,
});

export const addEmailResetPasswordJob = async (
  user: User,
  link_reset_password: string
) => {
  console.log("Adding email reset password job:");
  await emailResetPasswordQueue.add(
    "send-reset-password-email",
    {
      user,
      link_reset_password,
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
