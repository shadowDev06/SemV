# Practical 12: REST API with Express.js consumed by React

## Aim
To create a REST API using Express.js and consume it from a React application.

## What this practical demonstrates
- Designing a REST resource (`tasks`) with meaningful routes, HTTP methods and status codes.
- Building an Express.js server with JSON parsing, CORS, routing, controllers and error handling.
- Consuming the API from React with `fetch`, `useState`, `useEffect` and `useCallback`.
- Performing all four operations from the UI: create, read, update and delete.

## Architecture
```
┌─────────────────────────┐        HTTP / JSON        ┌──────────────────────────┐
│  React client (Vite)    │  ───────────────────────►  │  Express REST API        │
│  http://localhost:5173  │  ◄───────────────────────  │  http://localhost:4000   │
│  fetch → /api/tasks     │        JSON responses      │  in-memory task store    │
└─────────────────────────┘                            └──────────────────────────┘
```

## Folder structure
```
prac 12/
├── README.md
├── api/                          # Express.js REST API
│   ├── server.js                 # App setup: CORS, JSON, routes, error handler
│   ├── package.json
│   ├── .env.example
│   ├── data/store.js             # In-memory task collection + CRUD helpers
│   ├── controllers/taskController.js
│   ├── routes/taskRoutes.js
│   └── middleware/errorHandler.js
└── client/                       # React application (Vite)
    ├── package.json
    ├── index.html
    ├── vite.config.js
    ├── .env.example
    └── src/
        ├── main.jsx
        ├── App.jsx               # State, fetching and event handlers
        ├── App.css
        ├── index.css
        ├── api/tasks.js          # fetch wrapper for the REST API
        └── components/
            ├── TaskForm.jsx      # Create / edit form
            ├── TaskList.jsx
            └── TaskItem.jsx
```

## Prerequisites
- Node.js 18 or newer
- Two terminals (one for the API, one for the React dev server)

## Setup and run

### 1. Start the REST API
```bash
cd "prac 12/api"
npm install
copy .env.example .env      # Windows
cp .env.example .env        # macOS / Linux
npm start
```
The API runs at <http://localhost:4000/api>. The `.env` file sets `PORT` and the CORS `CLIENT_ORIGIN`; the defaults work without it.

### 2. Start the React client
```bash
cd "prac 12/client"
npm install
copy .env.example .env
npm run dev
```
Open <http://localhost:5173>.

The client's local `.npmrc` sets `include=dev` so Vite is installed even if your shell sets `NODE_ENV=production`. Without that file you would need `npm install --include=dev`.

`VITE_API_URL` in `client/.env` points at the API (`http://localhost:4000/api`). If you change the API port, update both files.

> **Note:** the task store lives in memory. Restarting the API restores the three sample tasks, and every restart discards changes made through the UI.

## REST API

Base URL: `http://localhost:4000/api`

| Operation | Method | Endpoint | Request body | Success response |
|-----------|--------|----------|--------------|------------------|
| Info | `GET` | `/api` | — | Endpoint catalogue |
| Health | `GET` | `/api/health` | — | `{ status, uptime }` |
| List | `GET` | `/api/tasks` | — | `200` `{ count, data }` |
| Read one | `GET` | `/api/tasks/:id` | — | `200` `{ data }` |
| Create | `POST` | `/api/tasks` | `{ title, description?, priority?, completed? }` | `201` `{ data }` |
| Update | `PUT` / `PATCH` | `/api/tasks/:id` | any of the fields above | `200` `{ data }` |
| Delete | `DELETE` | `/api/tasks/:id` | — | `204` no content |

### Task shape
```json
{
  "id": 1,
  "title": "Design the REST API",
  "description": "Define routes, request bodies and status codes.",
  "priority": "high",
  "completed": false,
  "createdAt": "2026-01-05T09:00:00.000Z",
  "updatedAt": "2026-01-05T09:00:00.000Z"
}
```

### Query parameters for `GET /api/tasks`
| Parameter | Values | Example |
|-----------|--------|---------|
| `completed` | `true` / `false` | `/api/tasks?completed=false` |
| `priority` | `low` / `medium` / `high` | `/api/tasks?priority=high` |
| `search` | any text (matches title or description) | `/api/tasks?search=react` |

Parameters can be combined: `/api/tasks?completed=false&priority=high`.

### Validation and errors
| Status | When |
|--------|------|
| `400` | Title missing or shorter than 3 characters, description over 500 characters, invalid priority, non-boolean `completed`, invalid id, malformed JSON, empty update body |
| `404` | Task or route not found |
| `500` | Unexpected server error |

Example validation response:
```json
{
  "error": "Validation failed",
  "details": [{ "field": "title", "message": "Title is required" }]
}
```

### Example requests
```bash
# List all tasks
curl http://localhost:4000/api/tasks

# Create a task
curl -X POST http://localhost:4000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Write the lab report","description":"Include screenshots","priority":"high"}'

# Toggle completion
curl -X PATCH http://localhost:4000/api/tasks/2 \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'

# Delete a task
curl -X DELETE http://localhost:4000/api/tasks/3
```

## How the React client consumes the API

1. **API module** — `src/api/tasks.js` wraps `fetch`. It builds query strings, sends JSON bodies, throws readable errors from the API's `error` / `details` fields, and returns parsed JSON.
2. **Loading data** — `App.jsx` uses `useEffect` with a memoised `loadTasks` callback. The callback changes whenever the filter or search term changes, so the effect automatically refetches from the server.
3. **Creating** — `TaskForm` submits to `POST /api/tasks`; on success the form resets and the list reloads.
4. **Updating** — clicking *Edit* loads the task into the form and submits `PATCH /api/tasks/:id`. Checking the checkbox sends the same `PATCH` with `{ completed }`, which is why a toggle needs no separate endpoint.
5. **Deleting** — `DELETE /api/tasks/:id`, followed by a reload. The browser `confirm()` prevents accidental deletion.
6. **Server-side filtering** — the All / Active / Completed buttons and the search box turn into `completed` and `search` query parameters, so filtering is performed by Express rather than in the browser.
7. **Feedback** — loading state, a success banner that clears itself, and an error banner populated from the API response.

## Theory

### REST
Representational State Transfer models the server as a set of resources identified by URLs. Each URL is acted on with standard HTTP methods:
- `GET` reads without changing state.
- `POST` creates a new resource and returns `201 Created`.
- `PUT`/`PATCH` modify an existing resource.
- `DELETE` removes it and typically returns `204 No Content`.

REST responses are stateless: every request carries all the information needed, and the server keeps no per-client session. JSON is the usual representation.

### Express.js
Express provides routing (`app.get`, `express.Router`), middleware (`express.json`, `cors`, request logging, custom error middleware) and a clean request/response API. Controllers keep route files small by moving request handling into separate functions.

### CORS
The React dev server runs on port 5173 while the API runs on port 4000. Browsers block cross-origin `fetch` calls unless the API opts in with `Access-Control-Allow-Origin`. The `cors` middleware adds that header for the configured `CLIENT_ORIGIN`, and automatically answers the browser's preflight `OPTIONS` request.

### React hooks used
- `useState` stores the task list, filter, search text, editing target and status messages.
- `useEffect` runs the initial fetch and refetches when the filter or search changes; it also debounces the search input.
- `useCallback` keeps `loadTasks` stable between renders so the fetching effect only reruns when its real inputs change.
- State flows down as props (`TaskForm`, `TaskList`, `TaskItem`) and events flow up through callbacks.

### Request flow for creating a task
```
TaskForm submit
  → App.handleCreate
    → api.createTask (fetch POST /api/tasks)
      → Express route → controller validates body
        → store.insert → 201 JSON
  → App.loadTasks (fetch GET /api/tasks)
    → setTasks → React re-renders the list
```

## Conclusion
A REST API exposes resources through predictable URLs and HTTP methods, and React consumes it with plain `fetch` calls driven by component state. Separating the API layer (`api/`), the server logic (`controllers/`, `routes/`) and the React UI (`components/`) keeps both sides independently runnable and easy to extend.
