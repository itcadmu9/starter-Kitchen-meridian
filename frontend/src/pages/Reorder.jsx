import { useEffect, useState } from 'react'
import { listReorderRequests } from '../services/reorderService'

export default function Reorder() {
  const [requests, setRequests] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    listReorderRequests().then(setRequests).catch((err) => setError(err.message))
  }, [])

  return (
    <div className="page">
      <h1>Reorder</h1>
      {error && <p role="alert">{error}</p>}
      <ul>
        {requests.map((request) => (
          <li key={request.id}>
            {request.inventory_item_id} — qty {request.quantity} ({request.status})
          </li>
        ))}
      </ul>
    </div>
  )
}
