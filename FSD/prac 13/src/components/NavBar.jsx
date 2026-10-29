import { Link, NavLink } from 'react-router-dom'
import { appConfig } from '../config.js'

const LINKS = [
  { to: '/', label: 'Overview', end: true },
  { to: '/checklist', label: 'Checklist' },
  { to: '/guide', label: 'Deploy guide' },
]

export default function NavBar() {
  return (
    <header className="site-header">
      <Link to="/" className="brand" aria-label={`${appConfig.name} home`}>
        <span className="brand-mark" aria-hidden="true">
          <span />
        </span>
        <span className="brand-name">{appConfig.name}</span>
      </Link>

      <nav className="site-nav" aria-label="Primary">
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => (isActive ? 'nav-link is-active' : 'nav-link')}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <span className="env-chip" title="Value from VITE_DEPLOY_ENV">
        <span className="env-dot" aria-hidden="true" />
        {appConfig.environment}
      </span>
    </header>
  )
}
