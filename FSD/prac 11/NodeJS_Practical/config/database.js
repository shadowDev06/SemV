require("dotenv").config();

const mongoose = require("mongoose");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/fsd_practical";

async function connectDatabase() {
  mongoose.set("strictQuery", true);

  await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000
  });

  console.log(
    `Connected to MongoDB database "${mongoose.connection.name}" at ${mongoose.connection.host}`
  );

  return mongoose.connection;
}

module.exports = { mongoose, connectDatabase };
