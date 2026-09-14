import { useEffect, useState } from 'react'
import api from '../services/api'

const STATUS = [
  { key: 'in_stock', label: 'In stock', color: '#4b7458' },
  { key: 'low_stock', label: 'Low stock', color: '#d7a443' },
  { key: 'out_of_stock', label: 'Out of stock', color: '#c86b48' },
]

export default function StaffDashboard() {
  const [dashboard, setDashboard] = useState(null)
  const [error, setError] = useState(null)
  useEffect(() => { api.get('/api/v1/dashboard').then(setDashboard).catch((err) => setError(err.message)) }, [])
  const summary = dashboard?.summary
  const chart = summary ? `conic-gradient(${STATUS.map((item, index) => { const start = STATUS.slice(0, index).reduce((total, entry) => total + summary[`${entry.key}_percent`], 0); return `${item.color} ${start}% ${start + summary[`${item.key}_percent`]}%` }).join(', ')})` : 'conic-gradient(#e9e5d7 0 100%)'
  return <div className="page"><div className="page-heading"><div><p className="eyebrow">Staff dashboard</p><h1>{dashboard?.property_name || 'Your outlet'}</h1><p>Track today&apos;s stock and keep the kitchen moving.</p></div></div>{error && <p className="alert" role="alert">{error}</p>}<section className="overview-grid"><div className="panel inventory-pulse"><div className="panel-heading"><div><p className="eyebrow">Your outlet</p><h2>Stock status</h2></div><span className="muted">Staff view</span></div><div className="chart-row"><div className="donut" style={{ background: chart }}><span>{summary?.total ?? '—'}<small>items</small></span></div><div className="legend">{STATUS.map((item) => <div className="legend-item" key={item.key}><span className="legend-dot" style={{ background: item.color }} /><span>{item.label}</span><strong>{summary ? `${summary[`${item.key}_percent`]}%` : '—'}</strong></div>)}</div></div></div><div className="panel top-member"><p className="eyebrow">Kitchen focus</p><div className="member-star" aria-hidden="true">✦</div><h2>{summary?.low_stock ? `${summary.low_stock} items need attention` : 'Kitchen is ready'}</h2><p className="member-points">Update stock as deliveries arrive.</p></div></section><section className="metric-grid"><div className="metric-card"><span>Total ingredients</span><strong>{summary?.total ?? '—'}</strong></div><div className="metric-card"><span>Low stock</span><strong className="gold-text">{summary?.low_stock ?? '—'}</strong></div><div className="metric-card"><span>Out of stock</span><strong className="red-text">{summary?.out_of_stock ?? '—'}</strong></div></section></div>
}
