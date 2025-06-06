const passengerService = require("../services/passengerService");

const getAllPassengers = async (req, res) => {
  try {
    const { page, limit } = req.query;

    const passengers = await passengerService.getAllPassengers(page, limit);
    return res.status(200).json(passengers);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getPassengers = async (req, res) => {
  try {
    const criteria = req.query;
    console.log("criteria controllers", criteria);
    if (Object.keys(criteria).length === 0) {
      return res.status(400).json({ message: "No search criteria provided" });
    }
    const passengers = await passengerService.getPassengersByFields(criteria);
    if (passengers.length === 0) {
      return res.status(204).json({ message: "No passengers found" });
    }
    return res.status(200).json(passengers);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getPassengerById = async (req, res) => {
  try {
    const passenger = await passengerService.getPassengerById(req.params.id);
    return res.status(200).json(passenger);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const getRecentPassengersByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    const passengers = await passengerService.getRecentPassengersByUserId(
      userId
    );
    return res.status(200).json(passengers);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const createPassenger = async (req, res) => {
  try {
    const passenger = await passengerService.createPassenger(req.body);
    return res.status(201).json(passenger);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updatePassenger = async (req, res) => {
  try {
    const passenger = await passengerService.updatePassenger(
      req.params.id,
      req.body
    );
    return res.status(200).json(passenger);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const deletePassenger = async (req, res) => {
  try {
    await passengerService.deletePassenger(req.params.id);
    return res.status(200).json({ message: "Passenger deleted successfully" });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

module.exports = {
  getAllPassengers,
  getPassengerById,
  getPassengers,
  getRecentPassengersByUserId,
  createPassenger,
  updatePassenger,
  deletePassenger,
};
