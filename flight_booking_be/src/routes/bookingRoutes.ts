import * as express from "express";

const router = express.Router();
const bookingController = require("../controllers/bookingController");
const { authMiddleware, isAdmin } = require("../middleware/authMiddleware");

// Get all booking
router.get("/", bookingController.getAllBookings);

// Get bookings by field
router.get("/search", bookingController.getBookingByField);

router.get("/upcoming/:user_id", bookingController.getUpcomingBookings);

router.get("/past/:user_id", bookingController.getPastBookings);

// Get a booking by user Id
router.get("/user/:user_id", isAdmin, bookingController.getBookingByUserId);

router.get(
  "/availability-seat/:itinerary_id",
  bookingController.checkAvailabilitySeat
);

// Get a booking by Id
router.get("/:id", bookingController.getBookingById);

router.post("/booking-pending", bookingController.bookingPending);

// Create a booking
router.post("/", bookingController.createBooking);

router.patch("/add-new-passenger", bookingController.addNewPassenger);

// Update a booking
router.put("/:id", bookingController.updateBooking);

// Delete a booking
router.delete("/:id", bookingController.deleteBooking);

// Delete passenger in pending booking
router.delete(
  "/remove-passenger/:booking_id",
  bookingController.deletePassengerPendingBooking
);

// Delete Booking Pending
router.delete("/pending/:id", bookingController.deleteBookingPending);

module.exports = router;
