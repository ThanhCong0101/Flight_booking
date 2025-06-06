import fs from "fs";
import path from "path";

const axios = require("axios");

const { RAPID_API_KEY, RAPID_HOST } = require("../../config/rapid_api");
import { delay } from "../../utils/function";
import { AppDataSource } from "../../config/db";
import { Airport } from "../../models/entity/Airport";

const sessionIdMap = new Map([
  [
    "ClQIARJQCk4KJDc5ZThiMzcyLTcwZjEtNDNhMC1iNzJkLTFhMzU2OWI0Y2U2ZhACGiQyZGEzZWJjMC04OTUwLTQwMTMtYjg0Ni1jNmFhN2M3ODhjNjYSKHVzc181YzEzMDE1ZC1jMWYwLTQ5NjctYWQ2MC0zNzAxNjU1YjM3NDU=",
    "session1",
  ],
  [
    "ClQIARJQCk4KJDliMTU3OTQ2LTE2OWEtNGFlMC05ZWNmLTRlZDRlNGNjZTAzNBACGiQ4MGU0ZGNlOS1kYjE3LTRjOTItYTA4My1hYzQxOGQyOGFiMzkSKHVzc182ZDA2Mzc2MS1mZjVjLTRhODctYWYwZC1hM2RmY2QzZTkxNzE=",
    "session2",
  ],
  [
    "ClsIARJXCk4KJGQxNTQxOTY3LTMwYmEtNDFkZi04NDgxLWYxODNhYmE0ZTljZBACGiQ2YjBlMWY1MS02NDk5LTQ1OGUtYmJjNy02ZWJlNWRhOTU4N2YQxfyX1K8yEih1c3NfMTgwMTYzZmItMjc4NS00MmM1LWE5NjAtZTA1ZDA1OWVhYTQ3",
    "session3",
  ],
  [
    "ClsIARJXCk4KJDg4MGQ3YjM0LTc4NDItNDM1MC1iMTM5LTJjNGU1NzljYThlNRACGiQxMjRhOTY5Mi03NmViLTQwODEtOWVmYS02NmUxZjA3NDg2OGIQ_bal2a8yEih1c3NfODAzYzNiNjAtODlmMi00NWIzLWJkM2QtMmY4ZWU0MGY0YThj",
    "session4",
  ],
  [
    "Cl0IARJZCk4KJDNkNjNmZDhmLWVkMjktNGNlZi1hY2Y5LWUxMGNkMmIyNjBiNxABGiRhY2NmMmE4OS02M2VmLTQzMTktYTk4Ni03OWMzZTNlZDU2ZTEQhNyH-7EyGAESKHVzc18yZTgxYjUxNy02MjMzLTQyMmQtOWRjOS1lMzcxOTg4MmZlZjk=",
    "session5",
  ],
  [
    "Cl0IARJZCk4KJDMxNThhZTc0LTUwYTQtNGMwMC1iZTFmLTlhOGI2NmM3ZDVmNxACGiRmM2EwZjNjOS1hY2Q2LTQxMjMtYWQ4My05ZDJhMWM1MWFmMjQQ5ZGAnLcyGAESKHVzc19jODUxM2M5My03YzQzLTRjMWYtOTI0Mi03ZWUwYTg2YWRmZmQ=",
    "session6",
  ],
  [
    "ClQIARJQCk4KJDc5ZThiMzcyLTcwZjEtNDNhMC1iNzJkLTFhMzU2OWI0Y2U2ZhACGiQyZGEzZWJjMC04OTUwLTQwMTMtYjg0Ni1jNmFhN2M3ODhjNjYSKHVzc181YzEzMDE1ZC1jMWYwLTQ5NjctYWQ2MC0zNzAxNjU1YjM3NDU=",
    "session7",
  ],
  
  // Add more mappings as needed
]);

const itineraryIdMap = new Map([
  // [
  //   "12071-2410300140--32179-0-12409-2410300820|12409-2410312120--32179-0-12071-2411010030",
  //   "itinerary1",
  // ],
  ["12071-2506150140--32179-0-12409-2506150820", "itinerary40"],
  ["12071-2502282250--31705-0-12409-2503010525", "itinerary29"],
  ["12071-2502281040--31703-0-12409-2502281630", "itinerary30"],
  ["12071-2502280145--31705-0-12409-2502280755", "itinerary31"],
  ["12071-2502282340--31703-0-12409-2503010530", "itinerary32"],
  ["12071-2502280235--32442-2-12409-2502281550", "itinerary33"],
  ["12071-2502280140--32179-0-12409-2502280820", "itinerary34"],
  ["12071-2502281145--32439-1-12409-2502282150", "itinerary35"],
  ["12071-2502281330--32558-0-12409-2502281935", "itinerary36"],
  ["12071-2502280935--32456-1-12409-2502281835", "itinerary37"],
  ["12071-2502280325--32442-1-12409-2502281440", "itinerary38"],

  // Add more mappings as needed
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
    // const options = {
    //   method: "GET",
    //   url: "https://sky-scanner3.p.rapidapi.com/flights/auto-complete",
    //   params: { query: keyword },
    //   headers: {
    //     "x-rapidapi-key": RAPID_API_KEY,
    //     "x-rapidapi-host": RAPID_HOST,
    //   },
    // };

    // const response = await axios.request(options);

    // return response.data;
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
        return jsonData; // Explicitly return the jsonData
      }
    }
    return null; // Return null if no match is found
    // Simulate network delay
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
    const entityId = new Map([
      ["SGNA", "SGN"],
      ["LTI", "SGN"],

    ]);

    const fromEntityIdMap = entityId.get(fromEntityId) || fromEntityId;
    const toEntityIdMap = entityId.get(toEntityId) || toEntityId;

    // const options = {
    //   method: "GET",
    //   url: "https://sky-scanner3.p.rapidapi.com/flights/search-one-way",
    //   params: {
    //     fromEntityId,
    //     toEntityId,
    //     departDate,
    //     cabinClass,
    //     // travellerType,
    //   },
    //   headers: {
    //     "x-rapidapi-key": RAPID_API_KEY,
    //     "x-rapidapi-host": RAPID_HOST,
    //   },
    // };

    // const response = await axios.request(options);
    // console.log(response.data);

    // return response.data;

    console.log("search one way", fromEntityId, toEntityId, departDate);

    await delay(100);
    const filePath = path.join(
      __dirname,
      "../../mockApiResponses/flights/search-one-way",
      `${fromEntityIdMap}-${toEntityIdMap}-${departDate}.json`
    );
    const data = fs.readFileSync(filePath, "utf8");

    const jsonData = JSON.parse(data);

    // If flight list is not complete, call searchIncomplete
    if (jsonData.data.context.status === "incomplete") {
      const sessionId = jsonData.data.context.sessionId;
      const completeData = await searchIncomplete(sessionId);
      return completeData;
    } else {
      return jsonData; // Explicitly return the jsonData
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
    // const options = {
    //   method: "GET",
    //   url: "https://sky-scanner3.p.rapidapi.com/flights/search-roundtrip",
    //   params: {
    //     // fromEntityId: 'PARI'
    //     fromEntityId,
    //     toEntityId,
    //     departDate,
    //     returnDate,
    //     cabinClass,
    //     // travellerType,
    //   },
    //   headers: {
    //     "x-rapidapi-key": RAPID_API_KEY,
    //     "x-rapidapi-host": RAPID_HOST,
    //   },
    // };

    // const response = await axios.request(options);
    // console.log("search round trip", response.data);

    // return response.data;

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
      return jsonData; // Explicitly return the jsonData
    }
  } catch (error) {
    console.error("Error reading mock data:", error);
  }
};

const searchDetail = async (itineraryId: string, token: string) => {
  try {
    // if (itineraryIdMap.get(itineraryId)) {
      await delay(500);

      const fileName = itineraryIdMap.get(itineraryId) || itineraryId;

      console.log("search detail", fileName);

      const filePath = path.join(
        __dirname,
        "../../mockApiResponses/flights/detail",
        `search-${fileName}.json`
      );
      const data = fs.readFileSync(filePath, "utf8");
      const jsonData = JSON.parse(data);
      return jsonData; // Explicitly return the jsonData
    // } else {
      // const options = {
      //   method: "GET",
      //   url: "https://sky-scanner3.p.rapidapi.com/flights/detail",
      //   params: {
      //     itineraryId,
      //     token,
      //   },
      //   headers: {
      //     "x-rapidapi-key": RAPID_API_KEY,
      //     "x-rapidapi-host": RAPID_HOST,
      //   },
      // };

      // const response = await axios.request(options);
      // return response.data;
    // }
  } catch (error) {
    console.error("Error reading mock data:", error);
  }
};

const searchIncomplete = async (sessionId: string) => {
  try {
    // const options = {
    //   method: "GET",
    //   url: "https://sky-scanner3.p.rapidapi.com/flights/search-incomplete",
    //   params: {
    //     sessionId,
    //   },
    //   headers: {
    //     "x-rapidapi-key": RAPID_API_KEY,
    //     "x-rapidapi-host": "sky-scanner3.p.rapidapi.com",
    //   },
    // };

    // const response = await axios.request(options);
    // return response.data;

    await delay(500);
    const fileName = sessionIdMap.get(sessionId) || sessionId;

    const filePath = path.join(
      __dirname,
      "../../mockApiResponses/flights/search-incomplete",
      `${fileName}.json`
    );
    const data = fs.readFileSync(filePath, "utf8");
    const jsonData = JSON.parse(data);
    return jsonData; // Explicitly return the jsonData
    // Simulate network delay
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
      url: "https://sky-scanner3.p.rapidapi.com/flights/airports",
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

const getFirstDayOfMonth = (dateString: string): string => {
  const date = new Date(dateString);
  date.setDate(1); // Set to first day of month
  return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
};

const searchCalenderPriceOneWay = async (
  fromEntityId: string,
  departDate: string,
  toEntityId: string
) => {
  try {
    const entityId = new Map([
      ["SGNA", "SGN"],
      ["LTI", "SGN"],

    ]);
    // const fileName = sessionIdMap.get(sessionId) || sessionId;

    // const options = {
    //   method: "GET",
    //   url: "https://sky-scanner3.p.rapidapi.com/flights/price-calendar",
    //   params: {
    //     fromEntityId,
    //     departDate,
    //     toEntityId,
    //   },
    //   headers: {
    //     "x-rapidapi-key": RAPID_API_KEY,
    //     "x-rapidapi-host": "sky-scanner3.p.rapidapi.com",
    //   },
    // };

    // const response = await axios.request(options);
    // // console.log(response.data);

    // return response.data;

    const fromEntityIdMap = entityId.get(fromEntityId) || fromEntityId;
    const toEntityIdMap = entityId.get(toEntityId) || toEntityId;

    const firstDayOfMonth = getFirstDayOfMonth(departDate);

    


    console.log("fromEntityIdMap", fromEntityIdMap);
    console.log("toEntityIdMap", toEntityIdMap);

    const filePath = path.join(
      __dirname,
      "../../mockApiResponses/flights/price-calendar",
      `${fromEntityIdMap}-${firstDayOfMonth}-${toEntityIdMap}-2025-10-31.json`
    );
    const data = fs.readFileSync(filePath, "utf8");
    const jsonData = JSON.parse(data);
    return jsonData; // Explicitly return the jsonData
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
    
    // const options = {
      //   method: "GET",
      //   url: "https://sky-scanner3.p.rapidapi.com/flights/price-calendar-return",
      //   params: {
        //     fromEntityId,
        //     departDate,
        //     toEntityId,
        //     returnDate,
        //   },
        //   headers: {
          //     "x-rapidapi-key": RAPID_API_KEY,
          //     "x-rapidapi-host": "sky-scanner3.p.rapidapi.com",
          //   },
          // };
          // const response = await axios.request(options);
          
          // return response.data;
    // await delay(500);
    // const fileName = sessionIdMap.get(sessionId) || sessionId;

    const filePath = path.join(
      __dirname,
      "../../mockApiResponses/flights/price-calendar",
      `HAN-2024-12-30-NRT-2025-03-30.json`
    );
    const data = fs.readFileSync(filePath, "utf8");
    const jsonData = JSON.parse(data);
    return jsonData; // Explicitly return the jsonData
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
