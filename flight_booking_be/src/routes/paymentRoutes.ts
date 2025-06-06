import * as express from "express";

const router = express.Router();
const paymentController = require("../controllers/paymentController");
const momoPaymentController = require("../controllers/payment/momoController");

router.post("/payment", momoPaymentController.redirectMoMoGateway);

router.post(
  "/check-status-transaction",
  momoPaymentController.checkStatusTransaction
);

router.post("/callback", momoPaymentController.callback);

// Get all payment
router.get("/", paymentController.getAllPayments);

// Get a payment by payment
router.get("/:id", paymentController.getPaymentById);

// Create a payment
router.post("/", paymentController.createPayment);

// Update a payment
router.put("/:id", paymentController.updatePayment);

// Delete a payment
router.delete("/:id", paymentController.deletePayment);

module.exports = router;
