import { useEffect, useState } from 'react'
import api from '../services/api'
import { useAuth } from '../hooks/useAuth'

export default function POS() {
  const { user } = useAuth()
  const [customers, setCustomers] = useState([])
  const [guestId, setGuestId] = useState('')
  const [amount, setAmount] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  useEffect(() => { api.get('/api/v1/loyalty?limit=50').then((data) => { setCustomers(data); setGuestId(data[0]?.guest_id || '') }).catch((err) => setError(err.message)) }, [])
  const completeSale = async (event) => { event.preventDefault(); setError(null); setResult(null); try { setResult(await api.post('/api/v1/transactions', { guest_id: guestId, outlet: user.outlet || 'Chickpet', amount: Number(amount) })); setAmount('') } catch (err) { setError(err.message) } }
  return <div className="page"><div className="page-heading"><div><p className="eyebrow">Point of sale simulator</p><h1>Complete a sale</h1><p>Record a purchase and update the customer loyalty balance.</p></div><span className="outlet-chip">{user.outlet || 'All outlets'}</span></div>{error && <p className="alert" role="alert">{error}</p>}<section className="pos-layout"><form className="panel pos-form" onSubmit={completeSale}><h2>Meridian POS</h2><label className="field-label">Outlet<input value={user.outlet || 'All outlets'} readOnly /></label><label className="field-label">Customer<select value={guestId} onChange={(event) => setGuestId(event.target.value)} required>{customers.map((customer) => <option key={customer.guest_id} value={customer.guest_id}>{customer.name}</option>)}</select></label><label className="field-label">Purchase amount<input min="1" step="1" type="number" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="₹200" required /></label><button className="primary-button sale-button" type="submit">Complete sale</button></form>{result && <div className="panel sale-result"><span className="success-mark">✓</span><p className="eyebrow">Sale complete</p><h2>Congratulations, {result.guest_name.split(' ')[0]}!</h2><p>You earned {Number(result.transaction.points_earned).toLocaleString()} points.</p><strong>{Number(result.points_balance).toLocaleString()} points</strong><span className={`badge badge-${result.tier}`}>{result.tier}{result.tier_changed ? ' · new tier' : ''}</span>{result.tier_changed && <p className="reward-note">Reward unlocked: 10% off your next order.</p>}</div>}</section></div>
}
