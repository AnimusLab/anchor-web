import React, { useState, useEffect, useMemo } from 'react';
import PortalLayout from '../components/PortalLayout';
import { useAuth } from '../contexts/AuthContext';
import { endpoints } from '../lib/api';

const V = {
  void: '#0a0a0f',
  surface: '#111118',
  border: '#1e1e2e',
  borderLit: '#2a2a3e',
  muted: '#555570',
  dim: '#35354a',
  red: '#ef4444',
  green: '#10b981',
  amber: '#f59e0b',
  cyan: '#06b6d4',
  accent: '#7c3aed'
};

/**
 * Forensic Heatmap Component
 * Visualizes violation density across Entities (Y) and Time (X)
 */
export default function ForensicHeatmap() {
  const { token } = useAuth();
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${endpoints.baseUrl}/api/ledger`, { 
        headers: { Authorization: `Bearer ${token}` } 
    })
    .then(r => r.json())
    .then(setLedger)
    .catch(console.error)
    .finally(() => setLoading(false));
  }, [token]);

  // Transform ledger data into Grid: Entity vs Last 30 Days
  const grid = useMemo(() => {
    if (!ledger.length) return [];
    
    const entities = {};
    const days = 30;
    const now = new Date();
    
    // Group by entity
    ledger.forEach(e => {
        const id = e.entity_id || 'unknown';
        if (!entities[id]) entities[id] = { name: e.project_name || id, points: new Array(days).fill(0) };
        
        const timestamp = new Date(e.timestamp);
        const diffDays = Math.floor((now - timestamp) / (1000 * 60 * 60 * 24));
        
        if (diffDays < days && diffDays >= 0 && !e.is_compliant) {
            entities[id].points[days - 1 - diffDays]++;
        }
    });

    return Object.values(entities).sort((a, b) => b.points.reduce((s,v)=>s+v,0) - a.points.reduce((s,v)=>s+v,0));
  }, [ledger]);

  const getHeatColor = (count) => {
    if (count === 0) return 'rgba(255,255,255,0.03)';
    if (count === 1) return 'rgba(239, 68, 68, 0.2)';
    if (count < 5) return 'rgba(239, 68, 68, 0.5)';
    return 'rgba(239, 68, 68, 0.9)';
  };

  return (
    <PortalLayout>
      <div style={{ padding: 40, background: V.void, minHeight: '100%' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 className="forensic-header" style={{ fontSize: 24, color: '#fff' }}>Forensic Heatmap</h1>
          <p style={{ color: V.muted, fontSize: 13, marginTop: 4 }}>Visualizing violation density across the sovereign mesh over the last 30 days.</p>
        </div>

        {loading ? (
          <div style={{ color: V.muted }}>Hydrating heatmap logic...</div>
        ) : (
          <div style={{ background: V.surface, border: `1px solid ${V.border}`, borderRadius: 8, padding: 24 }}>
            <div style={{ display: 'flex' }}>
              <div style={{ width: 220, borderRight: `1px solid ${V.border}`, paddingRight: 12 }}>
                <div style={{ height: 20, fontSize: 10, color: V.dim, fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>Entity / Hub</div>
                {grid.map(row => (
                  <div key={row.name} style={{ height: 32, fontSize: 12, color: V.muted, display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {row.name}
                  </div>
                ))}
              </div>
              <div style={{ flex: 1, paddingLeft: 12, overflowX: 'auto' }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                   {new Array(30).fill(0).map((_, i) => (
                      <div key={i} style={{ flex: 1, minWidth: 20, fontSize: 9, color: V.dim, textAlign: 'center' }}>
                        {30-i}
                      </div>
                   ))}
                </div>
                {grid.map(row => (
                  <div key={row.name} style={{ display: 'flex', gap: 4, height: 32, alignItems: 'center' }}>
                    {row.points.map((count, i) => (
                      <div 
                        key={i} 
                        title={`${count} Violations detected ${30-i} days ago`}
                        style={{ 
                          flex: 1, 
                          minWidth: 20,
                          height: 24, 
                          background: getHeatColor(count),
                          borderRadius: 2,
                          transition: 'all 0.2s'
                        }} 
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
            
            <div style={{ marginTop: 32, borderTop: `1px solid ${V.border}`, paddingTop: 20, display: 'flex', gap: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 2, background: 'rgba(255,255,255,0.03)' }} />
                    <span style={{ fontSize: 11, color: V.muted }}>No Violations</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 2, background: 'rgba(239, 68, 68, 0.2)' }} />
                    <span style={{ fontSize: 11, color: V.muted }}>Minor Activity</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 2, background: 'rgba(239, 68, 68, 0.9)' }} />
                    <span style={{ fontSize: 11, color: V.muted }}>Critical Breach Density</span>
                </div>
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
