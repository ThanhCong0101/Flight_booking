import * as airportService from "../../services/ariport/airportService";

const getAllAirports = async (req, res) => {
  try {
    const airports = await airportService.getAllAirports();
    console.log(airports);
    return res.status(200).json(airports);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getAirportById = async (req, res) => {
  try {
    const airport = await airportService.getAirportById(req.params.id);
    return res.status(200).json(airport);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const createAirport = async (req, res) => {
  try {
    const airport = await airportService.createAirport(req.body);
    return res.status(201).json(airport);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const createMetadataAirport = async (req, res) => {
  try {
    const airport = await airportService.createMetadataAirport();
    return res.status(201).json(airport);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateAirport = async (req, res) => {
  try {
    const airport = await airportService.updateAirport(req.params.id, req.body);
    return res.status(200).json(airport);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteAirport = async (req, res) => {
  try {
    await airportService.deleteAirport(req.params.id);
    return res.status(204).json({ message: "Airport deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export {
  getAllAirports,
  getAirportById,
  createAirport,
  createMetadataAirport,
  updateAirport,
  deleteAirport,
};
