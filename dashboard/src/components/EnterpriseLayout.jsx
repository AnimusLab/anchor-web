import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const V = {
  primary: 'var(--text-primary)', secondary: 'var(--text-secondary)',
  muted: 'var(--text-muted)', dim: 'var(--text-dim)',
  card: 'var(--bg-card)', surface: 'var(--bg-surface)', void: 'var(--bg-void)',
  border: 'var(--border)', borderLit: 'var(--border-lit)',
  green: 'var(--green)', red: 'var(--red)', amber: 'var(--amber)',
  accent: 'var(--accent)', 'accent-soft': 'var(--accent-soft)',
  cyan: 'var(--cyan)', 'cyan-soft': 'var(--cyan-soft)',
  sidebar: '#0A0C10',
};

const Icon = {
  overview: <svg viewBox="0 0 20 20" fill="currentColor" className="icon"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>,
  lattice:  <svg viewBox="0 0 20 20" fill="currentColor" className="icon"><path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd"/></svg>,
  vault:    <svg viewBox="0 0 20 20" fill="currentColor" className="icon"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/></svg>,
  audit:    <svg viewBox="0 0 20 20" fill="currentColor" className="icon"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/></svg>,
  logout:   <svg viewBox="0 0 20 20" fill="currentColor" className="icon"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"/></svg>,
  profile:  <svg viewBox="0 0 20 20" fill="currentColor" className="icon"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/></svg>,
  users:    <svg viewBox="0 0 20 20" fill="currentColor" className="icon"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg>,
  document: <svg viewBox="0 0 20 20" fill="currentColor" className="icon"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd"/></svg>,
  download: <svg viewBox="0 0 20 20" fill="currentColor" className="icon"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/></svg>,
};

const NAV = [
  {
    section: 'OPERATIONS',
    items: [
      { label: 'Overview',          icon: Icon.overview, path: '/dashboard' },
      { label: 'Project Inventory', icon: Icon.lattice,  path: '/projects' },
      { label: 'Lattice Mesh',      icon: Icon.lattice,  path: '/mesh' },
    ]
  },
  {
    section: 'GOVERNANCE',
    items: [
      { label: 'Violation Feed',    icon: Icon.vault,    path: '/violations' },
      { label: 'Forensic Queue',    icon: Icon.audit,    path: '/forensic' },
      { label: 'Policy Viewer',     icon: Icon.document, path: '/policy' },
      { label: 'Reports & Export',  icon: Icon.download, path: '/reports' },
    ]
  },
  {
    section: 'ADMINISTRATION',
    items: [
      { label: 'Team Management',   icon: Icon.users,    path: '/team' },
      { label: 'My Profile',        icon: Icon.profile,  path: '/profile' },
    ]
  },
];

export default function EnterpriseLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [avatar, setAvatar] = useState(null);

  const orgId = user?.org_id || 'PENDING_ORG';
  const clearanceId = user?.sub || 'PENDING_ID';
  const hubId = user?.hub_id || 'PENDING_HUB';

  useEffect(() => {
    if (user?.sub) {
      const stored = localStorage.getItem(`anchor_avatar_${user.sub}`);
      if (stored) setAvatar(stored);
    }
  }, [user?.sub]);

  useEffect(() => {
    const handler = (e) => { if (e.key?.startsWith('anchor_avatar_')) setAvatar(e.newValue); };
    window.addEventListener('storage', handler);
    const local = (e) => setAvatar(e.detail);
    window.addEventListener('anchor_avatar_update', local);
    return () => { window.removeEventListener('storage', handler); window.removeEventListener('anchor_avatar_update', local); };
  }, []);

  const pageLabel = NAV.flatMap(g => g.items).find(i => i.path === location.pathname)?.label || 'Overview';

  return (
    <div style={{ height: '100vh', display: 'flex', overflow: 'hidden' }}>
      
      {/* SIDEBAR */}
      <aside style={{ width: 220, minWidth: 220, background: V.sidebar, borderRight: `1px solid ${V.border}`, display: 'flex', flexDirection: 'column', overflowY: 'auto', zIndex: 10 }}>
        
        {/* Logo Section */}
        <div style={{ padding: '20px 16px 16px', borderBottom: `1px solid ${V.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, background: V.accent, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg viewBox="0 0 24 24" fill="white" style={{ width: 18, height: 18 }}><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: V.primary }}>Anchor Enterprise</div>
            <div style={{ fontSize: 10, color: V['accent-soft'], letterSpacing: '0.05em', fontWeight: 500 }}>SOVEREIGN RELAY</div>
          </div>
        </div>

        {/* Clearance Badge */}
        <div style={{ margin: '12px 12px 0', padding: '8px 12px', background: 'rgba(6,182,212,0.08)', borderRadius: 6, border: '1px solid rgba(6,182,212,0.2)' }}>
          <div style={{ fontSize: 10, color: V['cyan-soft'], marginBottom: 2, fontWeight: 600 }}>CLEARANCE: {clearanceId}</div>
          <div style={{ fontSize: 11, color: V.secondary, fontFamily: 'JetBrains Mono, monospace', wordBreak: 'break-all' }}>
            ORG: {orgId}
          </div>
        </div>

        {/* Navigation */}
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

        {/* Sidebar Footer */}
        <div style={{ padding: '12px 16px', borderTop: `1px solid ${V.border}` }}>
          <div className="nav-link" onClick={logout} style={{ color: V.muted }}>
            {Icon.logout} Terminate Session
          </div>
          <div style={{ marginTop: 12, fontSize: 11, color: V.dim, fontFamily: 'JetBrains Mono, monospace' }}>
            Anchor v5.8 — Silo
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Header */}
        <header style={{ height: 56, background: V.sidebar, borderBottom: `1px solid ${V.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0, zIndex: 5 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: V.primary }}>{pageLabel.toUpperCase()}</div>
            <div style={{ height: 16, width: 1, background: V.borderLit }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: V.green, boxShadow: '0 0 6px var(--green)' }} />
              <span style={{ fontSize: 12, color: V.secondary }}>HUB: {hubId} // {user?.region || 'GLOBAL'}</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ textAlign: 'right' }}>
               <div style={{ fontSize: 12, fontWeight: 600, color: V.primary }}>{user?.display_name || user?.email}</div>
               <div style={{ fontSize: 9, fontWeight: 700, color: V.accent, letterSpacing: '0.05em' }}>{user?.role?.toUpperCase()}</div>
            </div>
            <div onClick={() => navigate('/profile')} style={{ width: 32, height: 32, borderRadius: '50%', background: V.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', overflow: 'hidden' }}>
               {avatar 
                 ? <img src={avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                 : (user?.display_name || user?.email || 'U').charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main style={{ flex: 1, overflowY: 'auto', background: V.void }}>
          {children}
        </main>
      </div>
    </div>
  );
}
