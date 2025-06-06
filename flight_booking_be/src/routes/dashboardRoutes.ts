import * as express from "express";

const router = express.Router();
const dashboardController = require("../controllers/dashboardController");

const { authMiddleware, isAdmin } = require("../middleware/authMiddleware");

router.get("/metrics", dashboardController.getDashboardMetrics);

router.get("/trends", dashboardController.getDashboardTrends);

router.get("/destinations", dashboardController.getPopularDestinations);

module.exports = router;
