import { Aircraft } from "../../models/entity/Aircraft";
import { Airport } from "../../models/entity/Airport";
import { Flight } from "../../models/entity/Flight";
import { FlightLeg } from "../../models/entity/FlightLegs";
import { flightPrefetchQueue } from "../../queues/flightPrefetchQueue";

const initRedis = require("../../config/redis");

const client = initRedis.getRedis();

const getAllFlights = async (
  getStats: boolean = false,
  page: number = 1,
  limit: number = 10
) => {
  try {
    const redisClient = client.instanceConnect;
    const ttl_flight = 60 * 3; // Cache for 5 minutes

    const timestamp =
      Math.floor(Date.now() / (5 * 60 * 1000)) * (5 * 60 * 1000);
    const cacheKey = `flight:${timestamp}:${page}`;

    console.log("cacheKey", cacheKey);

    // Try to get from cache first
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const [flights, total] = await Flight.createQueryBuilder("flight")
      .leftJoinAndSelect("flight.aircraft", "aircraft")
      .leftJoinAndSelect("flight.departureAirport", "departure_airport")
      .leftJoinAndSelect("flight.arrivalAirport", "arrival_airport")
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    let response: { flights: Flight[]; total: number; statistics?: any } = {
      flights,
      total,
    };

    // If statistics are requested, fetch them separately
    if (getStats) {
      const stats = await Flight.createQueryBuilder("flight")
        .select([
          "MIN(flight.duration_in_minutes) as minDuration",
          "MAX(flight.duration_in_minutes) as maxDuration",
          "AVG(flight.duration_in_minutes) as avgDuration",
          "COUNT(*) as totalFlights",
        ])
        .getRawOne();

      const statistics = {
        duration: {
          min: stats.minDuration,
          max: stats.maxDuration,
          average: Math.round(stats.avgDuration),
        },
        totalFlights: stats.totalFlights,
      };

      response = { ...response, statistics };
    }
    // Cache current page
    await redisClient.set(
      cacheKey,
      JSON.stringify(response),
      "NX",
      "EX",
      ttl_flight
    );

    console.log("total Flight Service:", total);
    // Prefetch next 2 pages
    if (total >= page * limit) {
      const pagesToPrefetch = Math.min(
        2,
        Math.round((total - page * limit) / limit)
      );

      console.log("pagesToPrefetch", pagesToPrefetch);

      for (let i: number = 1; i <= pagesToPrefetch; i++) {
        const nextPage = Number(page) + Number(i);
        await flightPrefetchQueue.add("prefetch-flight-page", {
          page: nextPage,
          pageSize: limit,
          timestamp,
          getStats,
        });
      }
    }

    return response;
  } catch (error) {
    console.error("Error fetching flights:", error);
    throw error;
  }
};

const getFlightById = async (flight_id) => {
  try {
    const flight = await Flight.findOne({ where: { flight_id } });
    return flight;
  } catch (error) {
    console.error(`Error fetching flight with id ${flight_id}:`, error);
    throw error;
  }
};

const getFlightByField = async (
  criteria: Record<string, string | number>,
  page: number = 1,
  limit: number = 10
) => {
  try {
    console.log("criteria flights", criteria);
    const flightSearch = criteria.flightSearch as string;
    const sortBy = criteria.sortBy as string;
    const sortOrder = criteria.sortOrder as "ASC" | "DESC";
    const durationFilter = criteria.durationFilter as number;

    let queryBuilder = Flight.createQueryBuilder("flight");

    queryBuilder
      .leftJoinAndSelect("flight.aircraft", "aircraft")
      .leftJoinAndSelect("flight.departureAirport", "departure_airport")
      .leftJoinAndSelect("flight.arrivalAirport", "arrival_airport");

    if (flightSearch) {
      // Check if the search matches flight_id pattern (contains multiple hyphens)
      const isFlightIdPattern = /\d+-*/.test(flightSearch);

      console.log("isFlightIdPattern", isFlightIdPattern);

      if (isFlightIdPattern) {
        queryBuilder.andWhere("flight.flight_id LIKE :flight_id", {
          flight_id: `%${flightSearch}%`,
        });
      } else {
        const formattedQuery = flightSearch.toString().replace(/-/g, " ");
        // If not a flight_id pattern, search across other fields
        queryBuilder.andWhere(
          `(departure_airport.iata LIKE :searchTerm 
             OR arrival_airport.iata LIKE :searchTerm 
             OR aircraft.name LIKE :searchTerm)`,
          { searchTerm: `%${formattedQuery}%` }
        );
      }
    }

    // Apply duration filter
    if (durationFilter) {
      queryBuilder.andWhere("flight.duration_in_minutes <= :duration", {
        duration: durationFilter,
      });
    }

    if (sortBy && sortOrder) {
      queryBuilder = queryBuilder.orderBy(`flight.${sortBy}`, sortOrder);
    }

    const [flights, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    console.log("durationFilter", durationFilter);

    if (!durationFilter) {
      const stats = await queryBuilder
        .select([
          "MIN(flight.duration_in_minutes) as minDuration",
          "MAX(flight.duration_in_minutes) as maxDuration",
          "AVG(flight.duration_in_minutes) as avgDuration",
          "COUNT(*) as totalFlights",
        ])
        .getRawOne();

      const statistics = {
        duration: {
          min: stats.minDuration,
          max: stats.maxDuration,
          average: Math.round(stats.avgDuration),
        },
        totalFlights: stats.totalFlights,
      };

      return { flights, total, statistics };
    }
    return { flights, total };
  } catch (error) {
    console.error(`Error fetching flight with :`, error);
    throw error;
  }
};

const getFlightStatistics = async () => {
  try {
    const redisClient = client.instanceConnect;
    const ttl_stats = 60 * 15; // Cache for 15 minutes
    const cacheKey = "flight-statistics";

    // Try to get from cache first
    const cachedStats = await redisClient.get(cacheKey);
    if (cachedStats) {
      return JSON.parse(cachedStats);
    }

    const stats = await Flight.createQueryBuilder("flight")
      .select([
        "MIN(flight.duration_in_minutes) as minDuration",
        "MAX(flight.duration_in_minutes) as maxDuration",
        "AVG(flight.duration_in_minutes) as avgDuration",
        "COUNT(*) as totalFlights",
      ])
      .getRawOne();

    const statistics = {
      duration: {
        min: stats.minDuration,
        max: stats.maxDuration,
        average: Math.round(stats.avgDuration),
      },
      totalFlights: stats.totalFlights,
    };

    // Cache the statistics
    await redisClient.set(
      cacheKey,
      JSON.stringify(statistics),
      "EX",
      ttl_stats
    );

    return statistics;
  } catch (error) {
    console.error("Error fetching flight statistics:", error);
    throw error;
  }
};

const createFlight = async (flightDetail) => {
  try {
    // First find the departure airport
    const departureAirport = await Airport.findOne({
      where: { iata: flightDetail.departure_airport_id },
    });
    if (!departureAirport) {
      throw new Error("Departure airport not found");
    }

    // Find arrival airport
    const arrivalAirport = await Airport.findOne({
      where: { iata: flightDetail.arrival_airport_id },
    });
    if (!arrivalAirport) {
      throw new Error("Arrival airport not found");
    }

    const leg = await FlightLeg.findOne({
      where: { leg_id: flightDetail.leg_id },
    });
    if (!leg) {
      throw new Error("Flight leg not found");
    }

    const flight = Flight.create({
      ...flightDetail,
      leg,
      departureAirport, // Add this
      arrivalAirport, // Add this
    });

    await flight.save();
    return flight;
  } catch (error) {
    console.error("Error creating flight:", error);
    throw error;
  }
};

const updateFlight = async (flight_id, flightDetail) => {
  try {
    const flight = await Flight.findOne({
      where: { flight_id },
    });
    if (!flight) {
      throw new Error(`Flight with id ${flight_id} not found`);
    } else {
      Object.assign(flight, flightDetail);
      await flight.save();
      console.log(flightDetail);
      return flight;
    }
  } catch (error) {
    console.error(`Error updating flight with id ${flight_id}:`, error);
    throw error;
  }
};

const deleteFlight = async (flight_id) => {
  try {
    const flight = await Flight.findOne({
      where: { flight_id },
    });
    if (!flight) {
      throw new Error(`Flight with id ${flight_id} not found`);
    } else {
      await flight.remove();
      return {
        message: `Flight with id ${flight_id} deleted successfully`,
      };
    }
  } catch (error) {
    console.error(`Error deleting flight with id ${flight_id}:`, error);
    throw error;
  }
};

export {
  getAllFlights,
  getFlightById,
  getFlightByField,
  getFlightStatistics,
  createFlight,
  updateFlight,
  deleteFlight,
};
