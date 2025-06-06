import express from "express";
const cors = require("cors");

var app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Swagger

module.exports = app;
