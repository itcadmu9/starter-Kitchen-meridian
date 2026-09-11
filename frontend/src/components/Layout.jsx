import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/', label: 'Overview', end: true },
  { to: '/inventory', label: 'Inventory Stock' },
  { to: '/loyalty', label: 'Loyalty Program' },
  { to: '/assistant', label: 'Menu Assistant' },
]

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="app-shell-wrapper">
      <div className="topbar">
        <button
          type="button"
          className="hamburger-btn"
          aria-label="Toggle navigation menu"
          onClick={() => setSidebarOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
        <span className="brand">Meridian Kitchens</span>
        <span className="spacer" />
        <span className="user-tag">Staff</span>
      </div>
      <div className="app-shell">
        <aside className={`sidebar ${sidebarOpen ? '' : 'closed'}`}>
          <nav>
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => (isActive ? 'active' : undefined)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}


