import * as flightLegService from "../../services/flight/flightLegService";

const getAllFlightLegs = async (req, res) => {
  try {
    const { page, limit } = req.query;

    const legs = await flightLegService.getAllFlightLegs(page, limit);
    return res.status(200).json(legs);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getFlightLegById = async (req, res) => {
  try {
    const leg = await flightLegService.getFlightLegById(req.params.id);
    return res.status(200).json(leg);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const createFlightLeg = async (req, res) => {
  try {
    const leg = await flightLegService.createFlightLeg(req.body);
    return res.status(201).json(leg);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateFlightLeg = async (req, res) => {
  try {
    const leg = await flightLegService.updateFlightLeg(req.params.id, req.body);
    return res.status(200).json(leg);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const deleteFlightLeg = async (req, res) => {
  try {
    await flightLegService.deleteFlightLeg(req.params.id);
    return res.status(204).json({ message: "Flight leg deleted successfully" });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export {
  getAllFlightLegs,
  getFlightLegById,
  createFlightLeg,
  updateFlightLeg,
  deleteFlightLeg,
};
