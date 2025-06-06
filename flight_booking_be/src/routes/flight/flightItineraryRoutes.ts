import * as express from "express";
const router = express.Router();

import * as flightItineraryController from "../../controllers/flight/flightItineraryController";
const { authMiddleware } = require("../../middleware/authMiddleware");

// Get all flight itineraries
router.get("/", flightItineraryController.getAllFlightItineraries);

// Get flight itinerary by Id
router.get(
  "/:id",
  flightItineraryController.getFlightItineraryById
);

// Create new flight itinerary
router.post("/", flightItineraryController.createFlightItinerary);

router.post(
  "/create-full-detail",
  flightItineraryController.createFullItinerary
);

// Update a flight itinerary
router.put("/:id", flightItineraryController.updateFlightItinerary);

// Delete flight itinerary
router.delete("/:id", flightItineraryController.deleteFlightItinerary);

module.exports = router;
