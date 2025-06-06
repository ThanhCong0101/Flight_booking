import * as express from "express";

const router = express.Router();
const aircraftController = require("../controllers/aircraftController");

// Get all aircrafts
router.get("/", aircraftController.getAllAircrafts);

// Get aircraft by Id
router.get("/:id", aircraftController.getAircraftById);

// Create new aircraft
router.post("/", aircraftController.createAircraft);

// Update a aircraft
router.put("/:id", aircraftController.updateAircraft);

// Delete a aircraft
router.delete("/:id", aircraftController.deleteAircraft);

module.exports = router;
