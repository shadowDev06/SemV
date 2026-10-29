# Practical 9: Web Application using the Express.js Framework

## Aim
To create a web application using the Express.js framework.

## Files
| File | Purpose |
|------|---------|
| `server.js` | Express application: middleware, routes, HTML pages, JSON API, 404 and error handlers |
| `public/style.css` | Stylesheet served as a static asset by `express.static` |
| `package.json` | Project metadata, dependencies, and `start` / `dev` scripts |
| `.gitignore` | Keeps `node_modules` out of version control |

## How to run
```bash
npm install
npm start
```

Then open <http://localhost:3000> in a browser. Use `npm run dev` to restart the server automatically on file changes.

## Routes
| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Home page |
| GET | `/about` | Information about the application |
| GET | `/students` | Student table; supports `?course=` filter |
| GET | `/students/:id` | Single student page (404 if not found) |
| POST | `/students` | Adds a student from the HTML form, then redirects |
| GET | `/api/students` | All students as JSON |
| GET | `/api/students/:id` | One student as JSON (404 if not found) |
| GET | `/style.css` | Static asset served from `public/` |
| ANY | `*` | 404 page for unmatched routes |

## Theory

### Express.js
Express is a minimal, unopinionated web framework for Node.js. It wraps the built-in `http` module and adds routing, middleware, and helpers for sending responses, so a web application can be written in a few dozen lines. Each incoming request passes through a **middleware stack** — a chain of functions `(req, res, next)` — before a route handler produces the response.

### Middleware used
- `express.json()` — parses JSON request bodies into `req.body`.
- `express.urlencoded({ extended: true })` — parses HTML form submissions.
- `express.static("public")` — serves files such as CSS and images directly from disk.
- Custom logger — prints the timestamp, method, and URL of every request, then calls `next()`.
- 404 middleware — runs when no earlier route matched.
- Error handler `(err, req, res, next)` — a four-argument middleware that returns HTTP 500.

### Routing
A route maps an HTTP method and path to a handler: `app.get("/students", handler)`. Path parameters (`/students/:id`) are read from `req.params`, query strings (`?course=...`) from `req.query`, and submitted form fields from `req.body`.

### Request and response
`req` carries the method, URL, headers, parameters, and body. `res` provides `send()` for HTML/text, `json()` for JSON, `redirect()` to send a 302, and `status()` to set the status code, e.g. `res.status(404).send(...)`.

### Status codes demonstrated
- `200 OK` — normal pages and JSON responses
- `302 Found` — redirect after a successful form submission
- `400 Bad Request` — missing form fields
- `404 Not Found` — unknown student or unknown route
- `500 Internal Server Error` — uncaught exception in a route

## Expected output
Console on startup:
```
Student Portal running at http://localhost:3000
```

Console per request:
```
2026-10-29T05:54:12.345Z GET /
2026-10-29T05:54:15.120Z GET /students
2026-10-29T05:54:18.880Z POST /students
```

Visiting `/api/students` returns:
```json
[
  { "id": 1, "name": "Ali Sayyed", "course": "Computer Engineering", "marks": 88 },
  { "id": 2, "name": "Sara Khan", "course": "Information Technology", "marks": 92 },
  { "id": 3, "name": "Rahul Verma", "course": "Computer Engineering", "marks": 76 }
]
```

## Conclusion
Express.js makes building a Node.js web application straightforward: middleware handles cross-cutting concerns such as body parsing, static files, logging, and errors, while route handlers map HTTP methods and URLs to responses. The same server can serve both HTML pages and a JSON API.
