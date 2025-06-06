import { Job, Worker } from "bullmq";
import { redisConfig } from "../config/redis";

// const User = require("../models/models-mongodb/user.model");
import { User } from "../models/models-mongodb/user.model";

export const UserSyncWorker = new Worker(
  "user-sync-queue",
  async (job: Job) => {
    const { operation, userData, userId } = job.data;

    try {
      if (operation === "upsert") {
        await User.findOneAndUpdate({ user_id: userData.user_id }, userData, {
          upsert: true,
          new: true,
        });
      } else if (operation === "delete") {
        await User.deleteOne({ user_id: userId });
      }
    } catch (error) {
      console.error("User sync error:", error);
      throw error;
    }
  },
  {
    connection: redisConfig,
  }
);

UserSyncWorker.on("completed", (job: Job) => {
  console.log(`User Sync job completed`);
});

UserSyncWorker.on("failed", (job: Job, error) => {
  console.error("User Sync job failed:", error);
});
