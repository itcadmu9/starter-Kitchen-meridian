import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

export default function Menu() {
  const [items, setItems] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => { api.get('/api/v1/menu').then(setItems).catch((err) => setError(err.message)) }, [])

  return <div className="public-page">
    <header className="public-header"><strong className="brand">Meridian Kitchens</strong><nav><Link className="corner-login" to="/login">Staff / Manager login</Link></nav></header>
    <main className="menu-content"><p className="eyebrow">Meridian Kitchen menu</p><h1>Made for the table.</h1><p className="lead">Fresh bowls, comforting classics, and ingredients you can trust.</p>
      {error && <p className="alert" role="alert">{error}</p>}
      <section className="menu-grid">{items.map((item) => <article className="menu-card" key={item.id}><div className="menu-card-top"><span className="menu-category">{item.outlet}</span><strong>₹{Number(item.price).toLocaleString()}</strong></div><h2>{item.name}</h2><p>{item.ingredients.join(' · ')}</p>{item.allergens.length > 0 && <span className="allergen">Contains {item.allergens.join(', ')}</span>}</article>)}</section>
      <Link className="primary-button inline-button" to="/assistant">Ask the menu assistant</Link>
    </main>
  </div>
}
