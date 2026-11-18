import 'dotenv/config';
import app from './app.js';
import { connectDatabase, closeDatabase } from './database.js';

const port = Number(process.env.PORT) || 5000;
let server;

try {
  await connectDatabase();
  server = app.listen(port, () => {
    console.log(`Ledgerly API listening on http://localhost:${port}`);
  });
} catch (error) {
  console.error(`Startup failed: ${error.message}`);
  process.exit(1);
}

async function shutdown() {
  if (server) await new Promise(resolve => server.close(resolve));
  await closeDatabase();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
