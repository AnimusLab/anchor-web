import React, { useState } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Dashboard from './pages/Dashboard'
import ProvisioningPortal from './pages/ProvisioningPortal'
import WhitelistManagement from './pages/WhitelistManagement'
import AuditorManagement from './pages/AuditorManagement'
import LiveNOC from './pages/LiveNOC'
import PendingApprovals from './pages/PendingApprovals'
import { GlobalTelemetry, FleetInspection, BillingSubscriptions, CryptographicEngine, IdentityResolution, IdentityRecovery, NetworkOverrides } from './pages/StubPages'

// ─── Icons (inline SVG) ───────────────────────────────────────────────────────
const Icon = {
  grid: <svg viewBox="0 0 20 20" fill="currentColor" className="icon"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>,
  globe: <svg viewBox="0 0 20 20" fill="currentColor" className="icon"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2H7.5A1.5 1.5 0 016 10.5a1.5 1.5 0 00-1.668-1.473z" clipRule="evenodd"/></svg>,
  inspect: <svg viewBox="0 0 20 20" fill="currentColor" className="icon"><path d="M9 9a2 2 0 114 0 2 2 0 01-4 0z"/><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a4 4 0 00-3.446 6.032l-2.261 2.26a1 1 0 101.414 1.415l2.261-2.261A4 4 0 1011 5z" clipRule="evenodd"/></svg>,
  plus: <svg viewBox="0 0 20 20" fill="currentColor" className="icon"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/></svg>,
  billing: <svg viewBox="0 0 20 20" fill="currentColor" className="icon"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/><path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/></svg>,
  lock: <svg viewBox="0 0 20 20" fill="currentColor" className="icon"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/></svg>,
  id: <svg viewBox="0 0 20 20" fill="currentColor" className="icon"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/></svg>,
  recovery: <svg viewBox="0 0 20 20" fill="currentColor" className="icon"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/></svg>,
  network: <svg viewBox="0 0 20 20" fill="currentColor" className="icon"><path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"/></svg>,
  noc: <svg viewBox="0 0 20 20" fill="currentColor" className="icon"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/></svg>,
  approve: <svg viewBox="0 0 20 20" fill="currentColor" className="icon"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>,
}

const navItems = [
  {
    section: 'OVERSIGHT & ANALYTICS',
    items: [
      { label: 'Overview', path: '/dashboard', icon: Icon.grid },
      { label: 'Global Telemetry', path: '/telemetry', icon: Icon.globe },
      { label: 'Fleet Inspection', path: '/fleet', icon: Icon.inspect },
    ]
  },
  {
    section: 'ACCESS MANAGEMENT',
    items: [
      { label: 'Pending Approvals', path: '/approvals', icon: Icon.approve },
      { label: 'Sovereign Whitelist', path: '/whitelist', icon: Icon.lock },
    ]
  },
  {
    section: 'SAAS CONTROL PLANE',
    items: [
      { label: 'Enterprise Nodes', path: '/provisioning', icon: Icon.plus },
      { label: 'Regulatory Officials', path: '/auditors', icon: Icon.id },
      { label: 'Billing & Subscriptions', path: '/billing', icon: Icon.billing },
    ]
  },
  {
    section: 'CRYPTOGRAPHIC ENGINE',
    items: [
      { label: 'Identity Resolution', path: '/identity', icon: Icon.id },
      { label: 'Identity Recovery', path: '/identity-recovery', icon: Icon.recovery },
      { label: 'Network Overrides', path: '/network-overrides', icon: Icon.network },
    ]
  },
  {
    section: 'LIVE OPERATIONS',
    items: [
      { label: 'Live NOC', path: '/noc', icon: Icon.noc },
    ]
  }
]

function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <aside style={{
      width: 220,
      minWidth: 220,
      background: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
      zIndex: 10,
    }}>
      {/* Logo */}
      <div style={{
        padding: '20px 16px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <div style={{
          width: 30, height: 30,
          background: 'var(--accent)',
          borderRadius: 6,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <svg viewBox="0 0 20 20" fill="white" style={{width: 16, height: 16}}>
            <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"/>
          </svg>
        </div>
        <div>
          <div style={{fontSize: 13, fontWeight: 700, color: 'var(--text-primary)'}}>Anchor Root</div>
          <div style={{fontSize: 10, color: 'var(--accent-soft)', letterSpacing: '0.05em', fontWeight: 500}}>MASTER ACCESS</div>
        </div>
      </div>

      {/* Authority Badge */}
      <div style={{
        margin: '12px 12px 0',
        padding: '8px 12px',
        background: 'rgba(124,58,237,0.08)',
        borderRadius: 6,
        border: '1px solid rgba(124,58,237,0.2)',
      }}>
        <div style={{fontSize: 10, color: '#a78bfa', marginBottom: 2, fontWeight: 600}}>PRIVILEGE: ROOT</div>
        <div style={{fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace'}}>LEVEL_ROOT_CLEARANCE</div>
      </div>

      {/* Nav */}
      <nav style={{flex: 1, padding: '4px 8px 20px'}}>
        {navItems.map((group) => (
          <div key={group.section}>
            <div className="section-label">{group.section}</div>
            {group.items.map((item) => (
              <div
                key={item.path}
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                {item.icon}
                {item.label}
              </div>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid var(--border)',
        fontSize: 11,
        color: 'var(--text-dim)',
        fontFamily: 'JetBrains Mono, monospace',
      }}>
        Anchor v5.0.2 — Root
      </div>
    </aside>
  )
}

function TopBar() {
  const location = useLocation()
  const pageName = navItems.flatMap(g => g.items).find(i => i.path === location.pathname)?.label || 'Overview'

  return (
    <header style={{
      height: 56,
      background: 'var(--bg-sidebar)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      flexShrink: 0,
      zIndex: 5,
    }}>
      <div style={{fontSize: 15, fontWeight: 600, color: 'var(--text-primary)'}}>{pageName}</div>
      <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
        {/* Live indicator */}
        <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: 'var(--green)',
            boxShadow: '0 0 6px var(--green)',
          }}/>
          <span style={{fontSize: 12, color: 'var(--text-secondary)'}}>Grid Secure</span>
        </div>
        <div style={{
          width: 1, height: 16,
          background: 'var(--border-lit)',
        }}/>
        <div style={{
          width: 30, height: 30,
          borderRadius: '50%',
          background: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, color: '#fff',
          cursor: 'pointer',
        }}>R</div>
      </div>
    </header>
  )
}

function Layout({ children }) {
  return (
    <div style={{height: '100vh', display: 'flex', overflow: 'hidden'}}>
      <Sidebar />
      <div style={{flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
        <TopBar />
        <main style={{flex: 1, overflowY: 'auto', background: 'var(--bg-void)'}}>
          {children}
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/dashboard"         element={<Layout><Dashboard /></Layout>} />
        <Route path="/telemetry"         element={<Layout><GlobalTelemetry /></Layout>} />
        <Route path="/fleet"             element={<Layout><FleetInspection /></Layout>} />
        <Route path="/provisioning"      element={<Layout><ProvisioningPortal /></Layout>} />
        <Route path="/auditors"          element={<Layout><AuditorManagement /></Layout>} />
        <Route path="/approvals"         element={<Layout><PendingApprovals /></Layout>} />
        <Route path="/whitelist"         element={<Layout><WhitelistManagement /></Layout>} />
        <Route path="/billing"           element={<Layout><BillingSubscriptions /></Layout>} />
        <Route path="/identity"          element={<Layout><IdentityResolution /></Layout>} />
        <Route path="/identity-recovery" element={<Layout><IdentityRecovery /></Layout>} />
        <Route path="/network-overrides" element={<Layout><NetworkOverrides /></Layout>} />
        <Route path="/noc"               element={<Layout><LiveNOC /></Layout>} />
        <Route path="*"                  element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  )
}
