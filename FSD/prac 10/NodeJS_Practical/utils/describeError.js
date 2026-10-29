function describeError(error, seen = new WeakSet()) {
  if (!error) {
    return "Unknown error";
  }

  if (typeof error !== "object") {
    return String(error);
  }

  if (seen.has(error)) {
    return "";
  }
  seen.add(error);

  if (error.message) {
    return error.message;
  }

  if (Array.isArray(error.errors) && error.errors.length > 0) {
    const messages = [
      ...new Set(error.errors.map((item) => describeError(item, seen)).filter(Boolean))
    ];

    if (messages.length > 0) {
      return messages.join("; ");
    }
  }

  for (const key of ["parent", "original"]) {
    if (error[key]) {
      const message = describeError(error[key], seen);

      if (message) {
        return message;
      }
    }
  }

  return error.code || error.name || "Unknown error";
}

module.exports = { describeError };
