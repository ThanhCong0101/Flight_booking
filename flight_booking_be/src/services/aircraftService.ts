import { Aircraft } from "../models/entity/Aircraft";

const getAllAircrafts = async () => {
  try {
    const aircrafts = await Aircraft.find();
    return aircrafts;
  } catch (error) {
    console.error("Error fetching aircrafts:", error);
    throw error;
  }
};

const getAircraftById = async (aircraft_id: number) => {
  try {
    const aircraft = await Aircraft.findOne({
      where: { aircraft_id: aircraft_id },
    });
    return aircraft;
  } catch (error) {
    console.error(`Error fetching aircraft with id ${aircraft_id}:`, error);
    throw error;
  }
};

const createAircraft = async (aircraftDetail) => {
  try {
    const aircraft = new Aircraft();
    Object.assign(aircraft, aircraftDetail);
    await aircraft.save();
    return aircraft;
  } catch (error) {
    console.error("Error creating aircraft:", error);
    throw error;
  }
};

const updateAircraft = async (aircraft_id, aircraftDetail) => {
  try {
    const aircraft = await Aircraft.findOne({
      where: { aircraft_id },
    });
    if (!aircraft) {
      throw new Error(`Aircraft with id ${aircraft_id} not found`);
    } else {
      Object.assign(aircraft, aircraftDetail);
      await aircraft.save();
      return aircraft;
    }
  } catch (error) {
    console.error(`Error updating aircraft with id ${aircraft_id}:`, error);
    throw error;
  }
};

const deleteAircraft = async (aircraft_id) => {
  try {
    const aircraft = await Aircraft.findOne({
      where: { aircraft_id },
    });
    if (!aircraft) {
      throw new Error(`Aircraft with id ${aircraft_id} not found`);
    } else {
      await aircraft.remove();
      return aircraft;
    }
  } catch (error) {
    console.error(`Error deleting aircraft with id ${aircraft_id}:`, error);
    throw error;
  }
};

export {
  getAllAircrafts,
  getAircraftById,
  createAircraft,
  updateAircraft,
  deleteAircraft,
};
