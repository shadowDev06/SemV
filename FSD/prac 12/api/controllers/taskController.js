const store = require("../data/store");

const { PRIORITIES } = store;

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function validate(body, { partial }) {
  const data = {};
  const details = [];

  if (body.title !== undefined) {
    const title = typeof body.title === "string" ? body.title.trim() : "";

    if (title.length < 3 || title.length > 100) {
      details.push({
        field: "title",
        message: "Title must be between 3 and 100 characters"
      });
    } else {
      data.title = title;
    }
  } else if (!partial) {
    details.push({ field: "title", message: "Title is required" });
  }

  if (body.description !== undefined) {
    if (typeof body.description !== "string" || body.description.trim().length > 500) {
      details.push({
        field: "description",
        message: "Description must be a string of at most 500 characters"
      });
    } else {
      data.description = body.description.trim();
    }
  } else if (!partial) {
    data.description = "";
  }

  if (body.completed !== undefined) {
    if (typeof body.completed !== "boolean") {
      details.push({ field: "completed", message: "Completed must be true or false" });
    } else {
      data.completed = body.completed;
    }
  } else if (!partial) {
    data.completed = false;
  }

  if (body.priority !== undefined) {
    if (!PRIORITIES.includes(body.priority)) {
      details.push({
        field: "priority",
        message: `Priority must be one of: ${PRIORITIES.join(", ")}`
      });
    } else {
      data.priority = body.priority;
    }
  } else if (!partial) {
    data.priority = "medium";
  }

  return { data, details };
}

function listTasks(req, res) {
  const filters = {};

  if (req.query.completed !== undefined) {
    if (req.query.completed !== "true" && req.query.completed !== "false") {
      return res.status(400).json({ error: "completed filter must be 'true' or 'false'" });
    }

    filters.completed = req.query.completed === "true";
  }

  if (req.query.priority !== undefined) {
    if (!PRIORITIES.includes(req.query.priority)) {
      return res.status(400).json({
        error: `priority filter must be one of: ${PRIORITIES.join(", ")}`
      });
    }

    filters.priority = req.query.priority;
  }

  if (req.query.search !== undefined) {
    filters.search = String(req.query.search).trim();
  }

  const tasks = store.list(filters);

  res.json({ count: tasks.length, data: tasks });
}

function getTask(req, res) {
  const id = parseId(req.params.id);

  if (id === null) {
    return res.status(400).json({ error: "Task id must be a positive integer" });
  }

  const task = store.find(id);

  if (!task) {
    return res.status(404).json({ error: `Task with id ${id} not found` });
  }

  res.json({ data: task });
}

function createTask(req, res) {
  const { data, details } = validate(req.body, { partial: false });

  if (details.length > 0) {
    return res.status(400).json({ error: "Validation failed", details });
  }

  const task = store.insert(data);
  res.status(201).json({ data: task });
}

function updateTask(req, res) {
  const id = parseId(req.params.id);

  if (id === null) {
    return res.status(400).json({ error: "Task id must be a positive integer" });
  }

  const { data, details } = validate(req.body, { partial: true });

  if (details.length > 0) {
    return res.status(400).json({ error: "Validation failed", details });
  }

  if (Object.keys(data).length === 0) {
    return res
      .status(400)
      .json({ error: "Provide at least one of: title, description, completed, priority" });
  }

  const task = store.update(id, data);

  if (!task) {
    return res.status(404).json({ error: `Task with id ${id} not found` });
  }

  res.json({ data: task });
}

function deleteTask(req, res) {
  const id = parseId(req.params.id);

  if (id === null) {
    return res.status(400).json({ error: "Task id must be a positive integer" });
  }

  const task = store.remove(id);

  if (!task) {
    return res.status(404).json({ error: `Task with id ${id} not found` });
  }

  res.status(204).send();
}

module.exports = {
  listTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask
};
