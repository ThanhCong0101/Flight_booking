import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Flight Booking API",
      version: "1.0.0",
      description: "API documentation for the Flight Booking system",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 8081}`,
      },
    ],
    components: {
      schemas: {
        Airport: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            code: { type: "string" },
            city: { type: "string" },
            country: { type: "string" },
            // Add other properties as needed
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts"], // Path to the API routes
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };
