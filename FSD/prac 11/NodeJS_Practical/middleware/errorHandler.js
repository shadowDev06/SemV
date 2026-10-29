function notFound(req, res) {
  res.status(404).json({
    error: `Route ${req.method} ${req.originalUrl} not found`
  });
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "Validation failed",
      details: Object.values(err.errors).map((item) => ({
        field: item.path,
        message: item.message
      }))
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      error:
        err.kind === "ObjectId"
          ? `${err.path} is not a valid MongoDB id`
          : `${err.path} must be a valid ${err.kind}`
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      error: "A record with the same unique value already exists",
      details: Object.keys(err.keyValue || {}).map((field) => ({
        field,
        message: `${field} is already in use`
      }))
    });
  }

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Request body must be valid JSON" });
  }

  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
}

module.exports = { notFound, errorHandler };
