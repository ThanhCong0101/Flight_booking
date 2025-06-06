import { FlightLeg } from "../../models/entity/FlightLegs";
import { Flight } from "../../models/entity/Flight";
import { FlightItinerary } from "../../models/entity/FlightItinerary";

const getAllFlightLegs = async (page: number = 1, limit: number = 10) => {
  try {
    const [legs, total] = await FlightLeg.createQueryBuilder("leg")
      .leftJoinAndSelect("leg.segments", "segments")
      .leftJoinAndSelect("leg.itinerary_id", "itinerary")
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { legs, total };
  } catch (error) {
    console.error("Error fetching flight legs:", error);
    throw error;
  }
};


const getFlightLegById = async (leg_id: string) => {
  try {
    // console.log("leg_id: ", leg_id);
    const leg = await FlightLeg.findOne({
      where: { leg_id },
      relations: ["segments", "itinerary_id"],
    });

    return leg;
  } catch (error) {
    console.error(`Error fetching flight leg with id ${leg_id}:`, error);
    throw error;
  }
};

const createFlightLeg = async (legDetail) => {
  try {
    // Check if itinerary exists if itinerary_id is provided
    if (legDetail.itinerary_id) {
      const itinerary = await FlightItinerary.findOne({
        where: { itinerary_id: legDetail.itinerary_id },
      });
      if (!itinerary) {
        throw new Error("Flight itinerary not found");
      }
    }

    const leg = FlightLeg.create({
      ...legDetail,
    });

    await leg.save();
    return leg;
  } catch (error) {
    console.error("Error creating flight leg:", error);
    throw error;
  }
};

const updateFlightLeg = async (leg_id: string, legDetail) => {
  try {
    const leg = await FlightLeg.findOne({
      where: { leg_id },
    });

    if (!leg) {
      throw new Error(`Flight leg with id ${leg_id} not found`);
    }

    Object.assign(leg, legDetail);
    await leg.save();
    return leg;
  } catch (error) {
    console.error(`Error updating flight leg with id ${leg_id}:`, error);
    throw error;
  }
};

const deleteFlightLeg = async (leg_id: string) => {
  try {
    const leg = await FlightLeg.findOne({
      where: { leg_id },
    });

    if (!leg) {
      throw new Error(`Flight leg with id ${leg_id} not found`);
    }

    await leg.remove();
    return leg;
  } catch (error) {
    console.error(`Error deleting flight leg with id ${leg_id}:`, error);
    throw error;
  }
};

export {
  getAllFlightLegs,
  getFlightLegById,
  createFlightLeg,
  updateFlightLeg,
  deleteFlightLeg,
};
