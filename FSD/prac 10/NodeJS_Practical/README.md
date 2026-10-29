# Practical 10: CRUD Operations on PostgreSQL using Sequelize ORM

## Aim
To perform Create, Read, Update and Delete (CRUD) operations on a PostgreSQL database using the Sequelize ORM in Node.js.

## Objectives
- Connect a Node.js application to a PostgreSQL database with Sequelize.
- Define a model (`Student`) and let Sequelize create the matching table.
- Implement all four CRUD operations through a REST API.
- Validate input with Sequelize model validators and return meaningful HTTP errors.
- Exercise the API through a small browser interface.

## Folder structure
| Path | Purpose |
|------|---------|
| `server.js` | Express application, middleware, database connection, server start-up |
| `config/database.js` | Creates and exports the Sequelize instance (PostgreSQL) |
| `models/student.js` | `Student` model: fields, constraints and validators |
| `models/index.js` | Central model registry |
| `controllers/studentController.js` | CRUD handlers (create, read, update, delete) |
| `routes/studentRoutes.js` | Maps `/api/students` routes to controller handlers |
| `middleware/errorHandler.js` | 404 handler and Sequelize-aware error handler |
| `seed.js` | Inserts three sample students (safe to run repeatedly) |
| `public/` | Browser UI (HTML/CSS/JS) that calls the REST API |
| `.env.example` | Template for database credentials |

## Prerequisites
- Node.js 18 or newer
- PostgreSQL running locally (or a connection string to a hosted database), or Docker Desktop

## Database setup

### Option A — Docker (no PostgreSQL installation needed)
If Docker Desktop is installed, start a PostgreSQL container that matches the values in `.env`:
```bash
docker run -d --name fsd-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=fsd_practical \
  -p 5432:5432 \
  -v fsd-postgres-data:/var/lib/postgresql/data \
  postgres:16-alpine
```
Manage it with:
```bash
docker stop fsd-postgres     # stop
docker start fsd-postgres    # start again (data is kept in the volume)
docker rm -f fsd-postgres    # remove the container (the volume is kept)
```

### Option B — Local PostgreSQL
Create the database:
```sql
CREATE DATABASE fsd_practical;
```
or from the terminal:
```bash
createdb fsd_practical
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create your environment file:
   ```bash
   copy .env.example .env      # Windows
   cp .env.example .env        # macOS / Linux
   ```
   Then edit `.env` so `DB_USER` and `DB_PASSWORD` match your PostgreSQL account.

3. (Optional) Insert sample data:
   ```bash
   npm run seed
   ```

4. Start the application:
   ```bash
   npm start
   ```
   Open <http://localhost:3000>.

`server.js` calls `sequelize.sync()` on start-up, so the `students` table is created automatically if it does not exist. Existing data is preserved. To let Sequelize align the table with later model changes, use `sequelize.sync({ alter: true })` while developing.

## REST API

Base URL: `http://localhost:3000/api/students`

| Operation | Method | Endpoint | Body | Success |
|-----------|--------|----------|------|---------|
| Create | `POST` | `/api/students` | `{ name, email, course, marks }` | `201` + created record |
| Read all | `GET` | `/api/students` | — | `200` + `{ count, data }` |
| Read one | `GET` | `/api/students/:id` | — | `200` + record |
| Update | `PUT` / `PATCH` | `/api/students/:id` | any of `name, email, course, marks` | `200` + updated record |
| Delete | `DELETE` | `/api/students/:id` | — | `204` no content |

`GET /api/students` also accepts optional query parameters:
- `?course=Computer%20Engineering` — exact course filter (case-insensitive)
- `?search=ali` — case-insensitive match on name, email or course

Health check: `GET /api/health` confirms the database connection.

### Example requests

Create:
```bash
curl -X POST http://localhost:3000/api/students \
  -H "Content-Type: application/json" \
  -d '{"name":"Ali Sayyed","email":"ali@example.com","course":"Computer Engineering","marks":88}'
```

Read all:
```bash
curl http://localhost:3000/api/students
```

Read one:
```bash
curl http://localhost:3000/api/students/1
```

Update (`PATCH` changes only the supplied fields):
```bash
curl -X PATCH http://localhost:3000/api/students/1 \
  -H "Content-Type: application/json" \
  -d '{"marks":95}'
```

Delete:
```bash
curl -X DELETE http://localhost:3000/api/students/1
```

### Error responses
| Status | When |
|--------|------|
| `400` | Validation failure (empty name, invalid email, marks outside 0–100), invalid id, malformed JSON, or empty update body |
| `404` | Student or route not found |
| `409` | Email already registered |
| `500` | Database or unexpected server error |

Validation errors list the offending fields:
```json
{
  "error": "Validation failed",
  "details": [{ "field": "marks", "message": "Marks cannot be more than 100" }]
}
```

## Theory

### What is an ORM?
An Object-Relational Mapper maps tables and rows to classes and objects. Instead of writing SQL strings, you work with models and method calls, and the ORM generates the SQL. This keeps database code readable and protects against SQL injection because values are sent as bound parameters.

### Sequelize concepts used
- **Sequelize instance** — the connection to PostgreSQL, created in `config/database.js` with the `pg` driver.
- **Model** — a class describing a table. `Student` maps to the `students` table.
- **Schema definition** — each attribute declares its type, nullability and validators.
- **`sync()`** — creates missing tables from the model definitions. In production, versioned migrations are preferred for schema changes.
- **Validators** — `notEmpty`, `isEmail`, `len`, `min`, `max` run before an `INSERT`/`UPDATE`, so invalid data never reaches the database.
- **Constraints** — `allowNull: false` and `unique` become `NOT NULL` and `UNIQUE` constraints in PostgreSQL.

### How each operation maps to Sequelize
| CRUD | Sequelize call | SQL generated |
|------|----------------|---------------|
| Create | `Student.create(data)` | `INSERT INTO students (...) VALUES (...)` |
| Read all | `Student.findAll({ where })` | `SELECT ... FROM students WHERE ...` |
| Read one | `Student.findByPk(id)` | `SELECT ... WHERE id = $1 LIMIT 1` |
| Update | `student.update(data)` | `UPDATE students SET ... WHERE id = $n` |
| Delete | `student.destroy()` | `DELETE FROM students WHERE id = $n` |

### Request flow
```
Browser / curl
   -> Express route (/api/students)
      -> Controller (validation + Sequelize call)
         -> Sequelize model
            -> pg driver
               -> PostgreSQL
```

## Conclusion
Sequelize lets a Node.js application perform full CRUD operations on PostgreSQL using model methods instead of hand-written SQL. Models centralise the schema and validation rules, controllers keep the HTTP layer thin, and error handling translates ORM exceptions into appropriate HTTP status codes.
