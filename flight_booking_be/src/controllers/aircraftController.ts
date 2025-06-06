const aircraftService = require("../services/aircraftService");

const getAllAircrafts = async (req, res) => {
  try {
    const aircrafts = await aircraftService.getAllAircrafts();
    return res.status(200).json(aircrafts);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getAircraftById = async (req, res) => {
  try {
    const aircraft = await aircraftService.getAircraftById(req.params.id);
    return res.status(200).json(aircraft);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const createAircraft = async (req, res) => {
  try {
    const aircraft = await aircraftService.createAircraft(req.body);
    return res.status(201).json(aircraft);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateAircraft = async (req, res) => {
  try {
    const aircraft = await aircraftService.updateAircraft(
      req.params.id,
      req.body
    );
    return res.status(200).json(aircraft);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const deleteAircraft = async (req, res) => {
  try {
    await aircraftService.deleteAircraft(req.params.id);
    return res.status(204).json({ message: "Aircraft deleted successfully" });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

module.exports = {
  getAllAircrafts,
  getAircraftById,
  createAircraft,
  updateAircraft,
  deleteAircraft,
};
