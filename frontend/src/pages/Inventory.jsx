import { useEffect, useState } from 'react'
import { adjustQuantity, inventoryStatus, listInventory } from '../services/inventoryService'
import { createReorderRequest, listReorderRequests, updateRequestStatus } from '../services/reorderService'
import { useOutlet } from '../hooks/useOutlet'
import StatusBadge from '../components/StatusBadge'

const NEXT_STATUS = {
  pending: { label: 'Approve', next: 'approved' },
  approved: { label: 'Mark ordered', next: 'ordered' },
  ordered: { label: 'Mark received', next: 'received' },
}

export default function Inventory() {
  const { outlet } = useOutlet()
  const [items, setItems] = useState([])
  const [requests, setRequests] = useState([])
  const [error, setError] = useState(null)

  const loadData = () => {
    if (!outlet) return
    listInventory(outlet.id).then(setItems).catch((err) => setError(err.message))
    listReorderRequests(outlet.id).then(setRequests).catch((err) => setError(err.message))
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outlet])

  const handleAdjust = async (itemId, delta) => {
    setError(null)
    try {
      await adjustQuantity(itemId, delta)
      loadData()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleReorder = async (item) => {
    setError(null)
    const suggestedQuantity = Math.max(item.reorder_threshold * 2 - item.quantity, item.reorder_threshold, 1)
    try {
      await createReorderRequest({
        property_id: outlet.id,
        inventory_item_id: item.id,
        quantity: suggestedQuantity,
      })
      loadData()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleAdvanceStatus = async (requestId, nextStatus) => {
    setError(null)
    try {
      await updateRequestStatus(requestId, nextStatus)
      loadData()
    } catch (err) {
      setError(err.message)
    }
  }

  const inStockItems = items.filter((item) => inventoryStatus(item) === 'in_stock')
  const attentionItems = items.filter((item) => inventoryStatus(item) !== 'in_stock')
  const ingredientName = (inventoryItemId) =>
    items.find((item) => item.id === inventoryItemId)?.name ?? 'Unknown ingredient'
  const openRequests = requests.filter((request) => request.status !== 'received')

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Inventory stock</h1>
          <p>Current on-hand quantities per ingredient, synced from POS.</p>
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}

      <h2 className="section-title">Needs attention</h2>
      {attentionItems.length === 0 ? (
        <p className="empty-note">Nothing is low or out of stock right now.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Ingredient</th>
              <th>Quantity</th>
              <th>Reorder threshold</th>
              <th>Status</th>
              <th>Actions</th>
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
                <td>
                  <button
                    type="button"
                    className="btn btn-outline btn-small"
                    onClick={() => handleAdjust(item.id, 5)}
                  >
                    Add stock
                  </button>{' '}
                  <button type="button" className="btn btn-small" onClick={() => handleReorder(item)}>
                    Reorder
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2 className="section-title">In stock</h2>
      {inStockItems.length === 0 ? (
        <p className="empty-note">No ingredients are currently in stock.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Ingredient</th>
              <th>Quantity</th>
              <th>Reorder threshold</th>
              <th>Status</th>
              <th>Adjust</th>
            </tr>
          </thead>
          <tbody>
            {inStockItems.map((item) => (
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
                <td>
                  <button
                    type="button"
                    className="btn btn-outline btn-small"
                    onClick={() => handleAdjust(item.id, -1)}
                  >
                    -1
                  </button>{' '}
                  <button
                    type="button"
                    className="btn btn-outline btn-small"
                    onClick={() => handleAdjust(item.id, 1)}
                  >
                    +1
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2 className="section-title">Open reorder requests</h2>
      {openRequests.length === 0 ? (
        <p className="empty-note">No open reorder requests.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Ingredient</th>
              <th>Quantity</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {openRequests.map((request) => {
              const action = NEXT_STATUS[request.status]
              return (
                <tr key={request.id}>
                  <td>{ingredientName(request.inventory_item_id)}</td>
                  <td>{request.quantity}</td>
                  <td>
                    <StatusBadge value={request.status} />
                  </td>
                  <td>
                    {action && (
                      <button
                        type="button"
                        className="btn btn-small"
                        onClick={() => handleAdvanceStatus(request.id, action.next)}
                      >
                        {action.label}
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}



