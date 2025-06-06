import { Queue } from "bullmq";
import { redisConfig } from "../config/redis";

const userSyncQueue = new Queue("user-sync-queue", {
  connection: redisConfig,
});

export const syncUserToMongoJob = async (mysqlUser: any) => {
  console.log("mysqlUser", mysqlUser);

  const mongoUserData = {
    user_id: mysqlUser.user_id.toString(),
    type: mysqlUser.role,
    first_name: mysqlUser.first_name,
    last_name: mysqlUser.last_name,
    email: mysqlUser.email,
    phone: mysqlUser.phone_number,
    gender: mysqlUser.gender,
    is_temporary: false,
  };

  await userSyncQueue.add("sync-user", {
    operation: "upsert",
    userData: mongoUserData,
  });
};

export const deleteUserFromMongo = async (userId: number) => {
  await userSyncQueue.add("sync-user", {
    operation: "delete",
    userId: userId.toString(),
  });
};
