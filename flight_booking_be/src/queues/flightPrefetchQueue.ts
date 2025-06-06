import { Queue } from "bullmq";
import { redisConfig } from "../config/redis";

export const flightPrefetchQueue = new Queue("flight-prefetch", {
  connection: redisConfig,
});
