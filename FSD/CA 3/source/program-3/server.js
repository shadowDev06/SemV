'use strict';

const http = require('node:http');
const { ExpenseStore } = require('./expenseStore');
const { validateExpense } = require('./validation');

const MAX_BODY_BYTES = 64 * 1024;

class HttpError extends Error {
  constructor(statusCode, code, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

function sendJson(response, statusCode, payload, headers = {}) {
  const body = JSON.stringify(payload);
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
    ...headers
  });
  response.end(body);
}

function sendError(response, error) {
  const statusCode = error.statusCode || 500;
  const payload = {
    error: {
      code: error.code || 'INTERNAL_ERROR',
      message: statusCode === 500 ? 'An unexpected server error occurred.' : error.message
    }
  };

  if (error.details) {
    payload.error.details = error.details;
  }
  sendJson(response, statusCode, payload);
}

async function readJsonBody(request) {
  const contentType = request.headers['content-type'] || '';
  if (!/^application\/json(?:\s*;|$)/i.test(contentType)) {
    throw new HttpError(415, 'UNSUPPORTED_MEDIA_TYPE', 'Use Content-Type: application/json.');
  }

  const chunks = [];
  let size = 0;
  let tooLarge = false;

  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) {
      tooLarge = true;
    } else {
      chunks.push(chunk);
    }
  }

  if (tooLarge) {
    throw new HttpError(413, 'PAYLOAD_TOO_LARGE', 'JSON body must not exceed 64 KiB.');
  }
  if (size === 0) {
    throw new HttpError(400, 'EMPTY_BODY', 'A JSON request body is required.');
  }

  let payload;
  try {
    payload = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new HttpError(400, 'MALFORMED_JSON', 'Request body contains invalid JSON.');
  }

  if (!payload || Array.isArray(payload) || typeof payload !== 'object') {
    throw new HttpError(400, 'INVALID_BODY', 'Request body must be a JSON object.');
  }
  return payload;
}

function validationError(errors) {
  return new HttpError(400, 'VALIDATION_ERROR', 'Request validation failed.', errors);
}

function methodNotAllowed(response, allowed) {
  sendJson(response, 405, {
    error: {
      code: 'METHOD_NOT_ALLOWED',
      message: `Allowed methods: ${allowed.join(', ')}.`
    }
  }, { Allow: allowed.join(', ') });
}

function notFound(message = 'The requested resource was not found.') {
  return new HttpError(404, 'NOT_FOUND', message);
}

async function handleRequest(request, response, store) {
  let pathname;
  try {
    pathname = new URL(request.url, 'http://localhost').pathname;
  } catch {
    throw new HttpError(400, 'INVALID_URL', 'The request URL is invalid.');
  }

  if (pathname.length > 1) {
    pathname = pathname.replace(/\/+$/, '');
  }

  if (pathname === '/api/health') {
    if (request.method !== 'GET') {
      methodNotAllowed(response, ['GET']);
      return;
    }
    sendJson(response, 200, {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
    return;
  }

  if (pathname === '/api/expenses') {
    if (request.method === 'GET') {
      const expenses = await store.list();
      sendJson(response, 200, { count: expenses.length, expenses });
      return;
    }

    if (request.method === 'POST') {
      const payload = await readJsonBody(request);
      const { errors, value } = validateExpense(payload);
      if (errors.length > 0) {
        throw validationError(errors);
      }

      const expense = await store.create(value);
      sendJson(response, 201, { expense }, {
        Location: `/api/expenses/${expense.id}`
      });
      return;
    }

    methodNotAllowed(response, ['GET', 'POST']);
    return;
  }

  const itemMatch = pathname.match(/^\/api\/expenses\/([^/]+)$/);
  if (itemMatch) {
    let id;
    try {
      id = decodeURIComponent(itemMatch[1]);
    } catch {
      throw new HttpError(400, 'INVALID_ID', 'The expense ID is not valid URL encoding.');
    }

    if (request.method === 'GET') {
      const expense = await store.get(id);
      if (!expense) {
        throw notFound(`Expense with ID ${id} was not found.`);
      }
      sendJson(response, 200, { expense });
      return;
    }

    if (request.method === 'PATCH') {
      const payload = await readJsonBody(request);
      const { errors, value } = validateExpense(payload, { partial: true });
      if (errors.length > 0) {
        throw validationError(errors);
      }

      const expense = await store.update(id, value);
      if (!expense) {
        throw notFound(`Expense with ID ${id} was not found.`);
      }
      sendJson(response, 200, { expense });
      return;
    }

    if (request.method === 'DELETE') {
      const expense = await store.delete(id);
      if (!expense) {
        throw notFound(`Expense with ID ${id} was not found.`);
      }
      response.writeHead(204, { 'Cache-Control': 'no-store' });
      response.end();
      return;
    }

    methodNotAllowed(response, ['GET', 'PATCH', 'DELETE']);
    return;
  }

  throw notFound();
}

async function createExpenseServer({ dataFile, logger } = {}) {
  const store = new ExpenseStore({ dataFile });
  await store.init();

  const eventLogger = logger === undefined
    ? (line) => console.log(line)
    : logger;

  if (eventLogger) {
    for (const event of ['create', 'update', 'delete']) {
      store.on(event, (expense) => {
        eventLogger(`[event] ${event} ${expense.id} ${JSON.stringify(expense.title)}`);
      });
    }
  }

  const server = http.createServer((request, response) => {
    handleRequest(request, response, store).catch((error) => {
      if (!error.statusCode) {
        console.error('[server error]', error);
      }
      if (response.headersSent) {
        response.end();
      } else {
        sendError(response, error);
      }
    });
  });

  return { server, store };
}

async function listen(server, port, host = '127.0.0.1') {
  await new Promise((resolve, reject) => {
    const onError = (error) => reject(error);
    server.once('error', onError);
    server.listen(port, host, () => {
      server.off('error', onError);
      resolve();
    });
  });
  return server.address();
}

async function main() {
  const port = Number(process.env.PORT || 3000);
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error('PORT must be an integer between 0 and 65535.');
  }
  const host = process.env.HOST || '127.0.0.1';
  const { server } = await createExpenseServer();
  const address = await listen(server, port, host);
  console.log(`Expense Tracker listening at http://${host}:${address.port}`);
  console.log(`Data file: ${new ExpenseStore().dataFile}`);

  const shutdown = (signal) => {
    console.log(`\n${signal} received; closing server...`);
    server.close(() => process.exit(0));
    if (typeof server.closeAllConnections === 'function') {
      server.closeAllConnections();
    }
  };
  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`Unable to start Expense Tracker: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = { HttpError, createExpenseServer, handleRequest, listen, readJsonBody };
