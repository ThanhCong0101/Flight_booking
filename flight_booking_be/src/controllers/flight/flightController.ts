import * as flightService from "../../services/flight/flightService";

const getAllFlights = async (req, res) => {
  try {
    const { page, limit, getStats } = req.query;

    const flights = await flightService.getAllFlights(getStats, page, limit);
    return res.status(200).json(flights);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getFlightById = async (req, res) => {
  try {
    const flight = await flightService.getFlightById(req.params.id);
    return res.status(200).json(flight);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const getFlightStatistics = async (req, res) => {
  try {
    const statistics = await flightService.getFlightStatistics();
    return res.status(200).json(statistics);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getFlightByField = async (req, res) => {
  try {
    const criteria = req.query;
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;

    if (Object.keys(criteria).length === 0) {
      return res.status(400).json({ message: "No search criteria provided" });
    }

    const flights = await flightService.getFlightByField(criteria, page, limit);

    if (flights.total === 0) {
      return res.status(204).json({ message: "No flights found" });
    }
    return res.status(200).json(flights);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const createFlight = async (req, res) => {
  try {
    const flight = await flightService.createFlight(req.body);
    return res.status(201).json(flight);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateFlight = async (req, res) => {
  try {
    const flight = await flightService.updateFlight(req.params.id, req.body);
    return res.status(200).json(flight);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const deleteFlight = async (req, res) => {
  try {
    await flightService.deleteFlight(req.params.id);
    return res.status(204).json({ message: "Flight deleted successfully" });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export {
  getAllFlights,
  getFlightById,
  getFlightStatistics,
  getFlightByField,
  createFlight,
  updateFlight,
  deleteFlight,
};
