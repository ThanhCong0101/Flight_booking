const mongoose = require("mongoose");

export const connectMongoDB = async () => {
  await mongoose
    .connect(process.env.DATABASE_URL)
    .then(() => console.log("Connected to MongoDB!"))
    .catch((err) => console.log(err));
};
