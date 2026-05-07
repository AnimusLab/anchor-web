import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Icon = {
  overview: <svg viewBox="0 0 20 20" fill="currentColor" className="icon"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>,
  ledger:   <svg viewBox="0 0 20 20" fill="currentColor" className="icon"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/></svg>,
  chain:    <svg viewBox="0 0 20 20" fill="currentColor" className="icon"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>,
  trend:    <svg viewBox="0 0 20 20" fill="currentColor" className="icon"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/></svg>,
  enforce:  <svg viewBox="0 0 20 20" fill="currentColor" className="icon"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>,
  profile:  <svg viewBox="0 0 20 20" fill="currentColor" className="icon"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/></svg>,
  logout:   <svg viewBox="0 0 20 20" fill="currentColor" className="icon"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"/></svg>,
};

const NAV = [
  {
    section: 'OVERSIGHT & ANALYTICS',
    items: [
      { label: 'Overview',          icon: Icon.overview, path: '/dashboard'   },
      { label: 'Decision Ledger',   icon: Icon.ledger,   path: '/ledger'      },
      { label: 'Chain Verifier',    icon: Icon.chain,    path: '/chain'       },
      { label: 'Compliance Trend',  icon: Icon.trend,    path: '/trend'       },
    ]
  },
  {
    section: 'LIVE OPERATIONS',
    items: [
      { label: 'Live Gov Ticker', icon: Icon.ticker,   path: '/live-ticker' },
    ]
  },
  {
    section: 'ENFORCEMENT',
    items: [
      { label: 'Issue Notice',    icon: Icon.enforce,  path: '/enforce'     },
    ]
  },
  {
    section: 'MY CLEARANCE',
    items: [
      { label: 'My Profile',      icon: Icon.profile,  path: '/profile'     },
    ]
  },
];

export default function PortalLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const pageLabel = NAV.flatMap(g => g.items).find(i => i.path === location.pathname)?.label || 'Overview';

  return (
    <div style={{ height: '100vh', display: 'flex', overflow: 'hidden' }}>

      {/* SIDEBAR */}
      <aside style={{ width: 220, minWidth: 220, background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflowY: 'auto', zIndex: 10 }}>

        {/* Logo */}
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, background: 'var(--accent)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg viewBox="0 0 20 20" fill="white" style={{ width: 16, height: 16 }}>
              <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Anchor Oversight</div>
            <div style={{ fontSize: 10, color: 'var(--accent-soft)', letterSpacing: '0.05em', fontWeight: 500 }}>MASTER ACCESS</div>
          </div>
        </div>

        {/* Clearance badge */}
        <div style={{ margin: '12px 12px 0', padding: '8px 12px', background: 'rgba(124,58,237,0.08)', borderRadius: 6, border: '1px solid rgba(124,58,237,0.2)' }}>
          <div style={{ fontSize: 10, color: '#a78bfa', marginBottom: 2, fontWeight: 600 }}>PRIVILEGE: ROOT</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}>
            {user?.regulator || 'LEVEL_ROOT_CLEARANCE'}
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '4px 8px 20px' }}>
          {NAV.map(group => (
            <div key={group.section}>
              <div className="section-label">{group.section}</div>
              {group.items.map(item => (
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
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
          <div className="nav-link" onClick={logout} style={{ color: 'var(--text-muted)' }}>
            {Icon.logout} Terminate Session
          </div>
          <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace' }}>
            Anchor v5.8 — Hub
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ height: 56, background: 'var(--bg-sidebar)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0, zIndex: 5 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{pageLabel}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 6px var(--green)' }} />
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Grid Secure</span>
            </div>
            <div style={{ width: 1, height: 16, background: 'var(--border-lit)' }} />
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>
              {user?.regulator?.slice(0, 1).toUpperCase() || 'R'}
            </div>
          </div>
        </header>
        <main style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-void)' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
