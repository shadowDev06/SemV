import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Check, FileText, Lightbulb, ReceiptText, Save, Tag } from 'lucide-react';
import { CATEGORIES, categoryDetails, formatDate, money, today } from '../utils';
import CategoryIcon from './CategoryIcon';

const blankForm = { title: '', amount: '', category: '', date: today(), notes: '' };

function FieldError({ id, message }) {
  return message ? <span className="field-error" id={id} role="alert">{message}</span> : null;
}

export default function ExpenseForm({ initialValues, onSave }) {
  const [form, setForm] = useState(() => initialValues ? {
    title: initialValues.title,
    amount: String(initialValues.amount),
    category: initialValues.category,
    date: initialValues.date,
    notes: initialValues.notes || '',
  } : blankForm);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const editing = Boolean(initialValues);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    if (errors[name]) setErrors((current) => ({ ...current, [name]: '' }));
  };

  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = 'Please enter an expense name.';
    else if (form.title.trim().length < 2) next.title = 'Expense name must be at least 2 characters.';
    else if (form.title.trim().length > 80) next.title = 'Expense name cannot exceed 80 characters.';
    if (!form.amount) next.amount = 'Please enter the amount spent.';
    else if (!Number.isFinite(Number(form.amount)) || Number(form.amount) <= 0) next.amount = 'Amount must be a number greater than zero.';
    else if (Number(form.amount) > 1000000) next.amount = 'Amount cannot exceed $1,000,000.';
    if (!form.category) next.category = 'Please choose a category.';
    else if (!CATEGORIES.some((item) => item.name === form.category)) next.category = 'Please choose a valid category.';
    if (!form.date) next.date = 'Please select the expense date.';
    else if (Number.isNaN(new Date(`${form.date}T12:00:00`).getTime())) next.date = 'Please enter a valid date.';
    else if (form.date > today()) next.date = 'Expense date cannot be in the future.';
    if (form.notes.length > 200) next.notes = 'Notes cannot exceed 200 characters.';
    return next;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const validation = validate();
    if (Object.keys(validation).length) {
      setErrors(validation);
      setTimeout(() => document.getElementById(Object.keys(validation)[0])?.focus(), 0);
      return;
    }
    onSave({
      title: form.title.trim(),
      amount: Number(Number(form.amount).toFixed(2)),
      category: form.category,
      date: form.date,
      notes: form.notes.trim(),
    });
  };

  return (
    <div className="form-layout">
      <form className="card expense-form" onSubmit={handleSubmit} noValidate>
        <div className="form-card-heading"><div><h2>Expense details</h2><p>Fill in the information below</p></div><span>All fields marked * are required</span></div>
        <div className="form-field full-field">
          <label htmlFor="title">Expense name <span>*</span></label>
          <input id="title" name="title" value={form.title} onChange={updateField} placeholder="e.g. Lunch at a café" className={errors.title ? 'invalid' : ''} aria-invalid={Boolean(errors.title)} aria-describedby="title-error" maxLength={80} autoFocus />
          <FieldError id="title-error" message={errors.title} />
        </div>
        <div className="form-row">
          <div className="form-field">
            <label htmlFor="amount">Amount <span>*</span></label>
            <div className={`amount-input ${errors.amount ? 'invalid' : ''}`}><span>$</span><input id="amount" name="amount" type="number" min="0" max="1000000" step="0.01" inputMode="decimal" value={form.amount} onChange={updateField} placeholder="0.00" aria-invalid={Boolean(errors.amount)} aria-describedby="amount-error" /></div>
            <FieldError id="amount-error" message={errors.amount} />
          </div>
          <div className="form-field">
            <label htmlFor="date">Date <span>*</span></label>
            <input id="date" name="date" type="date" max={today()} value={form.date} onChange={updateField} className={errors.date ? 'invalid' : ''} aria-invalid={Boolean(errors.date)} aria-describedby="date-error" />
            <FieldError id="date-error" message={errors.date} />
          </div>
        </div>
        <div className="form-field full-field">
          <label htmlFor="category">Category <span>*</span></label>
          <select id="category" name="category" value={form.category} onChange={updateField} className={errors.category ? 'invalid' : ''} aria-invalid={Boolean(errors.category)} aria-describedby="category-error">
            <option value="">Select a category</option>
            {CATEGORIES.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}
          </select>
          <FieldError id="category-error" message={errors.category} />
        </div>
        <div className="form-field full-field">
          <div className="label-row"><label htmlFor="notes">Notes <span className="optional">Optional</span></label><small>{form.notes.length}/200</small></div>
          <textarea id="notes" name="notes" value={form.notes} onChange={updateField} placeholder="Add a note to remember this expense..." rows="4" maxLength={200} className={errors.notes ? 'invalid' : ''} aria-describedby="notes-error" />
          <FieldError id="notes-error" message={errors.notes} />
        </div>
        <div className="form-actions">
          <button type="button" className="button button-secondary" onClick={() => navigate('/')}>Cancel</button>
          <button type="submit" className="button button-primary">{editing ? <Save size={18} /> : <Check size={18} />}{editing ? 'Save changes' : 'Add expense'}</button>
        </div>
      </form>

      <aside className="form-aside">
        <div className="preview-label"><ReceiptText size={16} /> LIVE PREVIEW</div>
        <div className="receipt-preview">
          <div className="receipt-top"><span>SPENDLY RECEIPT</span><span>{editing ? 'EDIT' : 'NEW'}</span></div>
          <CategoryIcon category={form.category} size={25} className="preview-category-icon" />
          <p className="preview-category">{form.category || 'Uncategorized'}</p>
          <h3>{form.title.trim() || 'Your expense name'}</h3>
          <div className="preview-amount">{money(form.amount)}</div>
          <div className="receipt-divider" />
          <div className="preview-detail"><CalendarDays size={17} /><span>{form.date ? formatDate(form.date) : 'Choose a date'}</span></div>
          <div className="preview-detail"><Tag size={17} /><span>{form.category || 'Choose a category'}</span></div>
          {form.notes && <div className="preview-note"><FileText size={16} /><p>{form.notes}</p></div>}
          <div className="receipt-footer" style={{ background: categoryDetails(form.category).color }} />
        </div>
        <div className="form-tip"><Lightbulb size={21} /><div><strong>A helpful habit</strong><p>Adding notes makes it easier to understand your spending patterns later.</p></div></div>
      </aside>
    </div>
  );
}
