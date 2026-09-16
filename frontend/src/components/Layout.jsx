import { NavLink, Outlet } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const isManager = user?.role === 'MANAGER'
  const navItems = isManager
    ? [{ to: '/manager', label: 'Dashboard' }, { to: '/inventory', label: 'Inventory' }, { to: '/loyalty', label: 'Loyalty' }, { to: '/reorder', label: 'Reorder requests' }]
    : [{ to: '/staff', label: 'Dashboard' }, { to: '/inventory', label: 'Inventory' }]
  return (
    <div className={`app-shell ${isManager ? '' : 'staff-shell'}`}>
      <header className="topbar">
        <strong className="brand">Meridian Kitchens</strong>
        <span className="staff-label">{user?.role || 'Guest'}</span>
        <button className="logout-button" type="button" onClick={() => { logout(); navigate('/login') }}>Log out</button>
      </header>
      {isManager && <nav className="sidebar" aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              {item.label}
            </NavLink>
          ))}
        </nav>}
      <main className="content"><Outlet /></main>
    </div>
  )
}
