import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import api from '../services/api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = (event) => {
    event.preventDefault()
    api.post('/api/v1/auth/login', { email, password }).then((result) => { login(result); navigate(result.user.role === 'MANAGER' ? '/manager' : '/inventory') }).catch((err) => setError(err.message))
  }

  return (
    <div className="page">
      <h1>Login</h1>
      {error && <p className="alert" role="alert">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <label htmlFor="password">Password</label>
        <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        <button type="submit">Log in</button>
      </form>
    </div>
  )
}
