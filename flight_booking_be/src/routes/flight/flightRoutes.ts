import * as express from "express";

const router = express.Router();

import * as flightController from "../../controllers/flight/flightController";
const { authMiddleware } = require("../../middleware/authMiddleware");

// Get all flights
router.get("/", flightController.getAllFlights);

// Add this new route
router.get('/statistics', flightController.getFlightStatistics);

// Get flights by field
router.get("/search", flightController.getFlightByField);

// Get flight by Id
router.get("/:id", flightController.getFlightById);

// Create new flight
router.post("/", flightController.createFlight);

// Update a flight
router.put("/:id", flightController.updateFlight);

// Delete flight
router.delete("/:id", flightController.deleteFlight);

module.exports = router;
