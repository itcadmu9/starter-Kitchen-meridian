import { useEffect, useState } from 'react'
import api from '../services/api'

export default function Loyalty() {
  const [members, setMembers] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => { api.get('/api/v1/loyalty?limit=50').then(setMembers).catch((err) => setError(err.message)) }, [])

  return (
    <div className="page">
      <div className="page-heading"><div><p className="eyebrow">Guest relationships</p><h1>Loyalty program</h1><p>Top members, guest points balances, and tier tracking.</p></div></div>
      {error && <p className="alert" role="alert">{error}</p>}
      <h2 className="section-title">Top members</h2><section className="member-grid">{members.slice(0, 3).map((member, index) => <div className="member-card" key={member.id}><span className="rank">#{index + 1} · {member.tier}</span><h2>{member.name}</h2><span className={`badge badge-${member.tier}`}>{member.tier}</span><strong>{Number(member.points_balance).toLocaleString()} points</strong></div>)}</section>
      <h2 className="section-title">All guests</h2><section className="panel table-panel"><div className="table-scroll"><table><thead><tr><th>Guest</th><th>Email</th><th>Tier</th><th>Points balance</th></tr></thead><tbody>{members.map((member) => <tr key={member.id}><td className="strong-cell">{member.name}</td><td>{member.email}</td><td><span className={`badge badge-${member.tier}`}>{member.tier}</span></td><td>{Number(member.points_balance).toLocaleString()}</td></tr>)}</tbody></table></div></section>
    </div>
  )
}
