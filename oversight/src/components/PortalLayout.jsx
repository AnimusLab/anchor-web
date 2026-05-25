import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Icon = {
  overview: <svg viewBox="0 0 20 20" fill="currentColor" className="icon"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>,
  ledger:   <svg viewBox="0 0 20 20" fill="currentColor" className="icon"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/></svg>,
  chain:    <svg viewBox="0 0 20 20" fill="currentColor" className="icon"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>,
  trend:    <svg viewBox="0 0 20 20" fill="currentColor" className="icon"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/></svg>,
  ticker:   <svg viewBox="0 0 20 20" fill="currentColor" className="icon"><path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v3a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v2a1 1 0 102 0V9z" clipRule="evenodd"/></svg>,
  search:   <svg viewBox="0 0 20 20" fill="currentColor" className="icon"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/></svg>,
  globe:    <svg viewBox="0 0 20 20" fill="currentColor" className="icon"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd"/></svg>,
  heatmap:  <svg viewBox="0 0 20 20" fill="currentColor" className="icon"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/></svg>,
  trail:    <svg viewBox="0 0 20 20" fill="currentColor" className="icon"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>,
  enforce:  <svg viewBox="0 0 20 20" fill="currentColor" className="icon"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>,
  profile:  <svg viewBox="0 0 20 20" fill="currentColor" className="icon"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/></svg>,
  logout:   <svg viewBox="0 0 20 20" fill="currentColor" className="icon"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"/></svg>,
};

const NAV = [
  {
    section: 'OVERSIGHT & ANALYTICS',
    items: [
      { label: 'Overview',              icon: Icon.overview, path: '/dashboard'    },
      { label: 'Decision Ledger',       icon: Icon.ledger,   path: '/ledger'       },
      { label: 'Chain Verifier',        icon: Icon.chain,    path: '/chain'        },
      { label: 'Compliance Trend',      icon: Icon.trend,    path: '/trend'        },
      { label: 'Forensic Heatmap',      icon: Icon.heatmap,  path: '/heatmap'      },
      { label: 'Cross-Entity Search',   icon: Icon.search,   path: '/search'       },
      { label: 'Jurisdiction Summary',  icon: Icon.globe,    path: '/jurisdiction' },
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
      { label: 'Issue Notice',    icon: Icon.enforce,  path: '/enforce', capability: 'can_enforce' },
    ]
  },
  {
    section: 'MY CLEARANCE',
    items: [
      { label: 'My Audit Trail', icon: Icon.trail,   path: '/audit-trail' },
      { label: 'My Profile',     icon: Icon.profile,  path: '/profile'     },
    ]
  },
];

export default function PortalLayout({ children }) {
  const { user, token, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [avatar, setAvatar] = useState(user?.avatar || null);

  useEffect(() => {
    if (user?.avatar) setAvatar(user.avatar);
  }, [user?.avatar]);

  // Watchlist Violation Check
  const [hasNewBreach, setHasNewBreach] = useState(false);

  useEffect(() => {
    const checkBreaches = async () => {
      const watchlist = JSON.parse(localStorage.getItem('anchor_watchlist') || '[]');
      if (watchlist.length === 0) { setHasNewBreach(false); return; }

      try {
        const res = await fetch(`${endpoints.baseUrl}/api/ledger`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        
        const breachFound = data.some(entry => {
          if (entry.is_compliant) return false;
          const watched = watchlist.find(w => w.id === (entry.hub_id || entry.project_name));
          if (!watched) return false;
          // Check if breach is newer than our last acknowledged check
          return new Date(entry.timestamp) > new Date(watched.lastSeen);
        });
        
        setHasNewBreach(breachFound);
      } catch (e) { console.error("Watchlist check failed", e); }
    };

    if (token) {
      checkBreaches();
      const interval = setInterval(checkBreaches, 60000); // Check every minute
      return () => clearInterval(interval);
    }
  }, [token, location.pathname]); // Re-check on path change to clear badge if ledger is visited

  // Clear breach indicator when entering ledger
  useEffect(() => {
    if (location.pathname === '/ledger') {
      const watchlist = JSON.parse(localStorage.getItem('anchor_watchlist') || '[]');
      const updated = watchlist.map(w => ({ ...w, lastSeen: new Date().toISOString() }));
      localStorage.setItem('anchor_watchlist', JSON.stringify(updated));
      setHasNewBreach(false);
    }
  }, [location.pathname]);

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
          {NAV.map(group => {
            const visibleItems = group.items.filter(item => {
              if (item.capability && !user?.capabilities?.[item.capability]) return false;
              return true;
            });
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.section}>
                <div className="section-label">{group.section}</div>
                {visibleItems.map(item => (
                  <div
                    key={item.path}
                    className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                    onClick={() => navigate(item.path)}
                    style={item.path === '/ledger' && hasNewBreach ? {
                      boxShadow: '0 0 15px rgba(239, 68, 68, 0.4)',
                      border: '1px solid var(--red)',
                      animation: 'pulse 1.5s infinite'
                    } : {}}
                  >
                    {item.icon}
                    {item.label}
                    {item.path === '/ledger' && hasNewBreach && (
                      <span style={{ 
                        marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', 
                        background: 'var(--red)', boxShadow: '0 0 8px var(--red)' 
                      }} />
                    )}
                  </div>
                ))}
              </div>
            );
          })}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="forensic-header" style={{ fontSize: 18, color: 'var(--text-primary)' }}>{pageLabel}</div>
            <div className="forensic-stamp" style={{ color: 'var(--amber)', transform: 'rotate(-2deg)' }}>OFFICIAL RECORD</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 6px var(--green)' }} />
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Grid Secure</span>
            </div>
            <div style={{ width: 1, height: 16, background: 'var(--border-lit)' }} />
            <div onClick={() => navigate('/profile')} style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', cursor: 'pointer', overflow: 'hidden', flexShrink: 0 }}>
              {avatar
                ? <img src={avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                : (user?.name?.slice(0,1) || user?.regulator?.slice(0,1) || 'R').toUpperCase()
              }
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
