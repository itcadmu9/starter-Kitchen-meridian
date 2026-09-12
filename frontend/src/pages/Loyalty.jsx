import { useEffect, useState } from 'react'
import api from '../services/api'
import { adjustLoyaltyPoints } from '../services/loyaltyService'

export default function Loyalty() {
  const [members, setMembers] = useState([])
  const [error, setError] = useState(null)
  const [pointsMember, setPointsMember] = useState(null)
  const [points, setPoints] = useState('')

  useEffect(() => { api.get('/api/v1/loyalty?limit=50').then(setMembers).catch((err) => setError(err.message)) }, [])

  const addPoints = async (event) => {
    event.preventDefault()
    setError(null)
    try {
      const updated = await adjustLoyaltyPoints(pointsMember.guest_id, Number(points))
      setMembers((currentMembers) => currentMembers.map((member) => member.id === updated.id ? { ...member, ...updated } : member).sort((left, right) => Number(right.points_balance) - Number(left.points_balance)))
      setPointsMember(null)
      setPoints('')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="page">
      <div className="page-heading"><div><p className="eyebrow">Guest relationships</p><h1>Loyalty program</h1><p>Top members, guest points balances, and tier tracking.</p></div></div>
      {error && <p className="alert" role="alert">{error}</p>}
      <h2 className="section-title">Top members</h2><section className="member-grid">{members.slice(0, 3).map((member, index) => <div className="member-card" key={member.id}><span className="rank">#{index + 1} · {member.tier}</span><h2>{member.name}</h2><span className={`badge badge-${member.tier}`}>{member.tier}</span><strong>{Number(member.points_balance).toLocaleString()} points</strong></div>)}</section>
      <h2 className="section-title">All guests</h2><section className="panel table-panel"><div className="table-scroll"><table><thead><tr><th>Guest</th><th>Email</th><th>Tier</th><th>Points balance</th><th>Actions</th></tr></thead><tbody>{members.map((member) => <tr key={member.id}><td className="strong-cell">{member.name}</td><td>{member.email}</td><td><span className={`badge badge-${member.tier}`}>{member.tier}</span></td><td>{Number(member.points_balance).toLocaleString()}</td><td><button className="outline-button" type="button" onClick={() => setPointsMember(member)}>Add points</button></td></tr>)}</tbody></table></div></section>
      {pointsMember && <div className="modal-backdrop"><form className="modal" onSubmit={addPoints}><p className="eyebrow">Loyalty activity</p><h2>Add points</h2><p>Add points to {pointsMember.name}'s account.</p><label>Points to add<input autoFocus min="1" step="1" type="number" value={points} onChange={(event) => setPoints(event.target.value)} required /></label><div className="modal-actions"><button className="outline-button" type="button" onClick={() => setPointsMember(null)}>Cancel</button><button className="primary-button" type="submit">Add points</button></div></form></div>}
    </div>
  )
}
