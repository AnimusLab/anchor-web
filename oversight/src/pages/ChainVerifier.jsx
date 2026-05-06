import React, { useState, useEffect } from 'react';
import PortalLayout from '../components/PortalLayout';
import { useAuth } from '../contexts/AuthContext';
import { endpoints } from '../lib/api';

export default function ChainVerifier() {
  const { token } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [selected, setSelected]  = useState(null);
  const [result, setResult]      = useState(null);
  const [loading, setLoading]    = useState(false);

  useEffect(() => {
    fetch(`${endpoints.baseUrl}/api/ledger`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(data => {
        const map = {};
        data.forEach(e => {
          if (!map[e.entity_id]) map[e.entity_id] = { id: e.entity_id, name: e.project_name || e.entity_id };
        });
        setCompanies(Object.values(map));
      });
  }, [token]);

  const verify = async () => {
    if (!selected) return;
    setLoading(true); setResult(null);
    try {
      const r = await fetch(`${endpoints.baseUrl}/api/audit/${selected.id}/verify`, { headers: { Authorization: `Bearer ${token}` } });
      setResult(await r.json());
    } catch(e) { console.error(e); } finally { setLoading(false); }
  };

  const intact = result?.verification_rate === 1;

  return (
    <PortalLayout>
      <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Chain Verifier</div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Cryptographically verify the integrity of an entity's entire decision chain.</div>
        </div>

        {/* Entity picker + verify button */}
        <div className="ra-card" style={{ padding: '20px 24px', display: 'flex', gap: 16, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Select Entity</div>
            <select value={selected?.id || ''} onChange={e => setSelected(companies.find(c => c.id === e.target.value) || null)} className="ra-select">
              <option value="">— Choose a company —</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <button onClick={verify} disabled={!selected || loading} style={{ padding: '10px 24px', borderRadius: 6, background: selected ? 'var(--accent)' : 'var(--border)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, cursor: selected ? 'pointer' : 'not-allowed', opacity: loading ? 0.7 : 1, transition: 'all 0.15s' }}>
            {loading ? 'Verifying...' : 'Run Verification →'}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="ra-card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: intact ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{selected?.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{result.chain?.length} entries verified</div>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 700, color: intact ? 'var(--green)' : 'var(--red)' }}>{Math.round((result.verification_rate || 0) * 100)}%</div>
                <span className={`badge ${intact ? 'badge-green' : 'badge-red'}`}>{intact ? 'CHAIN INTACT' : 'ANOMALY DETECTED'}</span>
              </div>
            </div>
            <div style={{ overflowY: 'auto', maxHeight: '55vh' }}>
              <table className="ra-table">
                <thead><tr><th>#</th><th>Entry ID</th><th>Chain Hash</th><th>Status</th></tr></thead>
                <tbody>
                  {result.chain?.map((c, i) => (
                    <tr key={i}>
                      <td style={{ color: 'var(--text-dim)', fontSize: 12 }}>{i + 1}</td>
                      <td className="mono" style={{ fontSize: 11 }}>{c.entry_id?.slice(0,20)}…</td>
                      <td className="mono" style={{ fontSize: 11, color: 'var(--text-dim)' }}>{c.chain_hash?.slice(0,24)}…</td>
                      <td><span className={`badge ${c.status === 'VERIFIED' ? 'badge-green' : 'badge-red'}`}>{c.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!result && !loading && (
          <div className="ra-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔗</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>Select an entity and run verification</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>The verifier checks every cryptographic hash in the decision chain for tampering.</div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
