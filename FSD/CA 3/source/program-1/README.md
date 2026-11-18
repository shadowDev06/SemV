# ExpenseTracker

A responsive expense dashboard for a Full Stack Development practical. It uses **HTML5, CSS3, vanilla JavaScript, Fetch API, async/await, and json-server**—no frameworks.

## Features

- View six seeded expenses with total, paid, pending, and transaction-count summary cards
- Add expenses with `POST` and update them with `PATCH`
- Delete expenses with `DELETE` after a confirmation
- Search by title, description, or category
- Filter by Paid/Pending status and sort by date, amount, or title
- Validate form input and display field-specific errors
- Loading, empty, connection-error, and success states
- Responsive table-to-card layout for smaller screens
- Live JSON request/response activity panel
- Keyboard shortcut: press `/` to focus the search box

## Requirements

- [Node.js](https://nodejs.org/) 18 or newer (the smoke test uses the built-in Fetch API)
- npm (included with Node.js)

## Run the project

Open a terminal in this folder:

```powershell
cd "C:\Mohd Ali\Ves\semV\FSD\CA 3\source\program-1"
npm install
```

Then use **two terminals** in this same folder.

**Terminal 1 — start the API:**

```powershell
npm run server
```

This serves `db.json` at `http://localhost:3000/expenses` and saves API changes back to that file.

**Terminal 2 — serve the web page:**

```powershell
npm run client
```

Open **http://localhost:5500** in a browser. Add, edit, and delete records while watching the API activity panel. Stop either server with `Ctrl+C` when finished.

## API used by the app

| Operation | Method and URL |
| --- | --- |
| Read all expenses | `GET /expenses` |
| Create an expense | `POST /expenses` |
| Update an expense | `PATCH /expenses/:id` |
| Delete an expense | `DELETE /expenses/:id` |

Each record contains `id`, `title`, `description`, `amount`, `category`, `date`, and `status` (`Paid` or `Pending`). Amounts are displayed in USD.

## Run the CRUD smoke test

The app servers do **not** need to be running for this test:

```powershell
npm test
```

The test starts json-server on an available temporary port, verifies GET, POST, PATCH, and DELETE against a copy of the database, then stops the server and deletes the copy. The original six records in `db.json` remain unchanged.

## Project files

- `index.html` — semantic dashboard, filters, states, and dialogs
- `styles.css` — responsive styling and component states
- `app.js` — DOM rendering, events, validation, and Fetch CRUD
- `db.json` — six realistic starter expenses
- `package.json` — run scripts and development dependencies
- `smoke-test.js` — isolated automated CRUD verification

## Troubleshooting

- **API offline / cannot connect:** make sure `npm run server` is still running on port 3000, then select **Try again**.
- **Port already in use:** stop the process using that port, or close the duplicate json-server/http-server terminal before running the command again.
- **Changes disappeared:** normal app changes intentionally write to `db.json`; use `npm test` if you want an isolated test that does not change the seed data.
