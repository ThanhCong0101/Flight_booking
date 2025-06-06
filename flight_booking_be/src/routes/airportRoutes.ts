import * as express from "express";

const router = express.Router();

import * as airportController from "../controllers/airport/airportController";
import * as airportSearchController from "../controllers/airport/airportSearchController";

/**
 * @swagger
 * /api/airports:
 *   get:
 *     summary: Retrieve all airports
 *     description: Get a list of all airports
 *     responses:
 *       200:
 *         description: A list of airports
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Airport'
 */

// Get all airport
router.get("/", airportController.getAllAirports);

router.get("/search", airportSearchController.getAllAirports);

// Get a airport by Id
router.get("/:id", airportController.getAirportById);

// Create a airport
router.post("/", airportController.createAirport);

router.post("/add", airportController.createMetadataAirport);


// Update a airport
router.put("/:id", airportController.updateAirport);

// Delete a airport
router.delete("/:id", airportController.deleteAirport);

module.exports = router;
