import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Dashboard from './pages/Dashboard'
import ProvisioningPortal from './pages/ProvisioningPortal'
import LiveNOC from './pages/LiveNOC'

function Layout({ children }) {
  return (
    <div className="h-screen flex flex-col">
      {/* Root Header */}
      <header className="h-14 flex items-center justify-between px-6 border-b border-[#161B22] bg-[#08090C] z-50">
        <div className="flex items-center gap-4">
          <div className="w-3 h-3 bg-cyan-400 rounded-sm animate-pulse" />
          <h1 className="text-sm font-bold tracking-[0.3em] uppercase text-cyan-400">Anchor Root // MASTER_ACCESS</h1>
          <nav className="flex gap-6 ml-10">
            <a href="/dashboard" className="text-[10px] tracking-widest text-[#8B949E] hover:text-cyan-400 transition-colors">FLEET STATUS</a>
            <a href="/provisioning" className="text-[10px] tracking-widest text-[#8B949E] hover:text-cyan-400 transition-colors">PROVISIONING</a>
            <a href="/noc" className="text-[10px] tracking-widest text-[#8B949E] hover:text-cyan-400 transition-colors">LIVE NOC</a>
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-[10px] text-[#484F58] font-mono">BYPASS_AUTH_ACTIVE</span>
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
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/provisioning" element={<Layout><ProvisioningPortal /></Layout>} />
        <Route path="/noc" element={<Layout><LiveNOC /></Layout>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  )
}
