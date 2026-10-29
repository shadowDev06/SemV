require("dotenv").config();

const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const { connectDatabase } = require("./config/database");
const { Course, Student } = require("./models");
const courseRoutes = require("./routes/courseRoutes");
const studentRoutes = require("./routes/studentRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});

app.get("/api/health", (req, res) => {
  const connected = mongoose.connection.readyState === 1;

  res.status(connected ? 200 : 503).json({
    status: connected ? "ok" : "unavailable",
    database: connected ? "connected" : "disconnected",
    name: mongoose.connection.name || null
  });
});

app.get("/api/collections", async (req, res, next) => {
  try {
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    const data = await Promise.all(
      collections.map(async (collection) => {
        const handle = db.collection(collection.name);
        const [count, indexes] = await Promise.all([
          handle.countDocuments(),
          handle.indexes()
        ]);

        return {
          name: collection.name,
          documents: count,
          indexes: indexes.map((index) => index.name)
        };
      })
    );

    res.json({ database: db.databaseName, collections: data });
  } catch (error) {
    next(error);
  }
});

app.use("/api/courses", courseRoutes);
app.use("/api/students", studentRoutes);

app.use(notFound);
app.use(errorHandler);

async function start() {
  try {
    await connectDatabase();
    await Promise.all([Course.init(), Student.init()]);
    console.log("Course and Student models are ready (collections and indexes created).");

    app.listen(PORT, () => {
      console.log(`Mongoose collections app running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Could not start the application:", error.message);
    console.error(
      "Check that MongoDB is running and MONGODB_URI in .env points to a reachable database."
    );
    process.exit(1);
  }
}

async function shutdown() {
  await mongoose.connection.close();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

start();
