import { useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Plus, SearchX, X } from 'lucide-react';
import Layout from './components/Layout';
import SummaryCards from './components/SummaryCards';
import { CategoryBreakdown, MonthlyInsight } from './components/Insights';
import ExpenseList from './components/ExpenseList';
import ExpenseForm from './components/ExpenseForm';
import { getInitialExpenses, makeId, STORAGE_KEY } from './utils';

function Dashboard({ expenses, onDelete }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  return (
    <>
      <div className="page-heading dashboard-heading">
        <div><p className="eyebrow">YOUR MONEY, MADE CLEAR</p><h1>{greeting}, Alex <span>👋</span></h1><p>Here’s what’s happening with your money today.</p></div>
        <Link to="/add" className="button button-primary add-expense-button"><Plus size={19} /> Add expense</Link>
      </div>
      <SummaryCards expenses={expenses} />
      <div className="insights-grid"><CategoryBreakdown expenses={expenses} /><MonthlyInsight expenses={expenses} /></div>
      <ExpenseList expenses={expenses} onDelete={onDelete} />
    </>
  );
}

function ExpensePage({ expenses, onAdd, onUpdate, notify }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const expense = id ? expenses.find((item) => item.id === id) : null;
  const editing = Boolean(id);

  if (editing && !expense) {
    return (
      <div className="card not-found"><span><SearchX size={30} /></span><h1>Expense not found</h1><p>This record may have been deleted or the link is no longer valid.</p><Link to="/" className="button button-primary"><ArrowLeft size={18} /> Back to dashboard</Link></div>
    );
  }

  const saveExpense = (data) => {
    if (editing) {
      onUpdate(id, data);
      notify('Expense updated successfully.');
    } else {
      onAdd(data);
      notify('Expense added successfully.');
    }
    navigate('/');
  };

  return (
    <>
      <Link to="/" className="back-link"><ArrowLeft size={17} /> Back to dashboard</Link>
      <div className="page-heading form-page-heading"><div><p className="eyebrow">{editing ? 'UPDATE YOUR RECORD' : 'KEEP TRACK, STAY AHEAD'}</p><h1>{editing ? 'Edit expense' : 'Add a new expense'}</h1><p>{editing ? 'Make changes to your expense and save when you’re done.' : 'A small step today, a clearer financial picture tomorrow.'}</p></div></div>
      <ExpenseForm key={expense?.id || 'new'} initialValues={expense} onSave={saveExpense} />
    </>
  );
}

export default function App() {
  const [expenses, setExpenses] = useState(getInitialExpenses);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses)); } catch { /* App remains usable when storage is blocked. */ }
  }, [expenses]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  const notify = (message) => setToast({ message, id: Date.now() });
  const addExpense = (data) => setExpenses((current) => [{ ...data, id: makeId() }, ...current]);
  const updateExpense = (id, data) => setExpenses((current) => current.map((item) => item.id === id ? { ...item, ...data } : item));
  const deleteExpense = (id) => {
    setExpenses((current) => current.filter((item) => item.id !== id));
    notify('Expense deleted successfully.');
  };

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard expenses={expenses} onDelete={deleteExpense} />} />
        <Route path="/add" element={<ExpensePage expenses={expenses} onAdd={addExpense} onUpdate={updateExpense} notify={notify} />} />
        <Route path="/edit/:id" element={<ExpensePage expenses={expenses} onAdd={addExpense} onUpdate={updateExpense} notify={notify} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {toast && <div className="toast" role="status" key={toast.id}><CheckCircle2 size={21} /><span>{toast.message}</span><button onClick={() => setToast(null)} aria-label="Dismiss notification"><X size={17} /></button></div>}
    </Layout>
  );
}
