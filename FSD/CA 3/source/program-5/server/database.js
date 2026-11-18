import mongoose from 'mongoose';
import Expense from './models/Expense.js';

let memoryServer;

const sampleExpenses = [
  { title: 'Weekly groceries', amount: 64.20, category: 'Food', date: '2026-11-15', status: 'paid', note: 'Fresh market and supermarket' },
  { title: 'React course', amount: 39.99, category: 'Education', date: '2026-11-13', status: 'paid', note: 'Online learning subscription' },
  { title: 'Metro card', amount: 24.00, category: 'Transport', date: '2026-11-12', status: 'paid', note: 'Monthly travel top-up' },
  { title: 'Internet bill', amount: 45.50, category: 'Bills', date: '2026-11-10', status: 'pending', note: 'November fibre plan' },
  { title: 'Weekend movie', amount: 18.75, category: 'Entertainment', date: '2026-11-08', status: 'paid', note: 'Two tickets with friends' },
  { title: 'Study desk lamp', amount: 32.40, category: 'Shopping', date: '2026-11-05', status: 'pending', note: 'LED lamp for study space' }
];

export async function connectDatabase() {
  let uri = process.env.MONGO_URI;
  if (process.env.USE_MEMORY_DB === 'true') {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri('ledgerly');
    console.log('Using temporary in-memory MongoDB for local demonstration');
  }
  if (!uri) throw new Error('MONGO_URI is required');
  await mongoose.connect(uri);
  console.log(`MongoDB connected: ${mongoose.connection.name}`);
  if (process.env.SEED_DEMO === 'true' && await Expense.countDocuments() === 0) {
    await Expense.insertMany(sampleExpenses);
    console.log(`Seeded ${sampleExpenses.length} demonstration expenses`);
  }
}

export async function closeDatabase() {
  await mongoose.disconnect();
  if (memoryServer) await memoryServer.stop();
}
