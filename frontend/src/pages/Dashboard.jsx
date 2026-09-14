import { useAuth } from '../hooks/useAuth'
import ManagerDashboard from './ManagerDashboard'
import StaffDashboard from './StaffDashboard'

export default function Dashboard() {
  const { user } = useAuth()
  return user?.role === 'MANAGER' ? <ManagerDashboard /> : <StaffDashboard />
}
