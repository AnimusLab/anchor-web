import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { endpoints } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(() => {
    try { return JSON.parse(localStorage.getItem('root_user')) } catch { return null }
  })
  const [token, setToken] = useState(() => localStorage.getItem('root_token') || null)

  const login = useCallback((tokenStr, userData) => {
    localStorage.setItem('root_token', tokenStr)
    localStorage.setItem('root_user',  JSON.stringify(userData))
    setToken(tokenStr)
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('root_token')
    localStorage.removeItem('root_user')
    setToken(null)
    setUser(null)
  }, [])

  // Basic check for admin role
  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAdmin, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
