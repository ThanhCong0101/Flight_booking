const paymentService = require("../services/paymentService");

const getAllPayments = async (req, res) => {
  try {
    const payments = await paymentService.getAllPayments();
    return res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPaymentById = async (req, res) => {
  try {
    const payment = await paymentService.getPaymentById(req.params.id);
    return res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createPayment = async (req, res) => {
  try {
    const payment = await paymentService.createPayment(req.body);
    return res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePayment = async (req, res) => {
  try {
    const payment = await paymentService.updatePayment(req.params.id, req.body);
    return res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deletePayment = async (req, res) => {
  try {
    await paymentService.deletePayment(req.params.id);
    return res.json({ message: "Payment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
};
