require("dotenv").config();

const express = require("express");
const cors = require("cors");
const taskRoutes = require("./routes/taskRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});

app.get("/api", (req, res) => {
  res.json({
    name: "Tasks REST API",
    version: "1.0.0",
    endpoints: {
      "GET /api/health": "Check that the API is running",
      "GET /api/tasks": "List tasks (optional: completed, priority, search)",
      "GET /api/tasks/:id": "Read one task",
      "POST /api/tasks": "Create a task",
      "PUT /api/tasks/:id": "Update a task",
      "PATCH /api/tasks/:id": "Update part of a task",
      "DELETE /api/tasks/:id": "Delete a task"
    }
  });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", uptime: Number(process.uptime().toFixed(1)) });
});

app.use("/api/tasks", taskRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Tasks REST API running at http://localhost:${PORT}/api`);
  console.log(`Allowing requests from ${CLIENT_ORIGIN}`);
});
