import { useEffect, useState } from 'react'
import api from '../services/api'

const STATUS = [
  { key: 'in_stock', label: 'In stock', color: '#4b7458' },
  { key: 'low_stock', label: 'Low stock', color: '#d7a443' },
  { key: 'out_of_stock', label: 'Out of stock', color: '#c86b48' },
]

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get('/api/v1/dashboard').then(setDashboard).catch((err) => setError(err.message))
  }, [])

  const summary = dashboard?.summary
  const chart = summary ? `conic-gradient(${STATUS.map((item, index) => {
    const start = STATUS.slice(0, index).reduce((total, entry) => total + summary[`${entry.key}_percent`], 0)
    return `${item.color} ${start}% ${start + summary[`${item.key}_percent`]}%`
  }).join(', ')})` : 'conic-gradient(#e9e5d7 0 100%)'

  return (
    <div className="page">
      <div className="page-heading">
        <div><p className="eyebrow">Overview</p><h1>{dashboard?.property_name || 'Demo Property'}</h1><p>Overview of inventory levels and loyalty program performance.</p></div>
      </div>
      {error && <p className="alert" role="alert">{error}</p>}
      <section className="overview-grid">
        <div className="panel inventory-pulse"><div className="panel-heading"><div><p className="eyebrow">Inventory pulse</p><h2>Stock status</h2></div><span className="muted">All outlets</span></div>
          <div className="chart-row"><div className="donut" style={{ background: chart }}><span>{summary?.total ?? '—'}<small>items</small></span></div><div className="legend">{STATUS.map((item) => <div className="legend-item" key={item.key}><span className="legend-dot" style={{ background: item.color }} /><span>{item.label}</span><strong>{summary ? `${summary[`${item.key}_percent`]}%` : '—'}</strong></div>)}</div></div>
        </div>
        <div className="panel top-member"><p className="eyebrow">Top loyalty member</p><div className="member-star" aria-hidden="true">★</div><h2>{dashboard?.top_member?.name || 'No members yet'}</h2><span className="badge badge-platinum">{dashboard?.top_member?.tier || '—'}</span>{dashboard?.top_member && <p className="member-points">{Number(dashboard.top_member.points_balance).toLocaleString()} points</p>}</div>
      </section>
      <section className="metric-grid">
        <div className="metric-card"><span>Total inventory items</span><strong>{summary?.total ?? '—'}</strong></div>
        <div className="metric-card"><span>Low stock overall</span><strong className="gold-text">{summary?.low_stock ?? '—'}</strong></div>
        <div className="metric-card"><span>Needs attention</span><strong className="red-text">{summary?.out_of_stock ?? '—'}</strong></div>
      </section>
    </div>
  )
}
