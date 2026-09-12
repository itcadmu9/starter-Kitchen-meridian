import { useEffect, useState } from 'react'
import api from '../services/api'

export default function Inventory() {
  const [items, setItems] = useState([])
  const [outlets, setOutlets] = useState([])
  const [outlet, setOutlet] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [stockItem, setStockItem] = useState(null)
  const [quantity, setQuantity] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get('/api/v1/inventory/outlets').then(setOutlets).catch((err) => setError(err.message))
  }, [])

  useEffect(() => {
    api.get(`/api/v1/inventory/paged?page=${page}&page_size=20${outlet ? `&outlet=${encodeURIComponent(outlet)}` : ''}`).then((result) => {
      setItems(result.items)
      setTotal(result.total)
    }).catch((err) => setError(err.message))
  }, [outlet, page])

  const statusFor = (item) => item.quantity <= 0 ? ['Out of stock', 'status-out'] : item.quantity <= item.reorder_threshold ? ['Low stock', 'status-low'] : ['In stock', 'status-good']
  const addStock = async (event) => {
    event.preventDefault()
    try {
      const updatedItem = await api.patch(`/api/v1/inventory/${stockItem.id}/stock`, { quantity: Number(stockItem.quantity) + Number(quantity) })
      setItems((currentItems) => currentItems.map((item) => item.id === updatedItem.id ? updatedItem : item))
      setStockItem(null)
      setQuantity('')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="page">
      <div className="page-heading"><div><p className="eyebrow">Kitchen operations</p><h1>Inventory stock</h1><p>Current on-hand quantities per ingredient, synced from POS.</p></div><label className="select-label">Outlet<select value={outlet} onChange={(event) => { setOutlet(event.target.value); setPage(1) }}><option value="">All outlets</option>{outlets.map((name) => <option key={name}>{name}</option>)}</select></label></div>
      {error && <p className="alert" role="alert">{error}</p>}
      <section className="panel table-panel"><div className="panel-heading"><h2>All ingredients</h2><span className="muted">{total} items</span></div><div className="table-scroll"><table><thead><tr><th>Ingredient</th><th>Outlet</th><th>Quantity</th><th>Reorder threshold</th><th>Status</th><th>Actions</th></tr></thead><tbody>{items.map((item) => { const [status, statusClass] = statusFor(item); return <tr key={item.id}><td className="strong-cell">{item.name}</td><td>{item.outlet}</td><td>{Number(item.quantity).toFixed(2)} {item.unit}</td><td>{Number(item.reorder_threshold).toFixed(2)} {item.unit}</td><td><span className={`status-badge ${statusClass}`}>{status}</span></td><td><button className="outline-button" type="button" onClick={() => setStockItem(item)}>Add stock</button></td></tr> })}</tbody></table></div><div className="pagination"><span>Showing {items.length ? (page - 1) * 20 + 1 : 0}–{Math.min(page * 20, total)} of {total}</span><div><button className="page-button" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button><button className="page-button" disabled={page * 20 >= total} onClick={() => setPage(page + 1)}>Next</button></div></div></section>
      {stockItem && <div className="modal-backdrop"><form className="modal" onSubmit={addStock}><p className="eyebrow">Update quantity</p><h2>Add stock</h2><p>{stockItem.name} currently has {Number(stockItem.quantity).toFixed(2)} {stockItem.unit}.</p><label>Quantity to add<input autoFocus min="0" step="0.01" type="number" value={quantity} onChange={(event) => setQuantity(event.target.value)} required /></label><div className="modal-actions"><button className="outline-button" type="button" onClick={() => setStockItem(null)}>Cancel</button><button className="primary-button" type="submit">Submit</button></div></form></div>}
    </div>
  )
}
