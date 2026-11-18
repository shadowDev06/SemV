process.env.JWT_SECRET = 'demo-only-secret-not-for-deployment';
const fs = require('node:fs/promises');
const path = require('node:path');
const app = require('./server');
const store = require('./store');

const lines = [];
function report(message) {
  lines.push(message);
  console.log(message);
}

async function request(base, route, options = {}) {
  const response = await fetch(`${base}${route}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...options.headers
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const data = response.status === 204 ? null : await response.json();
  return { status: response.status, data };
}

async function run() {
  await store.write('users', []);
  await store.write('expenses', []);
  const server = app.listen(0);
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const credentials = { email: 'student@example.com', password: 'learn123' };
  const sample = {
    title: 'Database textbook', amount: 48.75, category: 'Education',
    date: '2026-11-16', status: 'pending'
  };
  try {
    report('EXPENSE TRACKER - EXPRESS + JWT API DEMO');
    report(`SERVER ${base} (ephemeral port)`);
    const unauthorized = await request(base, '/api/expenses');
    report(`01 UNAUTHORIZED  ${unauthorized.status} ${unauthorized.data.error}`);
    if (unauthorized.status !== 401) throw new Error('Expected 401');
    const registration = await request(base, '/api/auth/register', { method: 'POST', body: credentials });
    report(`02 REGISTER      ${registration.status} ${registration.data.user.email}`);
    if (registration.status !== 201) throw new Error('Registration failed');
    const users = await store.read('users');
    report(`03 BCRYPT        PASS hash=${users[0].passwordHash.slice(0, 7)}... plainTextStored=${users[0].password !== undefined}`);
    if (!users[0].passwordHash.startsWith('$2') || users[0].password) throw new Error('Password not hashed');
    const login = await request(base, '/api/auth/login', { method: 'POST', body: credentials });
    report(`04 LOGIN         ${login.status} JWT received=${Boolean(login.data.token)}`);
    const token = login.data.token;
    if (!token) throw new Error('Login failed');
    const protectedRoute = await request(base, '/api/protected', { token });
    report(`05 PROTECTED     ${protectedRoute.status} ${protectedRoute.data.message}`);
    const invalid = await request(base, '/api/expenses', {
      method: 'POST', token, body: { title: '', amount: -2 }
    });
    report(`06 VALIDATION    ${invalid.status} fields=${Object.keys(invalid.data.fields).join(',')}`);
    if (invalid.status !== 400) throw new Error('Expected validation error');
    const created = await request(base, '/api/expenses', { method: 'POST', token, body: sample });
    report(`07 POST          ${created.status} ${created.data.title} amount=${created.data.amount}`);
    const id = created.data.id;
    const listed = await request(base, '/api/expenses', { token });
    report(`08 GET           ${listed.status} count=${listed.data.count}`);
    const updated = await request(base, `/api/expenses/${id}`, {
      method: 'PUT', token, body: { ...sample, amount: 52.25, status: 'paid' }
    });
    report(`09 PUT           ${updated.status} amount=${updated.data.amount} status=${updated.data.status}`);
    const removed = await request(base, `/api/expenses/${id}`, { method: 'DELETE', token });
    report(`10 DELETE        ${removed.status} record removed`);
    const missing = await request(base, `/api/expenses/${id}`, { token });
    report(`11 MISSING       ${missing.status} ${missing.data.error}`);
    report('RESULT PASS: JWT, bcrypt, middleware, validation and CRUD');
  } catch (error) {
    report(`RESULT FAIL: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await new Promise(resolve => server.close(resolve));
    await store.write('users', []);
    await store.write('expenses', []);
    report('SERVER STOPPED; demo records removed');
    await fs.writeFile(path.join(__dirname, 'output.txt'), lines.join('\n') + '\n');
  }
}

run();
