import flightSearchService from "../../services/flight/flightSearchService";
import * as flightItineraryService from "../../services/flight/flightItineraryService";

import { getRedis } from "../../config/redis";
import { AppDataSource } from "../../config/db";
import { sanitizeFlightData } from "../../utils/flightUtils";

const client = getRedis();
const ttl_flight = 60 * 5;

const AutoComplete = async (req, res) => {
  try {
    const location = req.query.keyword;

    const redisClient = client.instanceConnect;
    const valueLocation = await redisClient.get(`location:${location}`);

    if (valueLocation) {
      return res.status(200).json(JSON.parse(valueLocation));
    }

    const city = await flightSearchService.autoComplete(location);

    console.log("city", city);

    if (city.data.length > 0) {
      // Cache the result forever because it's a static data
      await redisClient.set(`location:${location}`, JSON.stringify(city), "NX");
      return res.status(200).json(city);
    } else {
      return res.status(404).json({ message: "Location not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const searchOneWay = async (req, res) => {
  try {
    const {
      departureEntityId,
      arrivalEntityId,
      departDate,
      classType,
      travellerType,
    } = req.query;

    const redisClient = client.instanceConnect;

    const cacheKey = `flight-one-way:${departureEntityId}:${arrivalEntityId}:${departDate}`;

    const cachedValue = await redisClient.get(cacheKey);

    if (cachedValue) {
      console.log("cache search one way hit");

      const formatedValue = JSON.parse(cachedValue);
      return res.status(200).json(formatedValue);
    }

    const results = await flightSearchService.searchOneWay(
      departureEntityId,
      arrivalEntityId,
      departDate,
      classType,
      travellerType
    );

    if (results.data) {
      await redisClient.set(cacheKey, JSON.stringify(results), "NX");
      console.log("cache search one way miss");

      return res.status(200).json(results);
    } else {
      return res.status(404).json({ message: "Doesn't have any trip" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const searchRoundTrip = async (req, res) => {
  try {
    const redisClient = client.instanceConnect;

    const departureEntityId = req.query.departureEntityId;
    const arrivalEntityId = req.query.arrivalEntityId;
    const departDate = req.query.departDate;
    const returnDate = req.query.returnDate;
    const classType = req.query.classType;
    const travellerType = req.query.classType;

    const cacheKey = `flight-round-trip:${departureEntityId}:${arrivalEntityId}:${departDate}:${returnDate}`;

    const cachedValue = await redisClient.get(cacheKey);

    if (cachedValue) {
      console.log("cache search round trip hit");

      const formatedValue = JSON.parse(cachedValue);
      return res.status(200).json(formatedValue);
    }

    const trip = await flightSearchService.searchRoundTrip(
      departureEntityId,
      arrivalEntityId,
      departDate,
      returnDate,
      classType,
      travellerType
    );

    if (trip.data) {
      await redisClient.set(cacheKey, JSON.stringify(trip), "NX");
      console.log("cache search round trip miss");
      return res.status(200).json(trip);
    } else {
      return res.status(404).json({ message: "Doesn't have any trip" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const searchDetail = async (req, res) => {
  try {
    const redisClient = client.instanceConnect;

    const itineraryId = req.query.itineraryId;
    const token = req.query.token;

    const cacheKeyRes = `flight-detail:${itineraryId}`;
    const cacheKeyDB = `flight-detail-db:${itineraryId}`;
    const cachedValue = await redisClient.get(cacheKeyRes);

    if (cachedValue) {
      console.log("itineraryId", itineraryId);
      console.log("cache detail hit");

      const formatedValue = JSON.parse(cachedValue);
      return res.status(200).json(formatedValue);
    }

    const trip = await flightSearchService.searchDetail(itineraryId, token);

    console.log("trip", trip.data.itinerary.pricingOptions[0]);

    if (trip.data) {
      const flightData = sanitizeFlightData(trip.data, token);

      console.log("flightData", flightData);

      let flightItinerary =
        await flightItineraryService.createFlightItineraryWithDetails(
          flightData
        );

      await redisClient.set(cacheKeyDB, JSON.stringify(flightItinerary), "NX");

      await redisClient.set(cacheKeyRes, JSON.stringify(trip), "NX");

      console.log("cache detail miss");
      console.log("trip return", trip.data.itinerary.id);
      return res.status(200).json(trip);
    } else {
      return res.status(404).json({ message: "Doesn't have any trip" });
    }
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const searchIncomplete = async (req, res) => {
  try {
    const redisClient = client.instanceConnect;

    const sessionId = req.query.sessionId;
    // const token = req.query.token;

    const cacheKey = `flight-incomplete:${sessionId}`;
    const cachedValue = await redisClient.get(cacheKey);

    if (cachedValue) {
      console.log("cache hit");

      const formatedValue = JSON.parse(cachedValue);
      return res.status(200).json(formatedValue);
    }

    const trip = await flightSearchService.searchIncomplete(sessionId);

    if (trip.data) {
      await redisClient.set(cacheKey, JSON.stringify(trip), "NX");
      console.log("cache miss");
      return res.status(200).json(trip);
    } else {
      return res.status(404).json({ message: "Doesn't have any trip" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const searchAirport = async (req, res) => {
  try {
    const redisClient = client.instanceConnect;
    const id = req.query.id;

    const cacheKey = `airport:${id}`;

    const cachedValue = await redisClient.get(cacheKey);

    if (cachedValue) {
      console.log("cache hit");

      const formatedValue = JSON.parse(cachedValue);
      return res.status(200).json(formatedValue);
    }

    const airport = await flightSearchService.searchAirport(id);

    if (airport.data) {
      await redisClient.set(cacheKey, JSON.stringify(airport), "NX");
      return res.status(200).json(airport);
    } else {
      return res.status(404).json({ message: "Doesn't have any trip" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const searchCalenderPriceOneWay = async (req, res) => {
  try {
    const { fromEntityId, departDate, toEntityId } = req.query;

    const redisClient = client.instanceConnect;

    const cacheKey = `price-flight-one-way:${fromEntityId}:${toEntityId}:${departDate}`;

    const cachedValue = await redisClient.get(cacheKey);

    if (cachedValue) {
      console.log("cache hit");

      const formatedValue = JSON.parse(cachedValue);
      return res.status(200).json(formatedValue);
    }

    const price = await flightSearchService.searchCalenderPriceOneWay(
      fromEntityId,
      departDate,
      toEntityId
    );

    if (price.data) {
      await redisClient.set(cacheKey, JSON.stringify(price), "NX");
      return res.status(200).json(price);
    } else {
      return res
        .status(404)
        .json({ message: "Doesn't have price one way data" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const searchCalenderPriceRoundTrip = async (req, res) => {
  try {
    const { fromEntityId, departDate, toEntityId, returnDate } = req.query;
    const redisClient = client.instanceConnect;

    const cacheKey = `price-flight-round-trip:${fromEntityId}:${toEntityId}:${departDate}:${returnDate}`;

    const cachedValue = await redisClient.get(cacheKey);

    if (cachedValue) {
      console.log("cache hit");

      const formatedValue = JSON.parse(cachedValue);
      return res.status(200).json(formatedValue);
    }

    const price = await flightSearchService.searchCalenderPriceRoundTrip(
      fromEntityId,
      departDate,
      toEntityId,
      returnDate
    );
    if (price.data) {
      await redisClient.set(cacheKey, JSON.stringify(price), "NX");
      return res.status(200).json(price);
    } else {
      return res
        .status(404)
        .json({ message: "Doesn't have price round trip data" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export {
  AutoComplete,
  searchOneWay,
  searchRoundTrip,
  searchDetail,
  searchIncomplete,
  searchAirport,
  searchCalenderPriceOneWay,
  searchCalenderPriceRoundTrip,
};
