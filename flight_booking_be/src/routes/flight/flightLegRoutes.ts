import * as express from "express";
const router = express.Router();

import * as flightLegController from "../../controllers/flight/flightLegController";
const { authMiddleware } = require("../../middleware/authMiddleware");

// Get all flight legs
router.get("/", flightLegController.getAllFlightLegs);

// Get flight leg by Id
router.get("/:id", flightLegController.getFlightLegById);

// Create new flight leg
router.post("/", flightLegController.createFlightLeg);

// Update a flight leg
router.put("/:id", flightLegController.updateFlightLeg);

// Delete flight leg
router.delete("/:id", flightLegController.deleteFlightLeg);

module.exports = router;
