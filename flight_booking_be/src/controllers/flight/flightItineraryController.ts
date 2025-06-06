import * as flightItineraryService from "../../services/flight/flightItineraryService";

const getAllFlightItineraries = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const itineraries = await flightItineraryService.getAllFlightItineraries(
      page,
      limit
    );
    return res.status(200).json(itineraries);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getFlightItineraryById = async (req, res) => {
  try {
    const { id } = req.params;
    const itinerary = await flightItineraryService.getFlightItineraryById(id);
    return res.status(200).json(itinerary);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const createFlightItinerary = async (req, res) => {
  try {
    const itinerary = await flightItineraryService.createFlightItinerary(
      req.body
    );
    return res.status(201).json(itinerary);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const createFullItinerary = async (req, res) => {
  try {
    const result =
      await flightItineraryService.createFlightItineraryWithDetails(req.body);
    return res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateFlightItinerary = async (req, res) => {
  try {
    const itinerary = await flightItineraryService.updateFlightItinerary(
      req.params.id,
      req.body
    );
    return res.status(200).json(itinerary);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const deleteFlightItinerary = async (req, res) => {
  try {
    await flightItineraryService.deleteFlightItinerary(req.params.id);
    return res
      .status(200)
      .json({ message: "Flight itinerary deleted successfully" });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export {
  getAllFlightItineraries,
  getFlightItineraryById,
  createFlightItinerary,
  createFullItinerary,
  updateFlightItinerary,
  deleteFlightItinerary,
};
