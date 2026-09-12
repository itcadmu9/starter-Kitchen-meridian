import { NavLink, Outlet } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/', label: 'Overview', end: true },
  { to: '/inventory', label: 'Inventory Stock' },
  { to: '/loyalty', label: 'Loyalty Program' },
  { to: '/assistant', label: 'Menu Assistant' },
]

export default function Layout() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="menu-button" type="button" aria-label="Open navigation">☰</button>
        <strong className="brand">Meridian Kitchens</strong>
        <span className="staff-label">Staff</span>
      </header>
      <nav className="sidebar" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <main className="content"><Outlet /></main>
    </div>
  )
}
