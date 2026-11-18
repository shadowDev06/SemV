require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('node:crypto');
const store = require('./store');
const {
  requestLogger,
  validateCredentials,
  validateExpense,
  authenticate,
  notFound,
  errorHandler
} = require('./middleware');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'local-development-secret-change-me';
const app = express();
app.use(express.json({ limit: '100kb' }));
app.use(requestLogger);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Expense Tracker Express API' });
});

app.post('/api/auth/register', validateCredentials, async (req, res, next) => {
  try {
    const email = req.body.email.trim().toLowerCase();
    const users = await store.read('users');
    if (users.some(user => user.email === email)) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }
    const passwordHash = await bcrypt.hash(req.body.password, 10);
    const user = { id: randomUUID(), email, passwordHash, createdAt: new Date().toISOString() };
    users.push(user);
    await store.write('users', users);
    res.status(201).json({ message: 'Registration successful', user: { id: user.id, email } });
  } catch (error) {
    next(error);
  }
});

app.post('/api/auth/login', validateCredentials, async (req, res, next) => {
  try {
    const email = req.body.email.trim().toLowerCase();
    const users = await store.read('users');
    const user = users.find(record => record.email === email);
    const valid = user && await bcrypt.compare(req.body.password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });
    const token = jwt.sign(
      { sub: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.TOKEN_EXPIRES_IN || '1h' }
    );
    res.json({ message: 'Login successful', token, user: { id: user.id, email: user.email } });
  } catch (error) {
    next(error);
  }
});

app.get('/api/protected', authenticate, (req, res) => {
  res.json({ message: 'Protected route accessed', user: req.user.email });
});

app.use('/api/expenses', authenticate);

app.get('/api/expenses', async (req, res, next) => {
  try {
    const expenses = await store.read('expenses');
    const records = expenses.filter(item => item.userId === req.user.sub);
    res.json({ count: records.length, expenses: records });
  } catch (error) {
    next(error);
  }
});

app.get('/api/expenses/:id', async (req, res, next) => {
  try {
    const expenses = await store.read('expenses');
    const expense = expenses.find(item => item.id === req.params.id && item.userId === req.user.sub);
    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    res.json(expense);
  } catch (error) {
    next(error);
  }
});

app.post('/api/expenses', validateExpense, async (req, res, next) => {
  try {
    const expenses = await store.read('expenses');
    const expense = {
      id: randomUUID(),
      userId: req.user.sub,
      title: req.body.title.trim(),
      amount: Number(req.body.amount),
      category: req.body.category.trim(),
      date: req.body.date,
      status: req.body.status,
      createdAt: new Date().toISOString()
    };
    expenses.push(expense);
    await store.write('expenses', expenses);
    res.status(201).json(expense);
  } catch (error) {
    next(error);
  }
});

app.put('/api/expenses/:id', validateExpense, async (req, res, next) => {
  try {
    const expenses = await store.read('expenses');
    const index = expenses.findIndex(item => item.id === req.params.id && item.userId === req.user.sub);
    if (index === -1) return res.status(404).json({ error: 'Expense not found' });
    expenses[index] = {
      ...expenses[index],
      title: req.body.title.trim(),
      amount: Number(req.body.amount),
      category: req.body.category.trim(),
      date: req.body.date,
      status: req.body.status,
      updatedAt: new Date().toISOString()
    };
    await store.write('expenses', expenses);
    res.json(expenses[index]);
  } catch (error) {
    next(error);
  }
});

app.delete('/api/expenses/:id', async (req, res, next) => {
  try {
    const expenses = await store.read('expenses');
    const index = expenses.findIndex(item => item.id === req.params.id && item.userId === req.user.sub);
    if (index === -1) return res.status(404).json({ error: 'Expense not found' });
    expenses.splice(index, 1);
    await store.write('expenses', expenses);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.use(notFound);
app.use(errorHandler);

if (require.main === module) {
  const port = Number(process.env.PORT) || 4000;
  app.listen(port, () => console.log(`Expense API listening on http://localhost:${port}`));
}

module.exports = app;
