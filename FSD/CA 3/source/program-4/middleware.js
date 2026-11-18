const jwt = require('jsonwebtoken');

function requestLogger(req, res, next) {
  const started = Date.now();
  res.on('finish', () => {
    console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - started}ms)`);
  });
  next();
}

function validateCredentials(req, res, next) {
  const { email, password } = req.body;
  const errors = {};
  if (!/^\S+@\S+\.\S+$/.test(email || '')) errors.email = 'Enter a valid email address';
  if (typeof password !== 'string' || password.length < 6) {
    errors.password = 'Password must contain at least 6 characters';
  }
  if (Object.keys(errors).length) {
    return res.status(400).json({ error: 'Validation failed', fields: errors });
  }
  next();
}

function validateExpense(req, res, next) {
  const { title, amount, category, date, status } = req.body;
  const errors = {};
  if (typeof title !== 'string' || !title.trim()) errors.title = 'Title is required';
  if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
    errors.amount = 'Amount must be greater than zero';
  }
  if (typeof category !== 'string' || !category.trim()) errors.category = 'Category is required';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '') || Number.isNaN(Date.parse(date))) {
    errors.date = 'Use a valid date in YYYY-MM-DD format';
  }
  if (!['paid', 'pending'].includes(status)) errors.status = 'Status must be paid or pending';
  if (Object.keys(errors).length) {
    return res.status(400).json({ error: 'Validation failed', fields: errors });
  }
  next();
}

function authenticate(req, res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Bearer token is required' });
  }
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token is invalid or expired' });
  }
}

function notFound(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

function errorHandler(error, req, res, next) {
  console.error(error.message);
  if (res.headersSent) return next(error);
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ error: 'Malformed JSON request body' });
  }
  res.status(500).json({ error: 'Internal server error' });
}

module.exports = {
  requestLogger,
  validateCredentials,
  validateExpense,
  authenticate,
  notFound,
  errorHandler
};
