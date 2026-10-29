# Practical 11: Creating and Managing MongoDB Collections using Mongoose ODM

## Aim
To create and manage MongoDB collections using the Mongoose ODM in a Node.js application.

## Objectives
- Connect a Node.js application to a MongoDB database with Mongoose.
- Define schemas and compile them into models (`Course` and `Student`).
- Let Mongoose create the matching `courses` and `students` collections automatically.
- Implement Create, Read, Update and Delete operations on both collections through a REST API.
- Model a relationship between collections with `ObjectId` references and `populate()`.
- Apply schema validation, unique indexes and timestamps.
- Inspect live collection metadata (document counts and indexes) from the API and browser UI.

## Folder structure
| Path | Purpose |
|------|---------|
| `server.js` | Express application, MongoDB connection, collection metadata API, server start-up |
| `config/database.js` | Mongoose connection helper using `MONGODB_URI` |
| `models/course.js` | `Course` schema: code, name, credits and validators |
| `models/student.js` | `Student` schema: name, email, course reference, marks and validators |
| `models/index.js` | Central model registry |
| `controllers/courseController.js` | List, create and delete courses (blocks deleting a referenced course) |
| `controllers/studentController.js` | Full CRUD for students with populated course details |
| `routes/courseRoutes.js` | Maps `/api/courses` routes to controller handlers |
| `routes/studentRoutes.js` | Maps `/api/students` routes to controller handlers |
| `middleware/errorHandler.js` | 404 handler and Mongoose-aware error handler |
| `seed.js` | Upserts three courses and three students (safe to run repeatedly) |
| `public/` | Browser UI (HTML/CSS/JS) that calls the REST API |
| `.env.example` | Template for the MongoDB connection string |

## Prerequisites
- Node.js 18 or newer
- MongoDB running locally (or a MongoDB Atlas connection string)

## Setup

1. Make sure MongoDB is running. With a local installation the default URI is
   `mongodb://127.0.0.1:27017/fsd_practical`, and the database is created on first write.

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your environment file:
   ```bash
   copy .env.example .env      # Windows
   cp .env.example .env        # macOS / Linux
   ```
   Edit `.env` if your MongoDB runs elsewhere or you use Atlas.

4. (Optional) Insert sample data:
   ```bash
   npm run seed
   ```

5. Start the application:
   ```bash
   npm start
   ```
   Open <http://localhost:3000>.

On start-up `server.js` connects to MongoDB and calls `Course.init()` and `Student.init()`.
Mongoose creates the `courses` and `students` collections, builds the unique indexes, and only
then starts listening. The collections therefore exist before the first request.

## REST API

Base URL: `http://localhost:3000`

### Students

| Operation | Method | Endpoint | Body | Success |
|-----------|--------|----------|------|---------|
| Create | `POST` | `/api/students` | `{ name, email, course, marks }` | `201` + created record |
| Read all | `GET` | `/api/students` | — | `200` + `{ count, data }` |
| Read one | `GET` | `/api/students/:id` | — | `200` + record |
| Update | `PUT` / `PATCH` | `/api/students/:id` | any of `name, email, course, marks` | `200` + updated record |
| Delete | `DELETE` | `/api/students/:id` | — | `204` no content |

`course` must be the `_id` of an existing course. Responses replace that id with the populated
course document:
```json
{
  "_id": "6720f1c2a4b8e91d3c5a7b10",
  "name": "Ali Sayyed",
  "email": "ali.sayyed@example.com",
  "course": { "_id": "6720e8b1a4b8e91d3c5a7b01", "code": "CS301", "name": "Data Structures", "credits": 4 },
  "marks": 88,
  "createdAt": "2026-10-29T09:00:00.000Z",
  "updatedAt": "2026-10-29T09:00:00.000Z"
}
```

`GET /api/students` accepts optional query parameters:
- `?course=<course _id>` — only students enrolled in that course
- `?search=ali` — case-insensitive match on name or email

### Courses

| Operation | Method | Endpoint | Body | Success |
|-----------|--------|----------|------|---------|
| Create | `POST` | `/api/courses` | `{ code, name, credits }` | `201` + created record |
| Read all | `GET` | `/api/courses` | — | `200` + `{ count, data }` with `studentCount` |
| Delete | `DELETE` | `/api/courses/:id` | — | `204` no content |

A course that still has students is protected: deleting it returns `409`.

### Collections and health

| Endpoint | Purpose |
|----------|---------|
| `GET /api/collections` | Lists every collection in the database with document count and index names |
| `GET /api/health` | Reports the Mongoose connection state |

Example `GET /api/collections` response:
```json
{
  "database": "fsd_practical",
  "collections": [
    { "name": "courses", "documents": 3, "indexes": ["_id_", "code_1"] },
    { "name": "students", "documents": 3, "indexes": ["_id_", "email_1", "course_1"] }
  ]
}
```

### Example requests

Create a course:
```bash
curl -X POST http://localhost:3000/api/courses \
  -H "Content-Type: application/json" \
  -d '{"code":"CS303","name":"Operating Systems","credits":4}'
```

Create a student (use the course `_id` returned above):
```bash
curl -X POST http://localhost:3000/api/students \
  -H "Content-Type: application/json" \
  -d '{"name":"Ali Sayyed","email":"ali@example.com","course":"6720e8b1a4b8e91d3c5a7b01","marks":88}'
```

Read all students:
```bash
curl http://localhost:3000/api/students
```

Update only the marks:
```bash
curl -X PATCH http://localhost:3000/api/students/6720f1c2a4b8e91d3c5a7b10 \
  -H "Content-Type: application/json" \
  -d '{"marks":95}'
```

Delete a student:
```bash
curl -X DELETE http://localhost:3000/api/students/6720f1c2a4b8e91d3c5a7b10
```

### Error responses
| Status | When |
|--------|------|
| `400` | Validation failure, invalid MongoDB id, missing/invalid course reference, or malformed JSON |
| `404` | Student, course or route not found |
| `409` | Duplicate email or course code, or deleting a course assigned to students |
| `500` | Database or unexpected server error |

Validation errors list the offending fields:
```json
{
  "error": "Validation failed",
  "details": [{ "field": "marks", "message": "Marks cannot be more than 100" }]
}
```

## Theory

### What is an ODM?
An Object-Document Mapper maps MongoDB documents to JavaScript objects. Instead of building
BSON queries by hand, you define a **schema**, compile it into a **model**, and call model
methods. Mongoose handles query building, type casting, validation and middleware, which keeps
database code readable and consistent.

### MongoDB and Mongoose vocabulary
| MongoDB | Mongoose |
|---------|----------|
| Database | Connection (`mongoose.connect`) |
| Collection | Model (`mongoose.model("Student", schema)`) |
| Document | Model instance |
| Field | Schema path with a type and optional validators |
| `_id` | Automatically added `ObjectId` primary key |
| Index | `unique: true` or `index: true` in the schema |

### How the collections are created
A collection is not created explicitly. Compiling a model with `mongoose.model` registers it,
and MongoDB creates the actual collection the first time a document is written. Calling
`Model.init()` at start-up forces Mongoose to create the collection and build its indexes up
front, so unique constraints are active before the first request.

- `Course` -> `courses` (Mongoose pluralises and lowercases the model name)
- `Student` -> `students`

The `unique: true` option on `email` and `code` is **not** a validator. It creates a unique
index in MongoDB. A duplicate insert therefore raises a duplicate-key error (`code 11000`),
which the error handler converts into an HTTP `409` response.

### Relationship between the collections
`Student.course` stores the `_id` of a `Course` document. This is a reference (normalisation),
not an embedded document. `populate("course")` performs the join at read time and replaces the
id with the course document:
```js
const students = await Student.find().populate("course", "code name credits");
```
Referential integrity is enforced in the controller: a student can only reference a course that
exists, and a course with students cannot be deleted.

### How each operation maps to Mongoose
| CRUD | Mongoose call | MongoDB operation |
|------|---------------|-------------------|
| Create | `Student.create(data)` | `insertOne` |
| Read all | `Student.find(filter).populate(...)` | `find` |
| Read one | `Student.findById(id)` | `findOne({ _id })` |
| Update | `student.save()` after assigning fields | `updateOne` |
| Delete | `Student.findByIdAndDelete(id)` | `findOneAndDelete` |
| Counts | `Student.aggregate([...])` | aggregation pipeline |
| Metadata | `db.listCollections()` / `collection.indexes()` | `listCollections` / `listIndexes` |

### Request flow
```
Browser / curl
   -> Express route (/api/students)
      -> Controller (id checks, course existence, Mongoose call)
         -> Mongoose model
            -> MongoDB driver
               -> MongoDB collections (courses, students)
```

## Conclusion
Mongoose turns MongoDB collections into typed models. Defining a schema creates the collection
and its indexes through `Model.init()`, validators reject bad documents before they reach the
database, and `ObjectId` references with `populate()` model relationships between collections.
Controllers remain focused on request handling, while the error handler translates Mongoose
validation, cast and duplicate-key errors into meaningful HTTP status codes.
