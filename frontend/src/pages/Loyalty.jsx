import { useEffect, useState } from 'react'
import { adjustLoyaltyPoints, listLoyaltyAccounts } from '../services/loyaltyService'

export default function Loyalty() {
  const [accounts, setAccounts] = useState([])
  const [pointsDelta, setPointsDelta] = useState({})
  const [error, setError] = useState(null)

  const loadAccounts = () => {
    listLoyaltyAccounts()
      .then(setAccounts)
      .catch((err) => setError(err.message))
  }

  useEffect(() => {
    loadAccounts()
  }, [])

  const topThree = [...accounts].sort((a, b) => b.points_balance - a.points_balance).slice(0, 3)

  const handleAdjust = async (guestId) => {
    setError(null)
    const delta = Number(pointsDelta[guestId] || 0)
    if (!delta) return
    try {
      await adjustLoyaltyPoints(guestId, delta)
      loadAccounts()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Loyalty program</h1>
          <p>Top members, guest points balances, and tier tracking.</p>
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}

      <h2 className="section-title">Top members</h2>
      {topThree.length === 0 ? (
        <p className="empty-note">No loyalty accounts yet.</p>
      ) : (
        <div className="stat-grid">
          {topThree.map((account, index) => (
            <div key={account.id} className="stat-card">
              <p className="stat-label">#{index + 1} &middot; {account.guest_name}</p>
              <p className="stat-value">{Number(account.points_balance).toLocaleString()}</p>
              <span className={`badge badge-${account.tier}`}>{account.tier}</span>
            </div>
          ))}
        </div>
      )}

      <h2 className="section-title">All guests</h2>
      {accounts.length === 0 ? (
        <p className="empty-note">No loyalty accounts yet.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Guest</th>
              <th>Email</th>
              <th>Tier</th>
              <th>Points balance</th>
              <th>Adjust points</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => (
              <tr key={account.id}>
                <td>{account.guest_name}</td>
                <td>{account.guest_email}</td>
                <td>
                  <span className={`badge badge-${account.tier}`}>{account.tier}</span>
                </td>
                <td>{Number(account.points_balance).toLocaleString()}</td>
                <td>
                  <input
                    type="number"
                    style={{ width: 90 }}
                    value={pointsDelta[account.guest_id] ?? ''}
                    placeholder="+/- pts"
                    onChange={(event) =>
                      setPointsDelta((prev) => ({ ...prev, [account.guest_id]: event.target.value }))
                    }
                  />{' '}
                  <button
                    type="button"
                    className="btn btn-outline btn-small"
                    onClick={() => handleAdjust(account.guest_id)}
                  >
                    Apply
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}



