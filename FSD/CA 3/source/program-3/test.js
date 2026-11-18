'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { createExpenseServer, listen } = require('./server');

async function closeServer(server) {
  if (!server || !server.listening) {
    return;
  }
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
    if (typeof server.closeAllConnections === 'function') {
      server.closeAllConnections();
    }
  });
}

test('HTTP API validates input, performs CRUD, and persists across restart', async (t) => {
  const dataFile = path.join(__dirname, 'data', `.test-${process.pid}-${randomUUID()}.json`);
  let server;
  let baseUrl;

  t.after(async () => {
    await closeServer(server);
    await fs.rm(dataFile, { force: true });
  });

  async function request(method, route, body, raw = false) {
    const response = await fetch(`${baseUrl}${route}`, {
      method,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : (raw ? body : JSON.stringify(body))
    });
    const text = await response.text();
    return { status: response.status, body: text ? JSON.parse(text) : null };
  }

  const app = await createExpenseServer({ dataFile, logger: null });
  server = app.server;
  await listen(server, 0);
  baseUrl = `http://127.0.0.1:${server.address().port}`;

  const health = await request('GET', '/api/health');
  assert.equal(health.status, 200);
  assert.equal(health.body.status, 'ok');

  const invalid = await request('POST', '/api/expenses', {
    title: '', amount: -1, category: '', date: '2025-02-29', status: 'bad'
  });
  assert.equal(invalid.status, 400);
  assert.equal(invalid.body.error.code, 'VALIDATION_ERROR');
  assert.deepEqual(
    invalid.body.error.details.map((detail) => detail.field),
    ['title', 'amount', 'category', 'date', 'status']
  );

  const created = await request('POST', '/api/expenses', {
    title: '  Lunch  ', amount: 12.75, category: ' food ',
    date: '2026-03-01', status: 'pending'
  });
  assert.equal(created.status, 201);
  assert.match(created.body.expense.id, /^[0-9a-f-]{36}$/);
  assert.equal(created.body.expense.title, 'Lunch');
  assert.equal(created.body.expense.category, 'food');
  const id = created.body.expense.id;

  const list = await request('GET', '/api/expenses');
  assert.equal(list.status, 200);
  assert.equal(list.body.count, 1);

  const single = await request('GET', `/api/expenses/${id}`);
  assert.equal(single.status, 200);
  assert.equal(single.body.expense.amount, 12.75);

  const badPatch = await request('PATCH', `/api/expenses/${id}`, { amount: 0 });
  assert.equal(badPatch.status, 400);
  assert.equal(badPatch.body.error.details[0].field, 'amount');

  const updated = await request('PATCH', `/api/expenses/${id}`, { status: 'paid' });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.expense.status, 'paid');
  assert.equal(updated.body.expense.title, 'Lunch');

  const second = await request('POST', '/api/expenses', {
    title: 'Book', amount: 20, category: 'education',
    date: '2026-03-02', status: 'paid'
  });
  assert.equal(second.status, 201);
  const secondId = second.body.expense.id;

  const deleted = await request('DELETE', `/api/expenses/${secondId}`);
  assert.equal(deleted.status, 204);
  assert.equal(deleted.body, null);

  const missing = await request('GET', `/api/expenses/${secondId}`);
  assert.equal(missing.status, 404);
  assert.equal(missing.body.error.code, 'NOT_FOUND');

  const malformed = await request('POST', '/api/expenses', '{bad json', true);
  assert.equal(malformed.status, 400);
  assert.equal(malformed.body.error.code, 'MALFORMED_JSON');

  const wrongMethod = await request('PUT', `/api/expenses/${id}`, { status: 'paid' });
  assert.equal(wrongMethod.status, 405);
  assert.equal(wrongMethod.body.error.code, 'METHOD_NOT_ALLOWED');

  const unknownRoute = await request('GET', '/api/unknown');
  assert.equal(unknownRoute.status, 404);

  await closeServer(server);
  server = null;

  // Reopen the same file through a fresh server, not the old in-memory store.
  const restarted = await createExpenseServer({ dataFile, logger: null });
  server = restarted.server;
  await listen(server, 0);
  baseUrl = `http://127.0.0.1:${server.address().port}`;
  const persisted = await request('GET', '/api/expenses');
  assert.equal(persisted.status, 200);
  assert.equal(persisted.body.count, 1);
  assert.equal(persisted.body.expenses[0].id, id);
  assert.equal(persisted.body.expenses[0].status, 'paid');

  const diskData = JSON.parse(await fs.readFile(dataFile, 'utf8'));
  assert.equal(diskData.length, 1);
  assert.equal(diskData[0].title, 'Lunch');
});
