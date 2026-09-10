import { useMemo, useState } from 'react'
import './App.css'

const initialInventory = [
  {
    id: 1,
    category: 'Vegetable',
    ingredient: 'Tomato Sauce',
    outlet: 'Marina Bay',
    quantity: 18,
    reorder_threshold: 25,
  },
  {
    id: 2,
    category: 'Dairy',
    ingredient: 'Mozzarella',
    outlet: 'Marina Bay',
    quantity: 42,
    reorder_threshold: 20,
  },
  {
    id: 3,
    category: 'Meat',
    ingredient: 'Chicken Breast',
    outlet: 'Orchard',
    quantity: 14,
    reorder_threshold: 18,
  },
  {
    id: 4,
    category: 'Grain',
    ingredient: 'Basmati Rice',
    outlet: 'Orchard',
    quantity: 60,
    reorder_threshold: 30,
  },
  {
    id: 5,
    category: 'Oil',
    ingredient: 'Olive Oil',
    outlet: 'Riverside',
    quantity: 11,
    reorder_threshold: 15,
  },
  {
    id: 6,
    category: 'Pantry',
    ingredient: 'Coconut Milk',
    outlet: 'Riverside',
    quantity: 33,
    reorder_threshold: 20,
  },
  {
    id: 7,
    category: 'Protein',
    ingredient: 'Eggs',
    outlet: 'East Hub',
    quantity: 72,
    reorder_threshold: 40,
  },
  {
    id: 8,
    category: 'Vegetable',
    ingredient: 'Lettuce',
    outlet: 'East Hub',
    quantity: 9,
    reorder_threshold: 16,
  },
]

const emptyForm = {
  category: 'Vegetable',
  ingredient: '',
  outlet: 'Marina Bay',
  quantity: '',
  reorder_threshold: '',
}

const meridianOutlets = ['Marina Bay', 'Orchard', 'Riverside', 'East Hub', 'Central Kitchen']

function App() {
  const [inventoryItems, setInventoryItems] = useState(initialInventory)
  const [selectedOutlet, setSelectedOutlet] = useState('All Outlets')
  const [formValues, setFormValues] = useState(emptyForm)

  const summary = useMemo(() => {
    const totalUnits = inventoryItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
    const lowStockCount = inventoryItems.filter(
      (item) => Number(item.quantity) <= Number(item.reorder_threshold),
    ).length
    const outletCount = new Set(inventoryItems.map((item) => item.outlet)).size

    return {
      totalUnits,
      lowStockCount,
      outletCount,
    }
  }, [inventoryItems])

  const outletOptions = useMemo(() => {
    const outlets = Array.from(new Set(inventoryItems.map((item) => item.outlet))).sort()
    return ['All Outlets', ...outlets]
  }, [inventoryItems])

  const filteredItems = useMemo(() => {
    if (selectedOutlet === 'All Outlets') {
      return inventoryItems
    }

    return inventoryItems.filter((item) => item.outlet === selectedOutlet)
  }, [inventoryItems, selectedOutlet])

  function handleInputChange(event) {
    const { name, value } = event.target
    setFormValues((current) => ({ ...current, [name]: value }))
  }

  function handleAddStock(event) {
    event.preventDefault()

    const ingredient = formValues.ingredient.trim()
    const outlet = formValues.outlet
    const quantity = Number(formValues.quantity)
    const reorderThreshold = Number(formValues.reorder_threshold)

    if (!ingredient || !outlet || Number.isNaN(quantity) || Number.isNaN(reorderThreshold)) {
      return
    }

    const newItem = {
      id: Date.now(),
      category: formValues.category,
      ingredient,
      outlet,
      quantity,
      reorder_threshold: reorderThreshold,
    }

    setInventoryItems((current) => [newItem, ...current])
    setSelectedOutlet('All Outlets')
    setFormValues(emptyForm)
  }

  function handleReorderClick(itemId, isLowStock, threshold) {
    setInventoryItems((current) =>
      current.map((item) => {
        if (item.id !== itemId) {
          return item
        }

        const topUpAmount = isLowStock ? threshold * 2 : Math.max(10, Math.ceil(threshold * 0.25))

        return {
          ...item,
          quantity: Number(item.quantity) + topUpAmount,
        }
      }),
    )
  }

  return (
    <div className="inventory-page">
      <header className="topbar">
        <div>
          <p className="eyebrow">Meridian Kitchens Collective</p>
          <h1>Inventory Stock Register</h1>
        </div>
        <span className="status-pill">Demo data mode</span>
      </header>

      <main className="content">
        <section className="summary-grid">
          <article className="summary-card">
            <span>Total units in stock</span>
            <strong>{summary.totalUnits}</strong>
            <small>across all outlets</small>
          </article>

          <article className="summary-card">
            <span>Low stock items</span>
            <strong>{summary.lowStockCount}</strong>
            <small>need reorder attention</small>
          </article>

          <article className="summary-card">
            <span>Tracked outlets</span>
            <strong>{summary.outletCount}</strong>
            <small>operational sites</small>
          </article>
        </section>

        <section className="controls-row">
          <label htmlFor="outletFilter">Outlet</label>
          <select
            id="outletFilter"
            value={selectedOutlet}
            onChange={(event) => setSelectedOutlet(event.target.value)}
          >
            {outletOptions.map((outlet) => (
              <option key={outlet} value={outlet}>
                {outlet}
              </option>
            ))}
          </select>
        </section>

        <section className="entry-panel">
          <h2>Add Stock Item</h2>
          <form className="entry-form" onSubmit={handleAddStock}>
            <label>
              Category
              <select name="category" value={formValues.category} onChange={handleInputChange}>
                <option value="Vegetable">Vegetable</option>
                <option value="Meat">Meat</option>
                <option value="Dairy">Dairy</option>
                <option value="Seafood">Seafood</option>
                <option value="Pantry">Pantry</option>
                <option value="Spice">Spice</option>
              </select>
            </label>

            <label>
              Ingredient
              <input
                name="ingredient"
                value={formValues.ingredient}
                onChange={handleInputChange}
                placeholder="Example: Carrot"
                required
              />
            </label>

            <label>
              Outlet
              <select name="outlet" value={formValues.outlet} onChange={handleInputChange}>
                {meridianOutlets.map((outlet) => (
                  <option key={outlet} value={outlet}>
                    {outlet}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Quantity
              <input
                name="quantity"
                type="number"
                min="0"
                value={formValues.quantity}
                onChange={handleInputChange}
                placeholder="0"
                required
              />
            </label>

            <label>
              Reorder Threshold
              <input
                name="reorder_threshold"
                type="number"
                min="0"
                value={formValues.reorder_threshold}
                onChange={handleInputChange}
                placeholder="20"
                required
              />
            </label>

            <button type="submit">Add to Inventory</button>
          </form>
        </section>

        <section className="inventory-table-wrap">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Ingredient</th>
                <th>Outlet</th>
                <th>Current Qty</th>
                <th>Threshold</th>
                <th>Status</th>
                <th>Reorder Suggestion</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const quantity = Number(item.quantity)
                const threshold = Number(item.reorder_threshold)
                const isLowStock = quantity <= threshold
                const suggestedOrder = isLowStock ? threshold * 2 - quantity : 0

                return (
                  <tr key={item.id} className={isLowStock ? 'row-low' : ''}>
                    <td>{item.category}</td>
                    <td>{item.ingredient}</td>
                    <td>{item.outlet}</td>
                    <td>{quantity}</td>
                    <td>{threshold}</td>
                    <td>
                      <span className={`tag ${isLowStock ? 'warning' : 'ok'}`}>
                        {isLowStock ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td>{isLowStock ? `${suggestedOrder} units` : '-'}</td>
                    <td>
                      <button
                        type="button"
                        className={`action-btn ${isLowStock ? 'priority' : 'normal'}`}
                        onClick={() => handleReorderClick(item.id, isLowStock, threshold)}
                      >
                        {isLowStock ? 'Fill Stock Now' : 'Order Top-Up'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  )
}

export default App
