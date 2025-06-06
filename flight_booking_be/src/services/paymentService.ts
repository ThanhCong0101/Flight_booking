import { Booking } from "../models/entity/Booking";
import { Payment } from "../models/entity/Payment";

const getAllPayments = async () => {
  try {
    const payments = await Payment.find();
    return payments;
  } catch (error) {
    console.error("Error fetching payments:", error);
    throw error;
  }
};

const getPaymentById = async (payment_id) => {
  try {
    const payment = await Payment.findOne({ where: { payment_id } });
    return payment;
  } catch (error) {
    console.error(`Error fetching payment with id ${payment_id}:`, error);
    throw error;
  }
};

const createPayment = async (paymentDetail) => {
  try {
    // Check booking is exist
    const booking = await Booking.findOne({
      where: {
        booking_id: paymentDetail.booking_id,
      },
    });
    if (!booking) {
      throw new Error("Booking not found");
    }

    const payment = Payment.create({
      ...paymentDetail,
      booking,
    });

    await payment.save();
    return payment;
  } catch (error) {
    console.error("Error creating payment:", error);
    throw error;
  }
};

const updatePayment = async (id, paymentDetail) => {
  try {
    const payment = await Payment.findOne({
      where: { payment_id: id },
    });
    if (!payment) {
      throw new Error(`Payment with id ${id} not found`);
    } else {
      Object.assign(payment, paymentDetail);
      await payment.save();
      return payment;
    }
  } catch (error) {
    console.error(`Error updating payment with id ${id}:`, error);
    throw error;
  }
};

const deletePayment = async (payment_id) => {
  try {
    const payment = await Payment.findOne({ where: { payment_id } });
    if (!payment) {
      throw new Error(`Payment with id ${payment_id} not found`);
    } else {
      await payment.remove();
      return payment;
    }
  } catch (error) {
    console.error(`Error deleting payment with id ${payment_id}:`, error);
    throw error;
  }
};

module.exports = {
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
};
