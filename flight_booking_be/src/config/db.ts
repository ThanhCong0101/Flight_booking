import "reflect-metadata";
import { DataSource, ExplainVerbosity } from "typeorm";
import { User } from "../models/entity/User";
import { Payment } from "../models/entity/Payment";
import { Booking } from "../models/entity/Booking";
import { Aircraft } from "../models/entity/Aircraft";
import { Airport } from "../models/entity/Airport";
import { Flight } from "../models/entity/Flight";
import { Passenger } from "../models/entity/Passenger";
import { FlightLeg } from "../models/entity/FlightLegs";
import { FlightItinerary } from "../models/entity/FlightItinerary";

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = require("./server");

const node_env = process.env.NODE_ENV || "development";

const AppDataSource = new DataSource({
  type: "mysql",
  host: node_env === "development" ? "localhost" : DB_HOST,
  port: node_env === "development" ? 3308 : DB_PORT,
  username: node_env === "development" ? "root" : DB_USER,
  password: node_env === "development" ? "123456" : DB_PASSWORD,
  database: node_env === "development" ? "hoidanit" : DB_NAME,
  synchronize: true,
  cache: true,
  entitySkipConstructor: true,
  logging: false,
  charset: "utf8mb4",
  timezone: "Z",
  entities: [
    User,
    Passenger,
    Airport,
    Aircraft,
    Booking,
    FlightItinerary,
    FlightLeg,
    Flight,
  ],
  migrations: [],
  subscribers: [],
  connectTimeout: 60000,
});

const connectDB = async () => {
  try {
    await AppDataSource.initialize()
      .then(() => {
        console.log("Connected to database!");
      })
      .catch((error) => console.error(error));
  } catch (error) {
    console.error(error.message);
  }
};

export { connectDB, AppDataSource };
