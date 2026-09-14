import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('meridian_user') || 'null'))

  const login = (loggedInUser) => { localStorage.setItem('meridian_user', JSON.stringify(loggedInUser.user)); localStorage.setItem('meridian_token', loggedInUser.access_token); setUser(loggedInUser.user) }
  const logout = () => { localStorage.removeItem('meridian_user'); localStorage.removeItem('meridian_token'); setUser(null) }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
