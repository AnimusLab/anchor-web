import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { endpoints } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // Hardcoded Master Session
  const [user] = useState({ sub: 'tan@anchorgovernance.tech', role: 'root', org_id: 'MASTER' })
  const [token] = useState('MASTER_BYPASS_TOKEN')

  const login = useCallback(() => {}, [])
  const logout = useCallback(() => {}, [])
  const isAdmin = true

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAdmin, isAuthenticated: true }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
