import React, { createContext, useContext, useState, useCallback } from 'react'
import { endpoints } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('oversight_user')) } catch { return null }
  })
  const [token, setToken] = useState(() => sessionStorage.getItem('oversight_token') || null)

  const login = useCallback((tokenStr, userData) => {
    sessionStorage.setItem('oversight_token', tokenStr)
    sessionStorage.setItem('oversight_user',  JSON.stringify(userData))
    setToken(tokenStr)
    setUser(userData)
  }, [])

  const logout = useCallback(async () => {
    if (token) {
      try {
        await fetch(endpoints.logout, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        })
      } catch { /* best-effort */ }
    }
    sessionStorage.removeItem('oversight_token')
    sessionStorage.removeItem('oversight_user')
    setToken(null)
    setUser(null)
  }, [token])

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
