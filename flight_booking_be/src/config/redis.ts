const Redis = require("ioredis");

let client = {} as any;

const node_env = process.env.NODE_ENV || "development";

const redisConfig = {
  host: node_env === 'development' ? 'localhost' :process.env.REDIS_HOST,
  port: node_env === 'development' ? 6380:  Number(process.env.REDIS_PORT),
  retryStrategy: (times: number) => {
    return Math.min(times * 50, 2000);
  },
};

const initRedis = async () => {
  const instanceRedis = new Redis(redisConfig);

  client.instanceConnect = instanceRedis;

  return instanceRedis;
};

const getRedis = () => client;

export { initRedis, redisConfig, getRedis };
