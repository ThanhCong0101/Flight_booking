const bookingService = require("../services/booking/bookingService");

const getAllBookings = async (req, res) => {
  try {
    const { page, limit } = req.query;

    const bookings = await bookingService.getAllBookings(page, limit);
    return res.status(200).json(bookings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getBookingById = async (req, res) => {
  try {
    const booking = await bookingService.getBookingById(req.params.id);
    return res.status(200).json(booking);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const getBookingByField = async (req, res) => {
  try {
    const criteria = req.query;
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;

    if (Object.keys(criteria).length === 0) {
      return res.status(400).json({ message: "No search criteria provided" });
    }

    const bookings = await bookingService.getBookingByField(
      criteria,
      page,
      limit
    );

    if (bookings.length === 0) {
      return res.status(204).json({ message: "No bookings found" });
    }
    return res.status(200).json(bookings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getUpcomingBookings = async (req, res) => {
  try {
    const user_id = req.params;
    const { page, limit } = req.query;
    console.log("user_id", user_id);
    const bookings = await bookingService.getUpcomingBookings(
      Number(user_id),
      Number(page),
      Number(limit)
    );
    return res.status(200).json(bookings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getPastBookings = async (req, res) => {
  try {
    const user_id = req.params.user_id;
    const { page, limit } = req.query;
    const bookings = await bookingService.getPastBookings(
      Number(user_id),
      Number(page),
      Number(limit)
    );
    return res.status(200).json(bookings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getBookingByUserId = async (req, res) => {
  try {
    const user_id_from_accessToken = req.data.user_id;

    if (!req.params.user_id != user_id_from_accessToken) {
      const booking = await bookingService.getBookingByUserId(
        req.params.user_id
      );
      return res.status(200).json(booking);
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const checkAvailabilitySeat = async (req, res) => {
  try {
    const token = req.query.token;
    const itinerary_id = req.params.itinerary_id;
    const booking = await bookingService.checkAvailabilitySeat(
      itinerary_id, token
    );


    return res.status(200).json(booking);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const addNewPassenger = async (req, res) => {
  try {
    const booking_id = req.body.booking_id;
    const booking = await bookingService.addNewPassenger(booking_id);
    return res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const bookingPending = async (req, res) => {
  try {
    const booking_data = req.body;
    const token = req.query.token;
    const booking = await bookingService.bookingPending(booking_data, token);

    if (booking) {
      return res.status(200).json(booking);
    } else {
      return res.status(200).json({ message: "No Seat Available" });
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const createBooking = async (req, res) => {
  try {
    const booking = await bookingService.createBooking(req.body);
    return res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateBooking = async (req, res) => {
  try {
    const booking = await bookingService.updateBooking(req.params.id, req.body);
    return res.status(200).json(booking);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const deleteBooking = async (req, res) => {
  try {

    const bookingId = req.query.bookingId;
    console.log("booking controller booking ID", bookingId);  
    await bookingService.deleteBooking(bookingId);

    return res.status(200).json({
      status: 200,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const deleteBookingPending = async (req, res) => {
  try {
    await bookingService.deleteBookingPending(req.params.id);
    return res.status(200).json({
      status: 200,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const deletePassengerPendingBooking = async (req, res) => {
  try {
    await bookingService.deletePassengerPendingBooking(req.params.booking_id);
    return res.status(200).json({
      status: 200,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

module.exports = {
  getAllBookings,
  getBookingById,
  getBookingByField,
  getUpcomingBookings,
  getPastBookings,
  getBookingByUserId,
  checkAvailabilitySeat,
  addNewPassenger,
  bookingPending,
  createBooking,
  updateBooking,
  deleteBooking,
  deletePassengerPendingBooking,
  deleteBookingPending,
};
