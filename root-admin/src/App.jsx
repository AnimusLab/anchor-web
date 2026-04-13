import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import AuditorManagement from './pages/AuditorManagement'
import LiveNOC from './pages/LiveNOC'

function ProtectedRoute({ children }) {
  const { isAuthenticated, isAdmin } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!isAdmin) return <div className="p-20 text-center text-red-500 underline">ERROR: INSUFFICIENT CLEARANCE</div>
  return children
}

function Layout({ children }) {
  const { logout, user } = useAuth()
  return (
    <div className="h-screen flex flex-col">
      {/* Root Header */}
      <header className="h-14 flex items-center justify-between px-6 border-b border-[#161B22] bg-[#08090C] z-50">
        <div className="flex items-center gap-4">
          <div className="w-3 h-3 bg-cyan-400 rounded-sm animate-pulse" />
          <h1 className="text-sm font-bold tracking-[0.3em] uppercase text-cyan-400">Anchor Root</h1>
          <nav className="flex gap-6 ml-10">
            <a href="/dashboard" className="text-[10px] tracking-widest text-[#8B949E] hover:text-cyan-400 transition-colors">FLEET STATUS</a>
            <a href="/provisioning" className="text-[10px] tracking-widest text-[#8B949E] hover:text-cyan-400 transition-colors">AUDITORS</a>
            <a href="/noc" className="text-[10px] tracking-widest text-[#8B949E] hover:text-cyan-400 transition-colors">LIVE NOC</a>
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-[10px] text-[#484F58] font-mono">MASTER NODE // {user?.sub?.slice(0, 8)}</span>
          <button onClick={logout} className="text-[10px] text-red-400 hover:underline">TERMINATE</button>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/provisioning" element={<ProtectedRoute><Layout><AuditorManagement /></Layout></ProtectedRoute>} />
        <Route path="/noc" element={<ProtectedRoute><Layout><LiveNOC /></Layout></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  )
}
