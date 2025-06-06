const { PORT } = require("./config/server");
const { connectDB } = require("./config/db");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
import cookieParser from "cookie-parser";

const airportRoutes = require("./routes/airportRoutes");

import express from "express";
import { specs, swaggerUi } from "./config/swagger";

const errorHandler = require("./middleware/errorHandler");

import * as worker from "./workers/index";
import { addBookingStatusJob } from "./queues/bookingStatusQueue";
import { rateLimitMiddleware } from "./middleware/rateLimitMiddleware";
import { connectMongoDB } from "./config/mongoDB";
import { convertMessageToMongoDBFormat } from "./utils/messageUtils";

// Connect to Redis
import { initRedis } from "./config/redis";

// Middleware
var app = express();
app.use(express.json());

app.use(morgan("dev"));
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(bodyParser.json());

app.use(cookieParser());

app.use(
  cors({
    // origin: [
    //   "https://loquacious-zabaione-5e3768.netlify.app",
    //   "http://localhost:4200",
    // ],
    origin: [
      "http://flight-booking-fe.s3-website-ap-southeast-1.amazonaws.com",
      "http://flight-booking-admin-fe.s3-website-ap-southeast-1.amazonaws.com",
      "http://localhost:4300",
      "http://localhost:4200",
    ],
    // origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    // methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    // allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Replace sequential connections with Promise.all
const initializeConnections = async () => {
  try {
    await Promise.all([
      connectDB(),
      connectMongoDB(),
      initRedis().catch((err) => {
        console.log("Redis connection error, retrying...");
        // Retry Redis connection with exponential backoff
        return new Promise((resolve) => {
          setTimeout(() => resolve(initRedis()), 5000);
        });
      }),
    ]);
  } catch (err) {
    console.log("connection error:", err);
    process.exit(1);
  }
};

// Use in your startServer function
const startServer = async () => {
  await initializeConnections();
};

startServer();

// Define routes
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/airports", airportRoutes);
app.use("/api/aircrafts", require("./routes/aircraftRoutes"));

// Flight API Routes
app.use("/api/flights", require("./routes/flight/flightRoutes"));
app.use(
  "/api/flightsItinerary",
  require("./routes/flight/flightItineraryRoutes")
);
app.use("/api/flightLeg", require("./routes/flight/flightLegRoutes"));
app.use(
  "/api/flights/search",
  // rateLimitMiddleware,
  require("./routes/flight/flightSearchRoutes")
);

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/passengers", require("./routes/passengerRoutes"));

app.use("/api/chatbot", require("./routes/openAIRoutes"));
app.use("/api/voiceflow", require("./routes/voiceflowRoutes"));

// MongoDB Routes
app.use("/api/mongo/user", require("./routes/mongoDB/userRoutes"));
app.use("/api/mongo/room", require("./routes/mongoDB/roomRoutes"));
app.use("/api/mongo/message", require("./routes/mongoDB/messageRoutes"));
app.use("/api/mongo/chat", require("./routes/mongoDB/chatRoutes"));

app.use(errorHandler);

var server = app.listen(PORT, () => {
  
  console.log(`app running on ${PORT} port`);
});

worker;
addBookingStatusJob();


// SOCKET IO

const socket = require("socket.io");

const { handleSocket } = require("./services/socket/socketHandler");

const { decodeToken } = require("./services/authService");
const { ACCESS_TOKEN_SECRET } = require("./config/jwt");
const userMongoService = require("./services/mongoDB/userService");

const SocketIO = socket(server);

// At the start of socket connection
SocketIO.use(async (socket, next) => {
  const token =
    socket.handshake.auth.token || socket.handshake.headers.authorization;

  // console.log("token", token);
  if (token) {
    const decoded = await decodeToken(token, ACCESS_TOKEN_SECRET);

    console.log("decoded", decoded);
    const user = await userMongoService.getUserByField({
      user_id: decoded.user_id,
    });

    // const user = await getUserById(decoded.user_id);

    console.log("user", user);

    socket.user = user;
    next();
  } else {
    next();
  }
});

// Initialize socket connection
SocketIO.on("connection", (socket) => {
  handleSocket(SocketIO, socket);
});
