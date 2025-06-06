import CustomError from "../utils/CustomError";

const { ACCESS_TOKEN_SECRET } = require("../config/jwt");


const { verifyToken, decodeToken } = require("../services/authService");

const userService = require("../services/userServices");

const authMiddleware = async (req, res, next) => {
  if(req.user && req.data.isAdmin) {

    next();
  }

  console.log("req data", req.data);

  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const verified = await verifyToken(token, ACCESS_TOKEN_SECRET);

    if (!verified) {
      throw new CustomError("You do not have access to this feature!", 401);
    }

    const decoded = await decodeToken(token, ACCESS_TOKEN_SECRET);

    console.log("decoded", decoded);

    req.data = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    const verified = await verifyToken(token, ACCESS_TOKEN_SECRET);

    console.log("verified", verified);

    if (!verified) {
      throw new CustomError("You do not have access to this feature!", 401);
    }

    const decoded = await decodeToken(token, ACCESS_TOKEN_SECRET);

    console.log("decoded", decoded);
    const user_id = decoded.user_id;

    const user = await userService.getUserById(user_id);

    if (!user) {
      throw new CustomError("User not found", 404);
    }

    console.log("user", user);

    if (user.role !== "admin") {
      throw new CustomError("Access denied. Admin privileges required.", 403);
    }

    req.user = user;
    req.data = { isAdmin: true };
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { authMiddleware, isAdmin };
