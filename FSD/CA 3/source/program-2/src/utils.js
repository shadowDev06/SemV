export const CATEGORIES = [
  { name: 'Food & Dining', color: '#f59e72', icon: 'food' },
  { name: 'Transport', color: '#65a9f8', icon: 'transport' },
  { name: 'Shopping', color: '#9b8afb', icon: 'shopping' },
  { name: 'Bills & Utilities', color: '#f2c14e', icon: 'bills' },
  { name: 'Entertainment', color: '#ed7fa9', icon: 'entertainment' },
  { name: 'Health', color: '#55c5a5', icon: 'health' },
  { name: 'Other', color: '#94a3b8', icon: 'other' },
];

export const STORAGE_KEY = 'spendly.expenses.v1';

export const money = (value) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
}).format(Number(value) || 0);

export const today = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export const formatDate = (value, options = {}) => {
  if (!value) return 'Not set';
  return new Date(`${value}T12:00:00`).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', ...options,
  });
};

const daysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export function getInitialExpenses() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // A fresh sample set is used if stored data is unavailable or malformed.
  }

  return [
    { id: 'sample-1', title: 'Weekly groceries', amount: 86.4, category: 'Food & Dining', date: daysAgo(1), notes: 'Fresh produce and pantry staples' },
    { id: 'sample-2', title: 'Morning coffee', amount: 5.8, category: 'Food & Dining', date: daysAgo(0), notes: '' },
    { id: 'sample-3', title: 'Metro card top-up', amount: 24, category: 'Transport', date: daysAgo(3), notes: 'Weekly commute' },
    { id: 'sample-4', title: 'Electricity bill', amount: 74.2, category: 'Bills & Utilities', date: daysAgo(5), notes: 'Monthly utilities' },
    { id: 'sample-5', title: 'Movie night', amount: 32, category: 'Entertainment', date: daysAgo(7), notes: 'Tickets with friends' },
    { id: 'sample-6', title: 'Running shoes', amount: 89.99, category: 'Shopping', date: daysAgo(10), notes: '' },
    { id: 'sample-7', title: 'Pharmacy', amount: 18.5, category: 'Health', date: daysAgo(13), notes: '' },
    { id: 'sample-8', title: 'Team lunch', amount: 28.6, category: 'Food & Dining', date: daysAgo(16), notes: 'Lunch with the design team' },
  ];
}

export const categoryDetails = (name) => CATEGORIES.find((item) => item.name === name) || CATEGORIES.at(-1);
export const isCurrentMonth = (value) => value?.slice(0, 7) === today().slice(0, 7);
export const makeId = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
