import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowDownLeft, ArrowUpRight, BookOpen, Check, CheckCircle2, ChevronDown,
  CircleDollarSign, Clock3, Database, LayoutDashboard, Pencil, Plus, ReceiptText,
  Search, Settings, ShoppingBag, Trash2, Utensils, WalletCards, X, Bus, Film, Zap
} from 'lucide-react';
import { expenseApi } from './api.js';

const categories = ['Food', 'Transport', 'Education', 'Shopping', 'Bills', 'Health', 'Entertainment', 'Other'];
const categoryIcons = {
  Food: Utensils, Transport: Bus, Education: BookOpen, Shopping: ShoppingBag,
  Bills: Zap, Entertainment: Film, Health: Plus, Other: ReceiptText
};
const categoryColors = {
  Food: '#e9825f', Transport: '#668bc4', Education: '#776bb3', Shopping: '#cf7294',
  Bills: '#d5a244', Entertainment: '#5d9b8b', Health: '#c66565', Other: '#87928f'
};
const blankForm = {
  title: '', amount: '', category: 'Food',
  date: new Date().toISOString().slice(0, 10), status: 'pending', note: ''
};
const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

function SummaryCard({ label, value, detail, icon: Icon, tone }) {
  return (
    <article className={`summary-card ${tone}`}>
      <div className="summary-top"><span>{label}</span><span className="summary-icon"><Icon size={19} /></span></div>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function ExpenseForm({ initial, onSave, onClose, saving }) {
  const [form, setForm] = useState(initial || blankForm);
  const [errors, setErrors] = useState({});
  const isEditing = Boolean(initial?.id);

  function update(event) {
    const { name, value } = event.target;
    setForm(current => ({ ...current, [name]: value }));
    setErrors(current => ({ ...current, [name]: undefined, api: undefined }));
  }

  async function submit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!form.title.trim()) nextErrors.title = 'Enter an expense title';
    if (!Number.isFinite(Number(form.amount)) || Number(form.amount) <= 0) {
      nextErrors.amount = 'Enter an amount greater than zero';
    }
    if (!form.date) nextErrors.date = 'Choose a date';
    if (Object.keys(nextErrors).length) return setErrors(nextErrors);
    try {
      await onSave({ ...form, amount: Number(form.amount) });
    } catch (error) {
      setErrors({ ...error.fields, api: error.message });
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={event => event.target === event.currentTarget && onClose()}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="form-title">
        <div className="modal-header">
          <div><span className="eyebrow">{isEditing ? 'UPDATE RECORD' : 'NEW RECORD'}</span><h2 id="form-title">{isEditing ? 'Edit expense' : 'Add an expense'}</h2></div>
          <button className="icon-button" onClick={onClose} aria-label="Close form"><X size={20} /></button>
        </div>
        <form onSubmit={submit} noValidate>
          {errors.api && <div className="form-error">{errors.api}</div>}
          <label className="field full"><span>Expense title</span><input autoFocus name="title" value={form.title} onChange={update} placeholder="e.g. Weekly groceries" />{errors.title && <small>{errors.title}</small>}</label>
          <div className="form-grid">
            <label className="field"><span>Amount</span><div className="amount-input"><b>$</b><input name="amount" type="number" min="0.01" step="0.01" value={form.amount} onChange={update} placeholder="0.00" /></div>{errors.amount && <small>{errors.amount}</small>}</label>
            <label className="field"><span>Category</span><div className="select-wrap"><select name="category" value={form.category} onChange={update}>{categories.map(category => <option key={category}>{category}</option>)}</select><ChevronDown size={16} /></div></label>
            <label className="field"><span>Date</span><input name="date" type="date" value={form.date} onChange={update} />{errors.date && <small>{errors.date}</small>}</label>
            <label className="field"><span>Payment status</span><div className="select-wrap"><select name="status" value={form.status} onChange={update}><option value="paid">Paid</option><option value="pending">Pending</option></select><ChevronDown size={16} /></div></label>
          </div>
          <label className="field full"><span>Note <em>Optional</em></span><textarea name="note" rows="3" value={form.note} onChange={update} placeholder="Add a short description..." /></label>
          <div className="modal-actions"><button type="button" className="button secondary" onClick={onClose}>Cancel</button><button className="button primary" disabled={saving}>{saving ? 'Saving...' : <><Check size={17} />{isEditing ? 'Save changes' : 'Add expense'}</>}</button></div>
        </form>
      </section>
    </div>
  );
}

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formRecord, setFormRecord] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('newest');
  const [toast, setToast] = useState('');

  const loadExpenses = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await expenseApi.list();
      setExpenses(result.expenses);
    } catch (requestError) {
      setError(`Unable to load expenses. ${requestError.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadExpenses(); }, [loadExpenses]);
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(''), 2800);
    return () => clearTimeout(timer);
  }, [toast]);

  const totals = useMemo(() => expenses.reduce((result, expense) => {
    result.all += expense.amount;
    result[expense.status] += expense.amount;
    return result;
  }, { all: 0, paid: 0, pending: 0 }), [expenses]);

  const visibleExpenses = useMemo(() => {
    const query = search.trim().toLowerCase();
    return expenses.filter(expense => {
      const matchesSearch = !query || `${expense.title} ${expense.category} ${expense.note}`.toLowerCase().includes(query);
      return matchesSearch && (status === 'all' || expense.status === status);
    }).sort((a, b) => {
      if (sort === 'highest') return b.amount - a.amount;
      if (sort === 'lowest') return a.amount - b.amount;
      return new Date(b.date) - new Date(a.date);
    });
  }, [expenses, search, status, sort]);

  const categoryTotals = useMemo(() => {
    const values = expenses.reduce((result, expense) => {
      result[expense.category] = (result[expense.category] || 0) + expense.amount;
      return result;
    }, {});
    return Object.entries(values).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [expenses]);
  const highestCategory = categoryTotals[0]?.[1] || 1;

  function openAdd() {
    setFormRecord(null);
    setFormOpen(true);
  }

  function openEdit(expense) {
    setFormRecord({ ...expense, date: expense.date.slice(0, 10) });
    setFormOpen(true);
  }

  async function saveExpense(form) {
    setSaving(true);
    try {
      if (formRecord?.id) {
        const updated = await expenseApi.update(formRecord.id, form);
        setExpenses(current => current.map(item => item.id === updated.id ? updated : item));
        setToast('Expense updated successfully');
      } else {
        const created = await expenseApi.create(form);
        setExpenses(current => [created, ...current]);
        setToast('Expense added to MongoDB');
      }
      setFormOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function removeExpense(expense) {
    if (!window.confirm(`Delete "${expense.title}"?`)) return;
    try {
      await expenseApi.remove(expense.id);
      setExpenses(current => current.filter(item => item.id !== expense.id));
      setToast('Expense deleted');
    } catch (requestError) {
      setToast(requestError.message);
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark"><WalletCards size={25} /></span><span>ledgerly<span>.</span></span></div>
        <nav>
          <a className="active" href="#overview"><LayoutDashboard size={19} />Overview</a>
          <a href="#expenses"><ReceiptText size={19} />Expenses</a>
          <a href="#analytics"><CircleDollarSign size={19} />Analytics</a>
        </nav>
        <div className="sidebar-bottom">
          <div className="database-card"><span><Database size={18} /></span><div><strong>Database online</strong><small>MongoDB connected</small></div><i /></div>
          <a href="#settings"><Settings size={18} />Settings</a>
          <div className="profile"><span>NG</span><div><strong>Nihar Gudekar</strong><small>Student workspace</small></div></div>
        </div>
      </aside>

      <main id="overview">
        <header className="page-header"><div><p>Monday, 16 November</p><h1>Expense overview</h1><span>Track your spending and stay in control.</span></div><button className="button primary add-button" onClick={openAdd}><Plus size={18} />Add expense</button></header>
        {error && <div className="error-banner"><span>{error}</span><button onClick={loadExpenses}>Try again</button></div>}
        <section className="summary-grid">
          <SummaryCard label="Total expenses" value={currency.format(totals.all)} detail={`${expenses.length} recorded transactions`} icon={WalletCards} tone="dark" />
          <SummaryCard label="Paid expenses" value={currency.format(totals.paid)} detail="Completed payments" icon={CheckCircle2} tone="green" />
          <SummaryCard label="Pending amount" value={currency.format(totals.pending)} detail="Awaiting payment" icon={Clock3} tone="cream" />
        </section>

        <section className="content-grid">
          <div className="panel expenses-panel" id="expenses">
            <div className="panel-heading"><div><h2>Recent expenses</h2><p>All records from your MongoDB database</p></div><span className="record-count">{visibleExpenses.length} records</span></div>
            <div className="filters">
              <label className="search-box"><Search size={17} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search expenses..." /></label>
              <div className="select-wrap filter-select"><select value={status} onChange={event => setStatus(event.target.value)}><option value="all">All statuses</option><option value="paid">Paid</option><option value="pending">Pending</option></select><ChevronDown size={15} /></div>
              <div className="select-wrap filter-select"><select value={sort} onChange={event => setSort(event.target.value)}><option value="newest">Newest first</option><option value="highest">Highest amount</option><option value="lowest">Lowest amount</option></select><ChevronDown size={15} /></div>
            </div>
            <div className="table-wrap">
              <table><thead><tr><th>EXPENSE</th><th>CATEGORY</th><th>DATE</th><th>STATUS</th><th>AMOUNT</th><th><span className="sr-only">Actions</span></th></tr></thead>
                <tbody>
                  {loading ? <tr><td colSpan="6" className="table-message"><span className="spinner" />Loading expenses...</td></tr> : visibleExpenses.length === 0 ? <tr><td colSpan="6" className="table-message">No expenses match your filters.</td></tr> : visibleExpenses.map(expense => {
                    const Icon = categoryIcons[expense.category] || ReceiptText;
                    return <tr key={expense.id}>
                      <td><div className="expense-name"><span style={{ background: `${categoryColors[expense.category]}18`, color: categoryColors[expense.category] }}><Icon size={18} /></span><div><strong>{expense.title}</strong><small>{expense.note || 'Personal expense'}</small></div></div></td>
                      <td>{expense.category}</td>
                      <td>{new Date(`${expense.date.slice(0, 10)}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                      <td><span className={`status ${expense.status}`}><i />{expense.status}</span></td>
                      <td className="amount">{currency.format(expense.amount)}</td>
                      <td><div className="row-actions"><button onClick={() => openEdit(expense)} aria-label={`Edit ${expense.title}`}><Pencil size={15} /></button><button onClick={() => removeExpense(expense)} aria-label={`Delete ${expense.title}`}><Trash2 size={15} /></button></div></td>
                    </tr>;
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="panel analytics-panel" id="analytics">
            <div className="panel-heading"><div><h2>By category</h2><p>Spending distribution</p></div><span className="trend"><ArrowUpRight size={15} />Live</span></div>
            <div className="donut" style={{ background: categoryTotals.length ? `conic-gradient(${categoryTotals.map(([category, amount], index) => {
              const previous = categoryTotals.slice(0, index).reduce((sum, entry) => sum + entry[1], 0);
              const start = previous / totals.all * 360;
              const end = (previous + amount) / totals.all * 360;
              return `${categoryColors[category]} ${start}deg ${end}deg`;
            }).join(',')})` : '#e8eeeb' }}><div><span>Total spent</span><strong>{currency.format(totals.all)}</strong><small>This period</small></div></div>
            <div className="category-list">{categoryTotals.map(([category, amount]) => <div key={category}><div><span><i style={{ background: categoryColors[category] }} />{category}</span><strong>{currency.format(amount)}</strong></div><div className="progress"><i style={{ width: `${amount / highestCategory * 100}%`, background: categoryColors[category] }} /></div></div>)}</div>
            <div className="insight"><span><ArrowDownLeft size={18} /></span><p><strong>Smart tracking</strong><small>Add records to see live category insights.</small></p></div>
          </aside>
        </section>
        <footer><span>LEDGERLY • FULL STACK DEVELOPMENT</span><span>React + Express + Mongoose</span></footer>
      </main>
      {formOpen && <ExpenseForm initial={formRecord} onSave={saveExpense} onClose={() => setFormOpen(false)} saving={saving} />}
      {toast && <div className="toast"><CheckCircle2 size={18} />{toast}</div>}
    </div>
  );
}
