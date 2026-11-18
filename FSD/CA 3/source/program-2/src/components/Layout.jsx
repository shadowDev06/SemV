import { Link, NavLink } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, WalletCards, Sparkles, ShieldCheck } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/add', label: 'Add Expense', icon: PlusCircle },
];

function Brand() {
  return (
    <Link to="/" className="brand" aria-label="Spendly dashboard">
      <span className="brand-mark"><WalletCards size={23} strokeWidth={2.2} /></span>
      <span>spendly<span className="brand-dot">.</span></span>
    </Link>
  );
}

export default function Layout({ children }) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Brand />
        <div className="nav-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <span className="tip-spark"><Sparkles size={20} /></span>
            <h3>Make every dollar count.</h3>
            <p>Small tracking habits lead to smarter financial choices.</p>
          </div>
          <div className="secure-note"><ShieldCheck size={15} /> Your data stays on this device</div>
        </div>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <div>
            <p className="topbar-eyebrow">PERSONAL FINANCE</p>
            <p className="topbar-date">{currentDate}</p>
          </div>
          <div className="profile">
            <div className="profile-copy"><strong>Alex Johnson</strong><span>Personal account</span></div>
            <div className="avatar" aria-label="Alex Johnson">AJ</div>
          </div>
        </header>
        <header className="mobile-header">
          <Brand />
          <div className="avatar">AJ</div>
        </header>
        <main className="page-container">{children}</main>
      </div>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}>
            <Icon size={22} /><span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
