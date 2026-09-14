import { useEffect, useState } from 'react'
import { listReorderRequests } from '../services/reorderService'
import api from '../services/api'
import { useAuth } from '../hooks/useAuth'

export default function Reorder() {
  const [requests, setRequests] = useState([])
  const [error, setError] = useState(null)
  const { user } = useAuth()

  useEffect(() => {
    listReorderRequests().then(setRequests).catch((err) => setError(err.message))
  }, [])

  const setStatus = async (request, status) => {
    try { const updated = await api.patch(`/api/v1/reorder/${request.id}`, { status }); setRequests((current) => current.map((item) => item.id === updated.id ? updated : item)) } catch (err) { setError(err.message) }
  }

  return (
    <div className="page">
      <h1>Reorder</h1>
      {error && <p role="alert">{error}</p>}
      <ul>
        {requests.map((request) => (
          <li key={request.id}>
            {request.inventory_item_id} — qty {request.quantity} ({request.status}) {user?.role === 'MANAGER' && request.status === 'pending' && <button className="outline-button" type="button" onClick={() => setStatus(request, 'approved')}>Approve</button>}
          </li>
        ))}
      </ul>
    </div>
  )
}
