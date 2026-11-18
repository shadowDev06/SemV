'use strict';

const STATUSES = Object.freeze(['pending', 'paid']);
const EDITABLE_FIELDS = Object.freeze(['title', 'amount', 'category', 'date', 'status']);

function isValidDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime())
    && parsed.toISOString().slice(0, 10) === value;
}

/**
 * Validate and normalize an expense payload. Unknown properties are ignored so
 * clients cannot overwrite IDs or timestamps.
 */
function validateExpense(payload, { partial = false } = {}) {
  const errors = [];
  const value = {};
  let suppliedFields = 0;

  for (const field of EDITABLE_FIELDS) {
    const present = Object.prototype.hasOwnProperty.call(payload, field);

    if (!present) {
      if (!partial) {
        errors.push({ field, message: `${field} is required.` });
      }
      continue;
    }

    suppliedFields += 1;
    const fieldValue = payload[field];

    switch (field) {
      case 'title':
        if (typeof fieldValue !== 'string' || fieldValue.trim().length === 0) {
          errors.push({ field, message: 'title must be a non-empty string.' });
        } else if (fieldValue.trim().length > 100) {
          errors.push({ field, message: 'title must contain at most 100 characters.' });
        } else {
          value.title = fieldValue.trim();
        }
        break;

      case 'amount':
        if (typeof fieldValue !== 'number' || !Number.isFinite(fieldValue) || fieldValue <= 0) {
          errors.push({ field, message: 'amount must be a finite number greater than zero.' });
        } else {
          value.amount = fieldValue;
        }
        break;

      case 'category':
        if (typeof fieldValue !== 'string' || fieldValue.trim().length === 0) {
          errors.push({ field, message: 'category must be a non-empty string.' });
        } else if (fieldValue.trim().length > 50) {
          errors.push({ field, message: 'category must contain at most 50 characters.' });
        } else {
          value.category = fieldValue.trim();
        }
        break;

      case 'date':
        if (!isValidDate(fieldValue)) {
          errors.push({ field, message: 'date must be a real calendar date in YYYY-MM-DD format.' });
        } else {
          value.date = fieldValue;
        }
        break;

      case 'status':
        if (typeof fieldValue !== 'string' || !STATUSES.includes(fieldValue)) {
          errors.push({ field, message: `status must be one of: ${STATUSES.join(', ')}.` });
        } else {
          value.status = fieldValue;
        }
        break;
    }
  }

  if (partial && suppliedFields === 0) {
    errors.push({
      field: 'body',
      message: `Provide at least one editable field: ${EDITABLE_FIELDS.join(', ')}.`
    });
  }

  return { errors, value };
}

module.exports = { EDITABLE_FIELDS, STATUSES, isValidDate, validateExpense };
