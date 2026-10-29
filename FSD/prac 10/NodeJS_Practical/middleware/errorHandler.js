const { Sequelize } = require("sequelize");

function notFound(req, res) {
  res.status(404).json({
    error: `Route ${req.method} ${req.originalUrl} not found`
  });
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof Sequelize.UniqueConstraintError) {
    return res.status(409).json({
      error: "A record with the same unique value already exists",
      details: err.errors.map((item) => ({ field: item.path, message: item.message }))
    });
  }

  if (err instanceof Sequelize.ValidationError) {
    return res.status(400).json({
      error: "Validation failed",
      details: err.errors.map((item) => ({ field: item.path, message: item.message }))
    });
  }

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Request body must be valid JSON" });
  }

  if (err instanceof Sequelize.DatabaseError) {
    console.error(err);
    return res.status(500).json({ error: "Database error" });
  }

  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
}

module.exports = { notFound, errorHandler };
