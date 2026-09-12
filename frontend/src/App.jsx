import { Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import Loyalty from './pages/Loyalty'
import Reorder from './pages/Reorder'
import Assistant from './pages/Assistant'
import Profile from './pages/Profile'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="loyalty" element={<Loyalty />} />
          <Route path="reorder" element={<Reorder />} />
          <Route path="assistant" element={<Assistant />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App

