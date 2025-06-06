import { FlightItinerary } from "../../models/entity/FlightItinerary";
import { FlightLeg } from "../../models/entity/FlightLegs";

import { AppDataSource } from "../../config/db";
import { Aircraft } from "../../models/entity/Aircraft";
import { Flight } from "../../models/entity/Flight";
import { Airport } from "../../models/entity/Airport";
import flightSearchService from "./flightSearchService";

const getAllFlightItineraries = async (
  page: number = 1,
  limit: number = 10
) => {
  try {
    const [itineraries, total] = await FlightItinerary.createQueryBuilder(
      "itinerary"
    )
      .leftJoinAndSelect("itinerary.legs", "legs")
      .leftJoinAndSelect("legs.segments", "segments")
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return { itineraries, total };
  } catch (error) {
    console.error("Error fetching flight itineraries:", error);
    throw error;
  }
};

const getFlightItineraryById = async (itinerary_id: string) => {
  try {
    const newItinerary = await FlightItinerary.createQueryBuilder("itinerary")
      .leftJoinAndSelect("itinerary.legs", "legs")
      .leftJoinAndSelect("legs.segments", "segments")
      .leftJoinAndSelect("segments.aircraft", "aircraft")
      .select([
        "itinerary",
        "legs",
        "segments",
        "aircraft.aircraft_id",
        "aircraft.name",
        "aircraft.alternateId",
        "aircraft.displayCode",
        "aircraft.logoUrl",
      ])
      .where("itinerary.itinerary_id = :itinerary_id", { itinerary_id })
      .getOne();

    return newItinerary;
  } catch (error) {
    console.error(
      `Error fetching flight itinerary with id ${itinerary_id}:`,
      error
    );
    throw error;
  }
};

const createFlightItinerary = async (itineraryDetail) => {
  try {
    const itinerary = FlightItinerary.create({
      ...itineraryDetail,
    });

    await itinerary.save();
    return itinerary;
  } catch (error) {
    console.error("Error creating flight itinerary:", error);
    throw error;
  }
};

const createFlightItineraryWithDetails = async (itineraryData) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // console.log("Received itinerary data:", itineraryData);
    // 1. Create Flight Itinerary
    const itinerary = await queryRunner.manager.save(FlightItinerary, {
      itinerary_id: itineraryData.itinerary_id,
      raw_price: itineraryData.raw_price,
      formatted_price: itineraryData.formatted_price,
      is_self_transfer: itineraryData.is_self_transfer,
      is_protected_self_transfer: itineraryData.is_protected_self_transfer,
      is_change_allowed: itineraryData.is_change_allowed,
      
      is_cancellation_allowed: itineraryData.is_cancellation_allowed,
      score: itineraryData.score,
      token: itineraryData.token,
      // Add other itinerary fields
    });

    // 2. Create Flight Legs
    for (const legData of itineraryData.legs) {
      const leg = await queryRunner.manager.save(FlightLeg, {
        leg_id: legData.leg_id,
        duration_in_minutes: legData.duration_in_minutes,
        stop_count: legData.stop_count,
        departure_time: legData.departure_time,
        arrival_time: legData.arrival_time,
        origin_iata: legData.origin_iata,
        origin_name: legData.origin_name,
        destination_iata: legData.destination_iata,
        destination_name: legData.destination_name,
        itinerary_id: itinerary.itinerary_id,
        is_smallest_stops: legData.is_smallest_stops,
        time_delta_in_days: legData.time_delta_in_days,
        day_change: legData.day_change,
      });

      // console.log("leg", legData);
      // 3. Create Flights for each segment
      for (const segmentData of legData.segments) {
        // console.log("segmentData", segmentData);
        let aircraft = await queryRunner.manager.findOne(Aircraft, {
          where: { aircraft_id: segmentData.carriers.carrier_id },
        });

        // console.log("aircraft", aircraft);

        if (!aircraft) {
          aircraft = await queryRunner.manager.save(Aircraft, {
            aircraft_id: parseInt(segmentData.carriers.carrier_id),
            name: segmentData.carriers.name,
            alternateId: segmentData.carriers.alternateId,
            displayCode: segmentData.carriers.displayCode,
            logoUrl: segmentData.carriers.logoUrl,
          });
        }


        let airport_departure = await queryRunner.manager.findOne(Airport, {
          where: { iata: segmentData.departure_airport_id },
        });

        console.log("airport_departure", airport_departure);
        console.log("airport_departure_skyID", segmentData.departure_airport_id);

        // if(!airport_departure){
        //   airport_departure = await flightSearchService.searchAirport(segmentData.departure_airport_id);
        // }
        // console.log("airport_departure 2", airport_departure);


        let airport_arrival = await queryRunner.manager.findOne(Airport, {
          where: { iata: segmentData.arrival_airport_id },
        });

        console.log("airport_arrival", airport_arrival);
        console.log("airport_arrival_skyID", segmentData.arrival_airport_id);

        // if(!airport_arrival){
        //   airport_arrival = await flightSearchService.searchAirport(segmentData.arrival_airport_id);
        // }

        // console.log("airport_arrival 2", airport_arrival);

        await queryRunner.manager.save(Flight, {
          flight_id: segmentData.flight_id,
          flight_number: segmentData.flight_number,
          depature_time: segmentData.depature_time,
          arrival_time: segmentData.arrival_time,
          origin_iata: segmentData.origin_iata,
          origin_name: segmentData.origin_name,
          destination_iata: segmentData.destination_iata,
          destination_name: segmentData.destination_name,
          duration_in_minutes: segmentData.duration_in_minutes,
          departureAirport: { iata: airport_departure.iata },
          arrivalAirport: { iata: airport_arrival.iata },
          leg: { leg_id: leg.leg_id },
          aircraft: { aircraft_id: aircraft.aircraft_id },
        });

        // console.log("segment", segment);
      }
    }
    await queryRunner.commitTransaction();

    return await getFlightItineraryById(itinerary.itinerary_id);
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error("Error in cascade creation:", error);
    throw error;
  } finally {
    await queryRunner.release();
  }
};

const updateFlightItinerary = async (itinerary_id: string, itineraryDetail) => {
  try {
    const itinerary = await FlightItinerary.findOne({
      where: { itinerary_id },
    });

    if (!itinerary) {
      throw new Error(`Flight itinerary with id ${itinerary_id} not found`);
    }

    Object.assign(itinerary, itineraryDetail);
    await itinerary.save();
    return itinerary;
  } catch (error) {
    console.error(
      `Error updating flight itinerary with id ${itinerary_id}:`,
      error
    );
    throw error;
  }
};

const deleteFlightItinerary = async (itinerary_id: string) => {
  try {
    const itinerary = await FlightItinerary.findOne({
      where: { itinerary_id },
      relations: ["legs", "legs.segments"],
    });

    if (!itinerary) {
      throw new Error(`Flight itinerary with id ${itinerary_id} not found`);
    }

    await itinerary.remove();
    return {
      message: `Flight itinerary with id ${itinerary_id} deleted successfully`,
    };
  } catch (error) {
    console.error(
      `Error deleting flight itinerary with id ${itinerary_id}:`,
      error
    );
    throw error;
  }
};

export {
  getAllFlightItineraries,
  getFlightItineraryById,
  createFlightItinerary,
  createFlightItineraryWithDetails,
  updateFlightItinerary,
  deleteFlightItinerary,
};
