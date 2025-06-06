import * as express from "express";

const router = express.Router();
const passengerController = require("../controllers/passengerController");
const { authMiddleware } = require("../middleware/authMiddleware");

router.get("/", passengerController.getAllPassengers);
router.get("/search", passengerController.getPassengers);

router.get("/:id", passengerController.getPassengerById);
router.get("/recent/:userId", passengerController.getRecentPassengersByUserId);

router.post("/", passengerController.createPassenger);
router.patch("/:id", passengerController.updatePassenger);
router.delete("/:id", passengerController.deletePassenger);

module.exports = router;
