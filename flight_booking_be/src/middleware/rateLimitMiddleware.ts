import { rateLimit } from "../services/rateLimitService";

const rateLimitMiddleware = async (req, res, next) => {
  const userId = req.user
    ? req.user.id
    : req.ip.startsWith("::ffff:")
    ? req.ip.split(":").pop() // Extract IPv4 part
    : req.ip; // Use user ID if authenticated, else IP

  // console.log("req.user.id", req.user.id);
  console.log("req.ip", req.ip);
  // console.log("req.ip", req.ip);

  // const userId = req.user ? req.user.id : req.ip;

  console.log("userId", userId);

  const limit = 1000; // Max 100 requests
  const window = 60; // 1-minute window

  rateLimit(userId, limit, window)
    .then(() => next())
    .catch((err) => res.status(429).send({ error: err.message }));
};

export { rateLimitMiddleware };
