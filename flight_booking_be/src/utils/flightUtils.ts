import * as flightItineraryService from "../services/flight/flightItineraryService";
import flightSearchService from "../services/flight/flightSearchService";

import { getRedis } from "../config/redis";
import { randomUUID } from "crypto";

const client = getRedis();
const ttl_flight = 60 * 5;

const sanitizeFlightData = (rawData: any, token: string) => {
  // // console.log("rawData flight utils", rawData);
  return {
    itinerary_id: rawData?.itinerary?.id || randomUUID(),
    raw_price: rawData?.itinerary?.pricingOptions[0]?.totalPrice || 10,
    formatted_price: `${parseInt(
      rawData?.itinerary?.pricingOptions[0]?.totalPrice || 10
    )}`,
    score: 0.888,
    token: token,
    legs: rawData?.itinerary?.legs?.map((leg) => ({
      leg_id: leg?.id,
      duration_in_minutes: leg?.duration || 60,
      stop_count: leg?.stopCount || 0,
      departure_time: leg?.departure,
      arrival_time: leg?.arrival,
      origin_iata: leg?.origin?.displayCode,
      origin_name: leg?.origin?.name,
      destination_iata: leg?.destination?.displayCode,
      destination_name: leg?.destination?.name,
      itinerary_id: rawData?.id,
      is_smallest_stops: false,
      time_delta_in_days: 0,
      day_change: leg?.dayChange,
      segments: leg?.segments?.map((segment, index) => ({
        flight_id: segment?.id,
        flight_number: segment?.flightNumber,
        departure_time: segment?.departure,
        arrival_time: segment?.arrival,
        origin_name: segment?.origin?.name,
        destination_name: segment?.destination?.name,
        duration_in_minutes: segment?.duration,
        departure_airport_id: segment?.origin?.displayCode,
        arrival_airport_id: segment?.destination?.displayCode,
        leg_id: leg?.id,
        carriers: {
          carrier_id: segment?.marketingCarrier?.id,
          name: segment?.marketingCarrier?.name,
          displayCode: segment?.marketingCarrier?.displayCode,
          alternateId: segment?.marketingCarrier?.altId,
          logoUrl: segment?.marketingCarrier?.logo,
        },
      })),
    })),
  };
};

const checkItineraryExistAndReturn = async (
  itinerary_id: string,
  token: string
) => {
  try {
    const redisClient = client.instanceConnect;
    const cacheKeyRes = `flight-detail:${itinerary_id}`;
    const cacheKeyDB = `flight-detail-db:${itinerary_id}`;

    let flightItinerary = await flightItineraryService.getFlightItineraryById(
      itinerary_id
    );

    // console.log("itinerary_id", itinerary_id);
    // console.log("token", token);

    if (!flightItinerary) {
      const flightResult = await flightSearchService.searchDetail(
        itinerary_id,
        token
      );

      // console.log("flightResult", flightResult);

      if (flightResult.status) {
        const flightData = sanitizeFlightData(
          flightResult.data.itinerary,
          token
        );

        // console.log("flightData", flightData);

        // console.log("segment 0", flightData.legs[0].segments[0]);
        // console.log("segment 1", flightData.legs[0].segments[1]);
        // console.log("segment 2", flightData.legs[0].segments[2]);

        flightItinerary =
          await flightItineraryService.createFlightItineraryWithDetails(
            flightData
          );

        await redisClient.set(
          cacheKeyDB,
          JSON.stringify(flightItinerary),
          "NX",
          "EX",
          ttl_flight
        );

        await redisClient.set(
          cacheKeyRes,
          JSON.stringify(flightResult),
          "NX",
          "EX",
          ttl_flight
        );
        // console.log("cache miss");
      }
    }
    return flightItinerary;
  } catch (error) {
    return null;
  }
};

export { sanitizeFlightData, checkItineraryExistAndReturn };
