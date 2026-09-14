import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

export default function CustomerLoyalty() {
  const [members, setMembers] = useState([])
  const [selected, setSelected] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => { api.get('/api/v1/loyalty?limit=50').then(setMembers).catch((err) => setError(err.message)) }, [])
  const account = selected || members[0]
  return <div className="public-page"><header className="public-header"><strong className="brand">Meridian Kitchens</strong><nav><Link to="/menu">Menu</Link><Link to="/customer/loyalty">Loyalty demo</Link><Link to="/login">Staff login</Link></nav></header>
    <main className="customer-content"><p className="eyebrow">Customer demo</p><h1>Your Meridian rewards.</h1><p className="lead">See how a purchase turns into points, tiers, and rewards.</p>{error && <p className="alert" role="alert">{error}</p>}
      <section className="loyalty-demo"><div><p className="eyebrow">Choose a customer</p><div className="customer-list">{members.slice(0, 5).map((member) => <button className={account?.id === member.id ? 'customer-choice selected' : 'customer-choice'} key={member.id} onClick={() => setSelected(member)}>{member.name}<span>{Number(member.points_balance).toLocaleString()} pts</span></button>)}</div></div>{account && <div className="reward-display"><span className={`badge badge-${account.tier}`}>{account.tier}</span><h2>Congratulations, {account.name.split(' ')[0]}!</h2><strong>{Number(account.points_balance).toLocaleString()} points</strong><p>Keep dining with Meridian to unlock your next reward.</p><div className="reward-meter"><span style={{ width: `${Math.min(Number(account.points_balance) / 50, 100)}%` }} /></div><small>{account.tier === 'platinum' ? 'Platinum rewards unlocked' : 'More visits bring you closer to the next tier'}</small></div>}</section>
    </main></div>
}
