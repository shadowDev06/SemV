# Program 3 — Node.js Expense Tracker

A server-side Expense Tracker using only Node.js built-ins. It provides a JSON HTTP API, persists expenses to `data/expenses.json`, performs atomic writes, and emits logged notifications after successful create, update, and delete operations. **Express and third-party runtime packages are not used.**

## Requirements and commands

- Node.js 18 or newer (the demo and tests use the built-in `fetch` API).
- No `npm install` is needed.

```bash
npm start       # http://127.0.0.1:3000
npm run demo    # live CRUD demo on an ephemeral port; writes output.txt
npm test        # built-in node:test integration test
```

Optional environment variables for `npm start`: `PORT` (default `3000`) and `HOST` (default `127.0.0.1`). `PORT=0` selects an ephemeral port.

## API

Base URL: `http://127.0.0.1:3000`

| Method | Route | Success | Purpose |
|---|---|---:|---|
| GET | `/api/health` | 200 | Health, timestamp, and process uptime |
| GET | `/api/expenses` | 200 | Return `{ count, expenses }` |
| GET | `/api/expenses/:id` | 200 | Return one expense as `{ expense }` |
| POST | `/api/expenses` | 201 | Create an expense; returns `Location` header |
| PATCH | `/api/expenses/:id` | 200 | Update one or more editable fields |
| DELETE | `/api/expenses/:id` | 204 | Delete an expense; no response body |

All non-204 responses are JSON. Write requests require `Content-Type: application/json`.

### Expense shape and validation

```json
{
  "title": "Groceries",
  "amount": 42.5,
  "category": "food",
  "date": "2026-01-10",
  "status": "pending"
}
```

- `title`: required non-empty string, maximum 100 characters after trimming.
- `amount`: required finite JSON **number** greater than zero (numeric strings are rejected).
- `category`: required non-empty string, maximum 50 characters after trimming. Examples: `food`, `transport`, `bills`, `education`, `health`, `entertainment`, `other`.
- `date`: required real calendar date in exact `YYYY-MM-DD` format; impossible dates such as `2026-02-30` are rejected.
- `status`: required and either `pending` or `paid`.
- POST requires all five fields. PATCH accepts any non-empty subset. Unknown fields, including client-supplied IDs and timestamps, are ignored.

The server adds `id` using `crypto.randomUUID()`, plus `createdAt` and `updatedAt` ISO timestamps.

### Example requests

```bash
curl http://127.0.0.1:3000/api/expenses

curl -X POST http://127.0.0.1:3000/api/expenses \
  -H "Content-Type: application/json" \
  -d '{"title":"Groceries","amount":42.5,"category":"food","date":"2026-01-10","status":"pending"}'

curl -X PATCH http://127.0.0.1:3000/api/expenses/EXPENSE_ID \
  -H "Content-Type: application/json" \
  -d '{"amount":45,"status":"paid"}'

curl -X DELETE http://127.0.0.1:3000/api/expenses/EXPENSE_ID
```

### Errors

Errors use a consistent shape and appropriate status code:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed.",
    "details": [
      { "field": "amount", "message": "amount must be a finite number greater than zero." }
    ]
  }
}
```

- `400`: validation failure, malformed JSON, empty/non-object body, invalid URL encoding.
- `404`: unknown route or expense ID.
- `405`: unsupported method, with an `Allow` header.
- `413`: JSON body larger than 64 KiB.
- `415`: missing or unsupported content type.
- `500`: unexpected server failure.

## Persistence and events

`expenseStore.js` extends `EventEmitter`. Mutations are serialized, written to a uniquely named temporary file in the data directory, and renamed over the JSON file only after serialization succeeds. In-memory state changes and `create`, `update`, or `delete` events occur only after the disk write succeeds. The default server logs these events, for example:

```text
[event] create 5bc0... "Groceries"
[event] update 5bc0... "Groceries"
[event] delete 5bc0... "Groceries"
```

A malformed existing JSON file is reported rather than overwritten. If the file does not exist, the store initializes it with `[]`.

## Demo and clean data

`node demo.js` starts the actual HTTP server on an OS-assigned port, exercises health, two creates, list, get-by-ID, patch, invalid input, delete, final list, 404 handling, and a fresh-store disk reload. Output is printed as concise labeled lines and the same lines are saved to `output.txt`.

The demo uses `data/.demo-expenses.json`, removes it during cleanup, closes its server, and leaves the three-record seed in `data/expenses.json` unchanged. The integration test similarly uses and removes its own JSON file while verifying persistence across a full server restart.
