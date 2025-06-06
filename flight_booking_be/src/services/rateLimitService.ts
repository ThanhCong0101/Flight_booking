import { getRedis } from "../config/redis";

const client = getRedis();

const rateLimit = async (identifier, limit, windowInSeconds) => {
  const redisClient = client.instanceConnect;

  const key = `rate_limit:${identifier}`;

  // Increment the count for the key
  const currentCount = await redisClient.incr(key);

  console.log("currentCount", currentCount);

  if (currentCount === 1) {
    // Set expiration for the first request
    await redisClient.expire(key, windowInSeconds);
  }

  if (currentCount > limit) {
    // Block request if the limit is exceeded
    throw new Error("Too many requests. Please try again later.");
  }
};

export { rateLimit };
