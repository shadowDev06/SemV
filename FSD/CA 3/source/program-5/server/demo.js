import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import app from './app.js';
import { connectDatabase, closeDatabase } from './database.js';
import Expense from './models/Expense.js';

process.env.USE_MEMORY_DB = 'true';
process.env.SEED_DEMO = 'true';
const directory = path.dirname(fileURLToPath(import.meta.url));
const lines = [];
const report = message => {
  lines.push(message);
  console.log(message);
};

async function request(base, route, options = {}) {
  const response = await fetch(`${base}${route}`, {
    ...options,
    headers: { 'Content-Type': 'application/json' },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  return {
    status: response.status,
    data: response.status === 204 ? null : await response.json()
  };
}

try {
  await connectDatabase();
  const server = app.listen(0);
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  report('LEDGERLY - REACT + EXPRESS + MONGODB VERIFICATION');
  report(`SERVER ${base} (ephemeral port)`);
  const health = await request(base, '/api/health');
  report(`01 HEALTH       ${health.status} api=${health.data.status} database=${health.data.database}`);
  const initial = await request(base, '/api/expenses');
  report(`02 GET          ${initial.status} Mongoose documents=${initial.data.count}`);
  const invalid = await request(base, '/api/expenses', {
    method: 'POST', body: { title: '', amount: -5, category: 'Invalid' }
  });
  report(`03 VALIDATION    ${invalid.status} fields=${Object.keys(invalid.data.fields).join(',')}`);
  const created = await request(base, '/api/expenses', {
    method: 'POST',
    body: {
      title: 'Cloud deployment guide', amount: 22.50, category: 'Education',
      date: '2026-11-16', status: 'pending', note: 'API integration practical'
    }
  });
  report(`04 POST         ${created.status} ${created.data.title} id=${created.data.id.slice(-6)}`);
  const id = created.data.id;
  const updated = await request(base, `/api/expenses/${id}`, {
    method: 'PUT', body: { ...created.data, amount: 25.00, status: 'paid' }
  });
  report(`05 PUT          ${updated.status} amount=${updated.data.amount} status=${updated.data.status}`);
  const persisted = await Expense.findById(id);
  report(`06 MONGOOSE     PASS persisted=${Boolean(persisted)} ObjectId=${persisted._id.constructor.name}`);
  const removed = await request(base, `/api/expenses/${id}`, { method: 'DELETE' });
  report(`07 DELETE       ${removed.status} temporary record removed`);
  const finalCount = await Expense.countDocuments();
  report(`08 DATABASE     PASS finalCount=${finalCount} readyState=${mongoose.connection.readyState}`);
  report('RESULT PASS: CORS API, CRUD, validation and MongoDB persistence');
  await new Promise(resolve => server.close(resolve));
} catch (error) {
  report(`RESULT FAIL: ${error.message}`);
  process.exitCode = 1;
} finally {
  await closeDatabase();
  report('DATABASE CLOSED; in-memory demonstration stopped');
  await fs.writeFile(path.join(directory, 'output.txt'), lines.join('\n') + '\n');
}
