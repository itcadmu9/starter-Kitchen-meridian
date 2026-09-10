import { useEffect, useState } from 'react'
import { listInventory } from '../services/inventoryService'

export default function Inventory() {
  const [items, setItems] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    listInventory().then(setItems).catch((err) => setError(err.message))
  }, [])

  return (
    <div className="page">
      <h1>Inventory</h1>
      {error && <p role="alert">{error}</p>}
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {item.name} — {item.quantity} {item.unit}
          </li>
        ))}
      </ul>
    </div>
  )
}
