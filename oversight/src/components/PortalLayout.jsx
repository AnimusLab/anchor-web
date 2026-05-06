import React from 'react';
import { useAuth } from '../contexts/AuthContext';

// ── Inline SVG icons (same as root-admin) ──────────────────────────────────
const Icon = {
  grid:     <svg viewBox="0 0 20 20" fill="currentColor" className="icon"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>,
  shield:   <svg viewBox="0 0 20 20" fill="currentColor" className="icon"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>,
  alert:    <svg viewBox="0 0 20 20" fill="currentColor" className="icon"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>,
  settings: <svg viewBox="0 0 20 20" fill="currentColor" className="icon"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/></svg>,
  logout:   <svg viewBox="0 0 20 20" fill="currentColor" className="icon"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"/></svg>,
};

const navSections = [
  {
    section: 'OVERSIGHT & ANALYTICS',
    items: [
      { label: 'Overview',     icon: Icon.grid,     active: true },
      { label: 'Forensic Hub', icon: Icon.shield,   active: false },
      { label: 'Enforcement',  icon: Icon.alert,    active: false },
    ]
  },
  {
    section: 'JURISDICTION CONTROL',
    items: [
      { label: 'System Config', icon: Icon.settings, active: false },
    ]
  },
];

export default function PortalLayout({ children }) {
  const { user, logout } = useAuth();

  return (
    <div style={{ height: '100vh', display: 'flex', overflow: 'hidden' }}>

      {/* ── SIDEBAR (exact root-admin copy) ── */}
      <aside style={{
        width: 220, minWidth: 220,
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        overflowY: 'auto', zIndex: 10,
      }}>
        {/* Logo */}
        <div style={{
          padding: '20px 16px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 30, height: 30,
            background: 'var(--accent)',
            borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg viewBox="0 0 20 20" fill="white" style={{ width: 16, height: 16 }}>
              <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Anchor Oversight</div>
            <div style={{ fontSize: 10, color: 'var(--accent-soft)', letterSpacing: '0.05em', fontWeight: 500 }}>MASTER ACCESS</div>
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
          <div style={{ fontSize: 10, color: '#a78bfa', marginBottom: 2, fontWeight: 600 }}>
            PRIVILEGE: ROOT
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}>
            {user?.regulator || 'LEVEL_ROOT_CLEARANCE'}
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '4px 8px 20px' }}>
          {navSections.map(group => (
            <div key={group.section}>
              <div className="section-label">{group.section}</div>
              {group.items.map(item => (
                <div
                  key={item.label}
                  className={`nav-link ${item.active ? 'active' : ''}`}
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
        }}>
          <div
            className="nav-link"
            onClick={logout}
            style={{ color: 'var(--text-muted)' }}
          >
            {Icon.logout}
            Terminate Session
          </div>
          <div style={{
            marginTop: 12,
            fontSize: 11, color: 'var(--text-dim)',
            fontFamily: 'JetBrains Mono, monospace',
          }}>
            Anchor v5.8 — Hub
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Top bar */}
        <header style={{
          height: 56,
          background: 'var(--bg-sidebar)',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          flexShrink: 0, zIndex: 5,
        }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Overview</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 7, height: 7, borderRadius: '50%',
                background: 'var(--green)',
                boxShadow: '0 0 6px var(--green)',
              }} />
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Grid Secure</span>
            </div>
            <div style={{ width: 1, height: 16, background: 'var(--border-lit)' }} />
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: '#fff',
            }}>
              {user?.regulator?.slice(0, 1).toUpperCase() || 'R'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-void)' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
