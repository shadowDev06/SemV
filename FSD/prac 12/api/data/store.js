const PRIORITIES = ["low", "medium", "high"];

let tasks = [
  {
    id: 1,
    title: "Design the REST API",
    description: "Define routes, request bodies and status codes for the task resource.",
    priority: "high",
    completed: true,
    createdAt: "2026-01-05T09:00:00.000Z",
    updatedAt: "2026-01-05T09:00:00.000Z"
  },
  {
    id: 2,
    title: "Build the Express server",
    description: "Mount JSON parsing, CORS, routes and the error handler.",
    priority: "high",
    completed: false,
    createdAt: "2026-01-05T10:30:00.000Z",
    updatedAt: "2026-01-05T10:30:00.000Z"
  },
  {
    id: 3,
    title: "Consume the API from React",
    description: "Fetch tasks, create new ones and update or delete existing records.",
    priority: "medium",
    completed: false,
    createdAt: "2026-01-05T12:15:00.000Z",
    updatedAt: "2026-01-05T12:15:00.000Z"
  }
];

let nextId = 4;

function now() {
  return new Date().toISOString();
}

function list({ completed, priority, search } = {}) {
  return tasks.filter((task) => {
    if (completed !== undefined && task.completed !== completed) {
      return false;
    }

    if (priority && task.priority !== priority) {
      return false;
    }

    if (search) {
      const term = search.toLowerCase();
      const matchesTitle = task.title.toLowerCase().includes(term);
      const matchesDescription = task.description.toLowerCase().includes(term);

      if (!matchesTitle && !matchesDescription) {
        return false;
      }
    }

    return true;
  });
}

function find(id) {
  return tasks.find((task) => task.id === id) || null;
}

function insert(data) {
  const task = {
    id: nextId++,
    ...data,
    createdAt: now(),
    updatedAt: now()
  };

  tasks.push(task);
  return task;
}

function update(id, changes) {
  const task = find(id);

  if (!task) {
    return null;
  }

  Object.assign(task, changes, { updatedAt: now() });
  return task;
}

function remove(id) {
  const index = tasks.findIndex((task) => task.id === id);

  if (index === -1) {
    return null;
  }

  return tasks.splice(index, 1)[0];
}

module.exports = {
  PRIORITIES,
  list,
  find,
  insert,
  update,
  remove
};
