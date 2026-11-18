import { Wallet, CalendarRange, TrendingUp, ReceiptText } from 'lucide-react';
import { isCurrentMonth, money } from '../utils';

function StatCard({ label, value, note, icon: Icon, tone }) {
  return (
    <article className="stat-card">
      <div className={`stat-icon ${tone}`}><Icon size={22} /></div>
      <div className="stat-copy">
        <p>{label}</p>
        <h2>{value}</h2>
        <span>{note}</span>
      </div>
    </article>
  );
}

export default function SummaryCards({ expenses }) {
  const total = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
  const monthly = expenses.filter((item) => isCurrentMonth(item.date));
  const monthlyTotal = monthly.reduce((sum, item) => sum + Number(item.amount), 0);
  const averageDaily = monthlyTotal / new Date().getDate();
  const categories = new Set(expenses.map((item) => item.category)).size;

  return (
    <section className="stats-grid" aria-label="Expense summary">
      <StatCard label="Total expenses" value={money(total)} note={`Across ${categories} ${categories === 1 ? 'category' : 'categories'}`} icon={Wallet} tone="purple" />
      <StatCard label="Spent this month" value={money(monthlyTotal)} note={`${monthly.length} transactions this month`} icon={CalendarRange} tone="green" />
      <StatCard label="Average daily spend" value={money(averageDaily)} note="Based on days elapsed" icon={TrendingUp} tone="orange" />
      <StatCard label="Total transactions" value={expenses.length} note="All saved expense records" icon={ReceiptText} tone="blue" />
    </section>
  );
}
