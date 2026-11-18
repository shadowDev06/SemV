import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, Pencil, Trash2, ReceiptText, SearchX, ArrowUpDown, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CATEGORIES, formatDate, money } from '../utils';
import CategoryIcon from './CategoryIcon';
import ConfirmDialog from './ConfirmDialog';

export default function ExpenseList({ expenses, onDelete }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All categories');
  const [sort, setSort] = useState('newest');
  const [pendingDelete, setPendingDelete] = useState(null);
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return expenses.filter((item) => {
      const matchesSearch = !search || `${item.title} ${item.notes} ${item.category}`.toLowerCase().includes(search);
      return matchesSearch && (category === 'All categories' || item.category === category);
    }).sort((a, b) => {
      if (sort === 'oldest') return a.date.localeCompare(b.date);
      if (sort === 'highest') return Number(b.amount) - Number(a.amount);
      if (sort === 'lowest') return Number(a.amount) - Number(b.amount);
      return b.date.localeCompare(a.date) || String(b.id).localeCompare(String(a.id));
    });
  }, [expenses, query, category, sort]);

  const hasFilters = query || category !== 'All categories' || sort !== 'newest';
  const clearFilters = () => { setQuery(''); setCategory('All categories'); setSort('newest'); };
  const confirmDelete = () => {
    onDelete(pendingDelete.id);
    setPendingDelete(null);
  };

  return (
    <section className="card expense-card">
      <div className="expense-list-header">
        <div><h2>Expense history</h2><p>Review, edit, and manage your transactions</p></div>
        <span className="record-count">{expenses.length} {expenses.length === 1 ? 'record' : 'records'}</span>
      </div>
      <div className="filters">
        <label className="search-box">
          <Search size={18} />
          <span className="sr-only">Search expenses</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search expenses..." />
          {query && <button onClick={() => setQuery('')} aria-label="Clear search">×</button>}
        </label>
        <label className="select-wrap"><SlidersHorizontal size={17} /><span className="sr-only">Filter by category</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option>All categories</option>
            {CATEGORIES.map((item) => <option key={item.name}>{item.name}</option>)}
          </select>
        </label>
        <label className="select-wrap sort-select"><ArrowUpDown size={17} /><span className="sr-only">Sort expenses</span>
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="highest">Highest amount</option>
            <option value="lowest">Lowest amount</option>
          </select>
        </label>
      </div>

      {filtered.length ? (
        <>
          <div className="table-wrap">
            <table className="expense-table">
              <thead><tr><th>Expense</th><th>Category</th><th>Date</th><th className="amount-cell">Amount</th><th><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>
                {filtered.map((expense) => (
                  <tr key={expense.id}>
                    <td data-label="Expense"><div className="expense-name"><CategoryIcon category={expense.category} /><div><strong>{expense.title}</strong>{expense.notes && <span>{expense.notes}</span>}</div></div></td>
                    <td data-label="Category"><span className="category-pill">{expense.category}</span></td>
                    <td data-label="Date"><span className="date-text">{formatDate(expense.date, { year: undefined })}<small>{expense.date.slice(0, 4)}</small></span></td>
                    <td data-label="Amount" className="amount-cell"><strong>−{money(expense.amount)}</strong></td>
                    <td><div className="row-actions"><button className="icon-button edit-button" onClick={() => navigate(`/edit/${expense.id}`)} aria-label={`Edit ${expense.title}`}><Pencil size={17} /></button><button className="icon-button delete-button" onClick={() => setPendingDelete(expense)} aria-label={`Delete ${expense.title}`}><Trash2 size={17} /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="list-footer"><span>Showing <strong>{filtered.length}</strong> of {expenses.length} expenses</span>{hasFilters && <button className="text-button" onClick={clearFilters}>Clear filters</button>}</div>
        </>
      ) : (
        <div className="empty-state">
          <span className="empty-icon">{expenses.length ? <SearchX size={29} /> : <ReceiptText size={29} />}</span>
          <h3>{expenses.length ? 'No matching expenses' : 'No expenses yet'}</h3>
          <p>{expenses.length ? 'Try changing your search or filter to find what you need.' : 'Add your first expense and start building better spending habits.'}</p>
          {expenses.length ? <button className="button button-secondary" onClick={clearFilters}>Clear all filters</button> : <Link to="/add" className="button button-primary"><Plus size={18} /> Add your first expense</Link>}
        </div>
      )}
      {pendingDelete && <ConfirmDialog expense={pendingDelete} onCancel={() => setPendingDelete(null)} onConfirm={confirmDelete} />}
    </section>
  );
}
