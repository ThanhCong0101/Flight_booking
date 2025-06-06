import * as express from "express";
import { chatbotAuthMiddleware } from "../middleware/chatbotAuthMiddleware";
import { verifyBookingMiddleware } from "../middleware/verifyBookingMiddleware";

const router = express.Router();

const bookingController = require("../controllers/bookingController");
const userController = require("../controllers/userController");

router.get("/verify-user", chatbotAuthMiddleware, userController.getUsers);

router.delete(
  "/cancel-flight",
  chatbotAuthMiddleware,
  verifyBookingMiddleware,
  bookingController.deleteBooking
);

module.exports = router;
