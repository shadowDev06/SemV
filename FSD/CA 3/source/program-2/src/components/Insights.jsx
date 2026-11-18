import { Lightbulb, ArrowUpRight, PieChart } from 'lucide-react';
import { CATEGORIES, categoryDetails, isCurrentMonth, money } from '../utils';

export function CategoryBreakdown({ expenses }) {
  const total = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
  const amounts = CATEGORIES.map((category) => ({
    ...category,
    amount: expenses.filter((item) => item.category === category.name).reduce((sum, item) => sum + Number(item.amount), 0),
  })).filter((category) => category.amount > 0).sort((a, b) => b.amount - a.amount);

  let position = 0;
  const segments = amounts.map((category) => {
    const start = position;
    position += (category.amount / total) * 100;
    return `${category.color} ${start}% ${position}%`;
  });

  return (
    <section className="card breakdown-card">
      <div className="card-heading">
        <div><h2>Spending by category</h2><p>See where your money goes</p></div>
        <span className="heading-icon"><PieChart size={20} /></span>
      </div>
      {total > 0 ? (
        <div className="breakdown-content">
          <div className="donut" style={{ background: `conic-gradient(${segments.join(',')})` }}>
            <div className="donut-center"><span>Total spent</span><strong>{money(total)}</strong></div>
          </div>
          <div className="category-legend">
            {amounts.slice(0, 5).map((category) => (
              <div className="legend-row" key={category.name}>
                <span className="legend-dot" style={{ background: category.color }} />
                <span className="legend-name">{category.name}</span>
                <strong>{money(category.amount)}</strong>
                <span className="legend-percent">{Math.round((category.amount / total) * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      ) : <div className="mini-empty">Add an expense to see your category breakdown.</div>}
    </section>
  );
}

export function MonthlyInsight({ expenses }) {
  const monthly = expenses.filter((item) => isCurrentMonth(item.date));
  const total = monthly.reduce((sum, item) => sum + Number(item.amount), 0);
  const highest = monthly.reduce((max, item) => Number(item.amount) > Number(max.amount || 0) ? item : max, {});
  const byCategory = monthly.reduce((groups, item) => {
    groups[item.category] = (groups[item.category] || 0) + Number(item.amount);
    return groups;
  }, {});
  const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];
  const monthName = new Date().toLocaleDateString('en-US', { month: 'long' });

  return (
    <section className="card insight-card">
      <div className="card-heading">
        <div><h2>Monthly insight</h2><p>Your {monthName} at a glance</p></div>
        <span className="heading-icon amber"><Lightbulb size={20} /></span>
      </div>
      {monthly.length ? (
        <>
          <div className="insight-highlight">
            <span className="insight-dot" style={{ background: categoryDetails(topCategory[0]).color }} />
            <p>Your top spending category is <strong>{topCategory[0]}</strong>, at {money(topCategory[1])} so far this month.</p>
          </div>
          <div className="insight-metrics">
            <div><span>Avg. transaction</span><strong>{money(total / monthly.length)}</strong></div>
            <div><span>Largest expense</span><strong>{money(highest.amount)}</strong><small>{highest.title}</small></div>
          </div>
          <div className="insight-footer"><ArrowUpRight size={17} /> Every record helps you spend with intention.</div>
        </>
      ) : <div className="mini-empty">No expenses recorded this month yet.</div>}
    </section>
  );
}
