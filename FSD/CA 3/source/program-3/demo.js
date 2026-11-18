'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { once } = require('node:events');
const { createExpenseServer } = require('./server');
const { ExpenseStore } = require('./expenseStore');

const demoDataFile = path.join(__dirname, 'data', '.demo-expenses.json');
const outputFile = path.join(__dirname, 'output.txt');
const lines = [];

function log(line) {
  lines.push(line);
  console.log(line);
}

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

async function runDemo() {
  let server;
  let succeeded = false;
  await fs.rm(demoDataFile, { force: true });

  try {
    const app = await createExpenseServer({ dataFile: demoDataFile, logger: null });
    server = app.server;

    for (const event of ['create', 'update', 'delete']) {
      app.store.on(event, (expense) => {
        log(`EVENT ${event}: ${expense.title} [${expense.id.slice(0, 8)}]`);
      });
    }

    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const baseUrl = `http://127.0.0.1:${server.address().port}`;

    log('EXPENSE TRACKER - LIVE HTTP CRUD DEMO');
    log(`SERVER ${baseUrl} (ephemeral port)`);

    async function request(method, route, body) {
      const response = await fetch(`${baseUrl}${route}`, {
        method,
        headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body)
      });
      const text = await response.text();
      return { status: response.status, body: text ? JSON.parse(text) : null };
    }

    const health = await request('GET', '/api/health');
    assert.equal(health.status, 200);
    assert.equal(health.body.status, 'ok');
    log('01 HEALTH   200 status=ok');

    const created = await request('POST', '/api/expenses', {
      title: 'Groceries', amount: 42.5, category: 'food',
      date: '2026-01-10', status: 'pending'
    });
    assert.equal(created.status, 201);
    const id = created.body.expense.id;
    log(`02 CREATE   201 Groceries amount=42.5 id=${id.slice(0, 8)}`);

    const second = await request('POST', '/api/expenses', {
      title: 'Metro pass', amount: 25, category: 'transport',
      date: '2026-01-11', status: 'paid'
    });
    assert.equal(second.status, 201);
    const secondId = second.body.expense.id;
    log(`03 CREATE   201 Metro pass amount=25 id=${secondId.slice(0, 8)}`);

    const list = await request('GET', '/api/expenses');
    assert.equal(list.status, 200);
    assert.equal(list.body.count, 2);
    log('04 LIST     200 count=2');

    const single = await request('GET', `/api/expenses/${id}`);
    assert.equal(single.status, 200);
    assert.equal(single.body.expense.title, 'Groceries');
    log('05 GET ONE  200 title=Groceries');

    const updated = await request('PATCH', `/api/expenses/${id}`, {
      amount: 45, status: 'paid'
    });
    assert.equal(updated.status, 200);
    assert.equal(updated.body.expense.amount, 45);
    assert.equal(updated.body.expense.status, 'paid');
    log('06 UPDATE   200 Groceries amount=45 status=paid');

    const invalid = await request('POST', '/api/expenses', {
      title: '', amount: -5, category: '', date: '2026-02-30', status: 'unknown'
    });
    assert.equal(invalid.status, 400);
    assert.equal(invalid.body.error.details.length, 5);
    const fields = invalid.body.error.details.map((detail) => detail.field).join(',');
    log(`07 INVALID  400 code=VALIDATION_ERROR fields=${fields}`);

    const removed = await request('DELETE', `/api/expenses/${secondId}`);
    assert.equal(removed.status, 204);
    log(`08 DELETE   204 Metro pass id=${secondId.slice(0, 8)}`);

    const finalList = await request('GET', '/api/expenses');
    assert.equal(finalList.status, 200);
    assert.equal(finalList.body.count, 1);
    log('09 LIST     200 count=1');

    const missing = await request('GET', `/api/expenses/${secondId}`);
    assert.equal(missing.status, 404);
    log('10 MISSING  404 code=NOT_FOUND');

    // A separate store instance proves that the last state was read from disk.
    const reloaded = new ExpenseStore({ dataFile: demoDataFile });
    await reloaded.init();
    const persisted = await reloaded.list();
    assert.equal(persisted.length, 1);
    assert.equal(persisted[0].amount, 45);
    const diskData = JSON.parse(await fs.readFile(demoDataFile, 'utf8'));
    assert.equal(diskData.length, 1);
    log('11 PERSIST  OK JSON reload count=1 amount=45');

    succeeded = true;
    log('RESULT PASS: health, CRUD, validation, errors, and persistence');
  } catch (error) {
    process.exitCode = 1;
    log(`RESULT FAIL: ${error.message}`);
  } finally {
    await closeServer(server);
    await fs.rm(demoDataFile, { force: true });
    log('SERVER STOPPED; temporary demo data removed');
    log(`SEED UNCHANGED: data/expenses.json${succeeded ? '' : ' (demo failed)'}`);
    await fs.writeFile(outputFile, `${lines.join('\n')}\n`, 'utf8');
  }
}

runDemo().catch(async (error) => {
  console.error(`Demo cleanup failed: ${error.message}`);
  process.exitCode = 1;
});
