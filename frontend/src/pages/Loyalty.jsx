import { useState } from 'react'
import { getLoyaltyAccount } from '../services/loyaltyService'

export default function Loyalty() {
  const [guestId, setGuestId] = useState('')
  const [account, setAccount] = useState(null)
  const [error, setError] = useState(null)

  const handleLookup = async (event) => {
    event.preventDefault()
    setError(null)
    try {
      setAccount(await getLoyaltyAccount(guestId))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="page">
      <h1>Loyalty</h1>
      <form onSubmit={handleLookup}>
        <label htmlFor="guestId">Guest ID</label>
        <input
          id="guestId"
          value={guestId}
          onChange={(event) => setGuestId(event.target.value)}
        />
        <button type="submit">Look up</button>
      </form>
      {error && <p role="alert">{error}</p>}
      {account && (
        <p>
          Tier: {account.tier} — Points: {account.points_balance}
        </p>
      )}
    </div>
  )
}
