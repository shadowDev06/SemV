# Practical 9: Express.js web application

The Express server renders HTML pages, serves a stylesheet, and exposes student data as JSON. The app shows how routes, request parsing, and HTTP status codes work. It keeps student records in memory during the session.

## Run the server and open the frontend

1. Install Node.js with npm and open a terminal in this practical folder.
2. Install dependencies and start Express:

   ```powershell
   Set-Location -LiteralPath 'NodeJS_Practical'
   npm ci
   npm start
   ```

3. Open <http://localhost:3000/students> and add a student. Visit <http://localhost:3000/api/students> to see the same data as JSON. Express serves the frontend from the same process.
4. Stop the server with Ctrl+C. In-memory changes are reset when you restart it.

See the [Express project README](NodeJS_Practical/README.md) for the complete route list.
