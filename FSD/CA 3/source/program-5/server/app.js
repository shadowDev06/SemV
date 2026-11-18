import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import Expense from './models/Expense.js';

const app = express();
const origins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',');

app.use(cors({
  origin(origin, callback) {
    if (!origin || origins.includes(origin)) return callback(null, true);
    callback(new Error('Origin is not allowed by CORS'));
  }
}));
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.get('/api/expenses', async (req, res) => {
  const expenses = await Expense.find().sort({ date: -1, createdAt: -1 });
  res.json({ count: expenses.length, expenses });
});

app.get('/api/expenses/:id', async (req, res) => {
  const expense = await Expense.findById(req.params.id);
  if (!expense) return res.status(404).json({ error: 'Expense not found' });
  res.json(expense);
});

app.post('/api/expenses', async (req, res) => {
  const expense = await Expense.create(req.body);
  res.status(201).json(expense);
});

app.put('/api/expenses/:id', async (req, res) => {
  const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!expense) return res.status(404).json({ error: 'Expense not found' });
  res.json(expense);
});

app.delete('/api/expenses/:id', async (req, res) => {
  const expense = await Expense.findByIdAndDelete(req.params.id);
  if (!expense) return res.status(404).json({ error: 'Expense not found' });
  res.status(204).end();
});

app.use((req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

app.use((error, req, res, next) => {
  console.error(error.message);
  if (res.headersSent) return next(error);
  if (error.name === 'ValidationError') {
    const fields = Object.fromEntries(
      Object.entries(error.errors).map(([field, detail]) => [field, detail.message])
    );
    return res.status(400).json({ error: 'Validation failed', fields });
  }
  if (error.name === 'CastError') {
    return res.status(400).json({ error: `Invalid ${error.path}` });
  }
  if (error.message === 'Origin is not allowed by CORS') {
    return res.status(403).json({ error: error.message });
  }
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
