import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Inventory from './pages/Inventory'
import Loyalty from './pages/Loyalty'
import Assistant from './pages/Assistant'
import Profile from './pages/Profile'
import Reorder from './pages/Reorder'
import Menu from './pages/Menu'
import ManagerDashboard from './pages/ManagerDashboard'
import { useAuth } from './hooks/useAuth'

function ProtectedLayout() {
  const { user } = useAuth()
  return user ? <Layout /> : <Navigate to="/login" replace />
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Menu />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/assistant" element={<Assistant />} />
        <Route element={<ProtectedLayout />}>
          <Route path="staff" element={<Navigate to="/inventory" replace />} />
          <Route path="manager" element={<ManagerDashboard />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="loyalty" element={<Loyalty />} />
          <Route path="assistant" element={<Assistant />} />
          <Route path="profile" element={<Profile />} />
          <Route path="reorder" element={<Reorder />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App

