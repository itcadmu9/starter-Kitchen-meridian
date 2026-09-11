import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useOutlet } from '../hooks/useOutlet'
import { inventoryStatus, listInventory } from '../services/inventoryService'
import { listLoyaltyAccounts } from '../services/loyaltyService'
import StatusBadge from '../components/StatusBadge'

export default function Dashboard() {
  const { outlet } = useOutlet()
  const [inventory, setInventory] = useState([])
  const [loyaltyAccounts, setLoyaltyAccounts] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!outlet) return
    listInventory(outlet.id).then(setInventory).catch((err) => setError(err.message))
    listLoyaltyAccounts().then(setLoyaltyAccounts).catch((err) => setError(err.message))
  }, [outlet])

  const inStockCount = inventory.filter((item) => inventoryStatus(item) === 'in_stock').length
  const attentionItems = inventory.filter((item) => inventoryStatus(item) !== 'in_stock')
  const topMember = [...loyaltyAccounts].sort((a, b) => b.points_balance - a.points_balance)[0]

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>{outlet?.name ?? 'Meridian Kitchens'}</h1>
          <p>Overview of inventory levels and loyalty program performance.</p>
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className="stat-grid">
        <div className="stat-card">
          <p className="stat-label">Tracked ingredients</p>
          <p className="stat-value">{inventory.length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">In stock</p>
          <p className="stat-value">{inStockCount}</p>
        </div>
        <div className={`stat-card ${attentionItems.length ? 'alert' : ''}`}>
          <p className="stat-label">Needs attention</p>
          <p className="stat-value">{attentionItems.length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Loyalty members</p>
          <p className="stat-value">{loyaltyAccounts.length}</p>
        </div>
      </div>

      <h2 className="section-title">Ingredients needing attention</h2>
      {attentionItems.length === 0 ? (
        <p className="empty-note">All tracked ingredients are currently in stock.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Ingredient</th>
              <th>Quantity</th>
              <th>Reorder threshold</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {attentionItems.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>
                  {item.quantity} {item.unit}
                </td>
                <td>
                  {item.reorder_threshold} {item.unit}
                </td>
                <td>
                  <StatusBadge value={inventoryStatus(item)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2 className="section-title">Top loyalty member</h2>
      {topMember ? (
        <div className="card">
          <p>
            <strong>{topMember.guest_name}</strong> &middot;{' '}
            <span className={`badge badge-${topMember.tier}`}>{topMember.tier}</span> &middot;{' '}
            {Number(topMember.points_balance).toLocaleString()} points
          </p>
        </div>
      ) : (
        <p className="empty-note">No loyalty accounts yet.</p>
      )}

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3>Quick links</h3>
        <p>
          <Link to="/inventory">Manage inventory stock</Link>
        </p>
        <p>
          <Link to="/loyalty">View the loyalty program</Link>
        </p>
        <p>
          <Link to="/assistant">Ask the menu assistant</Link>
        </p>
      </div>
    </div>
  )
}



