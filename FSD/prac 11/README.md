# Practical 11: MongoDB collections with Mongoose

This project uses Mongoose to define and manage MongoDB collections for students and courses. A student references a course. The Express app exposes APIs for both collections and serves a page for managing the records.

## Run the database, server, and frontend

1. Start a local MongoDB instance or have your MongoDB connection URI ready.
2. Open a terminal in this practical folder, install dependencies, and create your configuration file:

   ```powershell
   Set-Location -LiteralPath 'NodeJS_Practical'
   npm ci
   if (-not (Test-Path -LiteralPath '.env')) {
       Copy-Item -LiteralPath '.env.example' -Destination '.env'
   }
   ```

3. Keep the default `MONGODB_URI` for a local instance on port 27017, or set it in `.env` to your MongoDB URI.
4. Run `npm start`. Mongoose initializes the models and collections. For optional sample data, run `npm run seed` against a practice database.
5. Open <http://localhost:3000>. Add a course before assigning a student to it. Open <http://localhost:3000/api/collections> to inspect both collections. Express serves the frontend on the same port.

See the [Mongoose project README](NodeJS_Practical/README.md) for the full API.
