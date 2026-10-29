require("dotenv").config();

const path = require("path");
const express = require("express");
const { sequelize } = require("./models");
const studentRoutes = require("./routes/studentRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const { describeError } = require("./utils/describeError");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});

app.get("/api/health", async (req, res, next) => {
  try {
    await sequelize.authenticate();
    res.json({ status: "ok", database: "connected" });
  } catch (error) {
    next(error);
  }
});

app.use("/api/students", studentRoutes);

app.use(notFound);
app.use(errorHandler);

async function start() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log("Connected to PostgreSQL and synced the Students model.");

    app.listen(PORT, () => {
      console.log(`Sequelize CRUD app running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Could not start the application:", describeError(error));
    console.error("Check that PostgreSQL is running and the DB_* values in .env are correct.");
    process.exit(1);
  }
}

async function shutdown() {
  await sequelize.close();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

start();
