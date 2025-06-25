import fs from "fs";
import path from "path";

const axios = require("axios");

const { RAPID_API_KEY, RAPID_HOST } = require("../../config/rapid_api");
import { delay } from "../../utils/function";
import { AppDataSource } from "../../config/db";
import { Airport } from "../../models/entity/Airport";

const sessionIdMap = new Map([
  [
    "ClsIARJXCk4KJGQxNTQxOTY3LTMwYmEtNDFkZi04NDgxLWYxODNhYmE0ZTljZBACGiQ2YjBlMWY1MS02NDk5LTQ1OGUtYmJjNy02ZWJlNWRhOTU4N2YQxfyX1K8yEih1c3NfMTgwMTYzZmItMjc4NS00MmM1LWE5NjAtZTA1ZDA1OWVhYTQ4",
    "session7",
  ],
  [
    "ClQIARJQCk4KJDliMTU3OTQ2LTE2OWEtNGFlMC05ZWNmLTRlZDRlNGNjZTAzNBACGiQ4MGU0ZGNlOS1kYjE3LTRjOTItYTA4My1hYzQxOGQyOGFiMzkSKHVzc182ZDA2Mzc2MS1mZjVjLTRhODctYWYwZC1hM2RmY2QzZTkxNzF=",
    "session8",
  ],
]);

const itineraryIdMap = new Map([
  // [
  //   "12071-2410300140--32179-0-12409-2410300820|12409-2410312120--32179-0-12071-2411010030",
  //   "itinerary1",
  // ],
  // ["12071-2502282250--31705-0-12409-2503010525", "itinerary29"],
  // ["12071-2502281040--31703-0-12409-2502281630", "itinerary30"],
  // ["12071-2502280145--31705-0-12409-2502280755", "itinerary31"],
  // ["12071-2502282340--31703-0-12409-2503010530", "itinerary32"],
  // ["12071-2502280235--32442-2-12409-2502281550", "itinerary33"],
  // ["12071-2502280140--32179-0-12409-2502280820", "itinerary34"],
  // ["12071-2502281145--32439-1-12409-2502282150", "itinerary35"],
  // ["12071-2502281330--32558-0-12409-2502281935", "itinerary36"],
  // ["12071-2502280935--32456-1-12409-2502281835", "itinerary37"],
  // ["12071-2502280325--32442-1-12409-2502281440", "itinerary38"],
  ["12071-2411300140--32179-0-12409-2411300820", "itinerary1"],
]);

const autoComplete = async (keyword: string) => {
  const location = [
    "ho-chi-minh",
    "new-york",
    "london",
    "paris",
    "new-orleans",
    "ha-noi",
    "incheon",
  ];

  try {
    await delay(2015);

    for (const city of location) {
      if (city === keyword) {
        const filePath = path.join(
          __dirname,
          "../../mockApiResponses/flights/auto-complete",
          `auto-complete-${keyword}.json`
        );
        const data = fs.readFileSync(filePath, "utf8");
        const jsonData = JSON.parse(data);
        return jsonData;
      }
    }
  } catch (error) {
    console.error("Error reading mock data:", error);
  }
};

const searchOneWay = async (
  fromEntityId: string,
  toEntityId: string,
  departDate: string,
  cabinClass: string = "economy",
  travellerType: string = "Adult"
) => {
  try {
    await delay(100);
    const filePath = path.join(
      __dirname,
      "../../mockApiResponses/flights/search-one-way",
      `${fromEntityId}-${toEntityId}-${departDate}.json`
    );
    const data = fs.readFileSync(filePath, "utf8");

    const jsonData = JSON.parse(data);

    if (jsonData.data.context.status === "incomplete") {
      const sessionId = jsonData.data.context.sessionId;
      const completeData = await searchIncomplete(sessionId);
      return completeData;
    } else {
      return jsonData;
    }
  } catch (error) {
    console.error("Error reading mock data:", error);
  }
};

const searchRoundTrip = async (
  fromEntityId: string,
  toEntityId: string,
  departDate: string,
  returnDate: string,
  cabinClass: string = "economy",
  travellerType: string = "Adult"
) => {
  try {
    await delay(100);
    const filePath = path.join(
      __dirname,
      "../../mockApiResponses/flights/search-round-trip",
      `${fromEntityId}-${toEntityId}-${departDate}-${returnDate}.json`
    );
    const data = fs.readFileSync(filePath, "utf8");
    const jsonData = JSON.parse(data);
    if (jsonData.data.context.status === "incomplete") {
      const sessionId = jsonData.data.context.sessionId;
      const completeData = await searchIncomplete(sessionId);
      return completeData;
    } else {
      return jsonData;
    }
  } catch (error) {
    console.error("Error reading mock data:", error);
  }
};

const searchDetail = async (itineraryId: string, token: string) => {
  console.log("itineraryId in search Detail service", itineraryId);
  try {
    await delay(500);

    const fileName = itineraryIdMap.get(itineraryId);

    const filePath = path.join(
      __dirname,
      "../../mockApiResponses/flights/detail",
      `search-${fileName}.json`
    );
    const data = fs.readFileSync(filePath, "utf8");
    const jsonData = JSON.parse(data);
    return jsonData;
  } catch (error) {
    console.error("Error reading mock data:", error);
  }
};

const searchIncomplete = async (sessionId: string) => {
  try {
    await delay(500);
    const fileName = sessionIdMap.get(sessionId) || sessionId;

    const filePath = path.join(
      __dirname,
      "../../mockApiResponses/flights/search-incomplete",
      `${fileName}.json`
    );
    const data = fs.readFileSync(filePath, "utf8");
    const jsonData = JSON.parse(data);
    return jsonData;
  } catch (error) {
    console.error("Error reading mock data:", error);
  }
};

const searchAirport = async (id: string) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const options = {
      method: "GET",
      params: {
        id,
      },
      headers: {
        "x-rapidapi-key": RAPID_API_KEY,
        "x-rapidapi-host": RAPID_HOST,
      },
    };

    const response = await axios.request(options);

    if (response.data.length === 1) {
      const airport = await queryRunner.manager.findOne(Airport, {
        where: {
          iata: response.data[0].iata,
        },
      });

      if (!airport) {
        await queryRunner.manager.save(Airport, {
          iata: response.data[0].iata,
          sky_id: response.data[0].sky_id,
          icao: response.data[0].icao,
          name: response.data[0].name,
          location: response.data[0].location,
          id: response.data[0].id,
          time_zone: response.data[0].time_zone,
        });
      }
    }

    return response.data;
  } catch (error) {
    console.error("Error find airport:", error);
    await queryRunner.rollbackTransaction();
  } finally {
    await queryRunner.release();
  }
};

const searchCalenderPriceOneWay = async (
  fromEntityId: string,
  departDate: string,
  toEntityId: string
) => {
  try {
    const filePath = path.join(
      __dirname,
      "../../mockApiResponses/flights/price-calendar",
      `NYCA-2024-10-01-PARI-2024-10-31.json`
    );
    const data = fs.readFileSync(filePath, "utf8");
    const jsonData = JSON.parse(data);
    return jsonData;
  } catch (error) {
    console.error("Error reading mock data:", error);
  }
};

const searchCalenderPriceRoundTrip = async (
  fromEntityId: string,
  departDate: string,
  toEntityId: string,
  returnDate: string
) => {
  try {
    await delay(500);
    const filePath = path.join(
      __dirname,
      "../../mockApiResponses/flights/price-calendar",
      `HAN-2024-12-30-NRT-2025-03-30.json`
    );
    const data = fs.readFileSync(filePath, "utf8");
    const jsonData = JSON.parse(data);
    return jsonData;
  } catch (error) {
    console.error("Error reading mock data:", error);
  }
};

export = {
  autoComplete,
  searchOneWay,
  searchRoundTrip,
  searchDetail,
  searchIncomplete,
  searchAirport,
  searchCalenderPriceOneWay,
  searchCalenderPriceRoundTrip,
};
