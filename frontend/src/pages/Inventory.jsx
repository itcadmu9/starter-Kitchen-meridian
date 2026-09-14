import { useEffect, useState } from 'react'
import api from '../services/api'
import { useAuth } from '../hooks/useAuth'

const PAGE_SIZE = 10

export default function Inventory() {
  const [items, setItems] = useState([])
  const [outlets, setOutlets] = useState([])
  const [outlet, setOutlet] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [stockItem, setStockItem] = useState(null)
  const [quantity, setQuantity] = useState('')
  const [stockAction, setStockAction] = useState('add')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newItem, setNewItem] = useState({ name: '', category: '', outlet: '', unit: 'kg', quantity: '', reorder_threshold: '' })
  const [error, setError] = useState(null)
  const { user } = useAuth()

  useEffect(() => {
    if (user?.role === 'MANAGER') api.get('/api/v1/inventory/outlets').then(setOutlets).catch((err) => setError(err.message))
  }, [user?.role])

  useEffect(() => {
    api.get(`/api/v1/inventory/paged?page=${page}&page_size=${PAGE_SIZE}${outlet ? `&outlet=${encodeURIComponent(outlet)}` : ''}`).then((result) => {
      setItems(result.items)
      setTotal(result.total)
    }).catch((err) => setError(err.message))
  }, [outlet, page])

  const statusFor = (item) => item.quantity <= 0 ? ['Out of stock', 'status-out'] : item.quantity <= item.reorder_threshold ? ['Low stock', 'status-low'] : ['In stock', 'status-good']
  const addStock = async (event) => {
    event.preventDefault()
    try {
      const updatedItem = await api.patch(`/api/v1/inventory/${stockItem.id}/stock`, { quantity: Number(quantity), action: stockAction })
      setItems((currentItems) => currentItems.map((item) => item.id === updatedItem.id ? updatedItem : item))
      setStockItem(null)
      setQuantity('')
      setStockAction('add')
    } catch (err) {
      setError(err.message)
    }
  }

  const openAddForm = () => {
    setNewItem({ name: '', category: '', outlet: user?.outlet || outlet || outlets[0] || '', unit: 'kg', quantity: '', reorder_threshold: '' })
    setShowAddForm(true)
  }

  const createStockItem = async (event) => {
    event.preventDefault()
    try {
      const createdItem = await api.post('/api/v1/inventory', {
        ...newItem,
        property_id: user?.property_id || items[0]?.property_id,
        quantity: Number(newItem.quantity),
        reorder_threshold: Number(newItem.reorder_threshold),
      })
      const refreshed = await api.get(`/api/v1/inventory/paged?page=1&page_size=${PAGE_SIZE}${outlet ? `&outlet=${encodeURIComponent(outlet)}` : ''}`)
      setItems(refreshed.items)
      setTotal(refreshed.total)
      setPage(1)
      setShowAddForm(false)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="page">
      <div className="page-heading"><div><p className="eyebrow">{user?.role === 'MANAGER' ? 'All outlet operations' : 'Staff operations'}</p><h1>Inventory stock</h1><p>{user?.role === 'MANAGER' ? 'Monitor every outlet and stock issue.' : `Update stock for ${user?.outlet || 'your outlet'}.`}</p></div>{user?.role === 'MANAGER' && <label className="select-label">Outlet<select value={outlet} onChange={(event) => { setOutlet(event.target.value); setPage(1) }}><option value="">All outlets</option>{outlets.map((name) => <option key={name}>{name}</option>)}</select></label>}</div>
      {error && <p className="alert" role="alert">{error}</p>}
      <section className="panel table-panel"><div className="panel-heading"><div><h2>All ingredients</h2><span className="muted">{total} items</span></div><button className="primary-button" type="button" onClick={openAddForm}>Add ingredient</button></div><div className="table-scroll"><table><thead><tr><th>Ingredient</th><th>Outlet</th><th>Quantity</th><th>Reorder threshold</th><th>Status</th><th>Actions</th></tr></thead><tbody>{items.map((item) => { const [status, statusClass] = statusFor(item); return <tr key={item.id}><td className="strong-cell">{item.name}</td><td>{item.outlet}</td><td>{Number(item.quantity).toFixed(2)} {item.unit}</td><td>{Number(item.reorder_threshold).toFixed(2)} {item.unit}</td><td><span className={`status-badge ${statusClass}`}>{status}</span></td><td><button className="outline-button" type="button" onClick={() => setStockItem(item)}>Add stock</button></td></tr> })}</tbody></table></div><div className="pagination"><span>Showing {total ? page : 0} of {Math.max(1, Math.ceil(total / PAGE_SIZE))}</span><div><button className="page-button" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button><button className="page-button" disabled={page * PAGE_SIZE >= total} onClick={() => setPage(page + 1)}>Next</button></div></div></section>
      {stockItem && <div className="modal-backdrop"><form className="modal" onSubmit={addStock}><p className="eyebrow">Inventory update</p><h2>{stockAction === 'add' ? 'Add stock' : 'Remove stock'}</h2><p>{stockItem.name} currently has {Number(stockItem.quantity).toFixed(2)} {stockItem.unit}.</p><label>Action<select value={stockAction} onChange={(event) => setStockAction(event.target.value)}><option value="add">Add stock</option><option value="remove">Remove stock</option></select></label><label>Quantity<input autoFocus min="0.01" step="0.01" type="number" value={quantity} onChange={(event) => setQuantity(event.target.value)} required /></label><div className="modal-actions"><button className="outline-button" type="button" onClick={() => setStockItem(null)}>Cancel</button><button className="primary-button" type="submit">{stockAction === 'add' ? 'Add stock' : 'Remove stock'}</button></div></form></div>}
      {showAddForm && <div className="modal-backdrop"><form className="modal inventory-form" onSubmit={createStockItem}><p className="eyebrow">Inventory setup</p><h2>Add ingredient</h2><label>Ingredient name<input autoFocus value={newItem.name} onChange={(event) => setNewItem({ ...newItem, name: event.target.value })} required /></label><label>Category<input value={newItem.category} onChange={(event) => setNewItem({ ...newItem, category: event.target.value })} required /></label><label>Outlet<select value={newItem.outlet} onChange={(event) => setNewItem({ ...newItem, outlet: event.target.value })} disabled={Boolean(user?.outlet)} required>{user?.outlet ? <option value={user.outlet}>{user.outlet}</option> : outlets.map((name) => <option key={name} value={name}>{name}</option>)}</select></label><label>Unit<input value={newItem.unit} onChange={(event) => setNewItem({ ...newItem, unit: event.target.value })} required /></label><label>Starting quantity<input min="0" step="0.01" type="number" value={newItem.quantity} onChange={(event) => setNewItem({ ...newItem, quantity: event.target.value })} required /></label><label>Reorder threshold<input min="0" step="0.01" type="number" value={newItem.reorder_threshold} onChange={(event) => setNewItem({ ...newItem, reorder_threshold: event.target.value })} required /></label><div className="modal-actions"><button className="outline-button" type="button" onClick={() => setShowAddForm(false)}>Cancel</button><button className="primary-button" type="submit">Add ingredient</button></div></form></div>}
    </div>
  )
}
