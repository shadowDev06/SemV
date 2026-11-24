# Practical 10: PostgreSQL CRUD with Sequelize

This project stores student records in PostgreSQL. The Express API uses Sequelize models to create, list, update, validate, and delete records. Express also serves a browser interface for trying those operations.

## Run the database, server, and frontend

1. Start PostgreSQL and create a database named `fsd_practical`. For a local PostgreSQL installation, connect using your PostgreSQL client and run `CREATE DATABASE fsd_practical;` once. The [project README](NodeJS_Practical/README.md#database-setup) includes a Docker option.
2. From this practical folder, install dependencies and create your configuration file:

   ```powershell
   Set-Location -LiteralPath 'NodeJS_Practical'
   npm ci
   if (-not (Test-Path -LiteralPath '.env')) {
       Copy-Item -LiteralPath '.env.example' -Destination '.env'
   }
   ```

3. In `.env`, set `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD` for your local database.
4. Run `npm start`. The server creates the students table on first startup. To load demo records into a practice database, run `npm run seed` from the same directory.
5. Open <http://localhost:3000> to add, view, edit, and delete a student. The JSON API is at <http://localhost:3000/api/students>. No second frontend process is needed.
