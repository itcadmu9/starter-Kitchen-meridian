import { useEffect, useState } from 'react'
import { listReorderRequests } from '../services/reorderService'

const STATUS = {
  pending: ['Waiting for arrival', 'status-low'],
  approved: ['Waiting for arrival', 'status-low'],
  ordered: ['Waiting for arrival', 'status-low'],
  received: ['Delivered', 'status-good'],
}

export default function Reorder() {
  const [requests, setRequests] = useState([])
  const [error, setError] = useState(null)

  const loadRequests = () => {
    listReorderRequests().then(setRequests).catch((err) => setError(err.message))
  }

  useEffect(loadRequests, [])

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Purchasing</p>
          <h1>Reorder requests</h1>
          <p>Requests move to Delivered automatically once staff update the stock on hand.</p>
        </div>
      </div>
      {error && <p className="alert" role="alert">{error}</p>}
      <section className="panel table-panel">
        <div className="panel-heading">
          <div>
            <h2>All requests</h2>
            <span className="muted">{requests.length} requests</span>
          </div>
          <button className="outline-button" type="button" onClick={loadRequests}>Refresh</button>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr><th>Ingredient</th><th>Outlet</th><th>Quantity</th><th>Requested</th><th>Status</th></tr>
            </thead>
            <tbody>
              {requests.map((request) => {
                const [label, statusClass] = STATUS[request.status] || [request.status, 'status-low']
                return (
                  <tr key={request.id}>
                    <td className="strong-cell">{request.inventory_item_name || request.inventory_item_id}</td>
                    <td>{request.outlet || '—'}</td>
                    <td>{Number(request.quantity).toFixed(2)} {request.unit}</td>
                    <td>{new Date(request.requested_at).toLocaleDateString()}</td>
                    <td><span className={`status-badge ${statusClass}`}>{label}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {!requests.length && <p className="muted" style={{ padding: '0 23px 22px' }}>No reorder requests yet.</p>}
      </section>
    </div>
  )
}
