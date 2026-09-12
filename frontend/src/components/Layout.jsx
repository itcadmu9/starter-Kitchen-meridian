import { Link, Outlet } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard' },
  { to: '/inventory', label: 'Inventory' },
  { to: '/loyalty', label: 'Loyalty' },
  { to: '/reorder', label: 'Reorder' },
  { to: '/assistant', label: 'Assistant' },
  { to: '/profile', label: 'Profile' },
]

export default function Layout() {
  return (
    <div>
      <nav style={{ display: 'flex', gap: '1rem', padding: '1rem', borderBottom: '1px solid #ccc' }}>
        {NAV_ITEMS.map((item) => (
          <Link key={item.to} to={item.to}>
            {item.label}
          </Link>
        ))}
      </nav>
      <Outlet />
    </div>
  )
}
