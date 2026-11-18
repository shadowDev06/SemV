# Program 4 — Express Expense Tracker REST API

## Run

1. Run `npm install`.
2. Copy `.env.example` to `.env` and replace the JWT secret.
3. Run `npm start` and open `http://localhost:4000/api/health`.

## Authentication

- `POST /api/auth/register` accepts `email` and `password`.
- `POST /api/auth/login` returns a JWT.
- Send `Authorization: Bearer <token>` to protected routes.
- `GET /api/protected` verifies JWT authentication.

All `/api/expenses` routes require a token. Passwords are hashed with bcryptjs before storage. Records are isolated by the authenticated user's ID.

## Expense routes

- `GET /api/expenses`
- `GET /api/expenses/:id`
- `POST /api/expenses`
- `PUT /api/expenses/:id`
- `DELETE /api/expenses/:id`

Expense JSON fields: `title`, positive `amount`, `category`, `date` (`YYYY-MM-DD`), and `status` (`paid` or `pending`).

## Verify

Run `npm run demo`. The script makes real HTTP requests for registration, login, protected access, validation and CRUD, writes `output.txt`, removes demo data and stops its ephemeral server.
