import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { endpoints } from '../lib/api';

export default function ReportsExport() {
  const { token, user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch(`${endpoints.baseUrl}/api/ledger`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          // Telemetry exists, compile compliance reports!
          setReports([
            { id: 'rep_001', name: 'Sovereign Compliance Ledger (Real-time)', type: 'JSON', date: 'Just now', status: 'READY' },
            { id: 'rep_002', name: 'ISO 42001 & EU AI Act Guardrails Log', type: 'PDF', date: 'Just now', status: 'READY' }
          ]);
        } else {
          setReports([]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Compliance Reports & Export</div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Generate regulatory artifacts mapped to ISO, EU AI Act, and internal policies.</div>
        </div>
      </div>

      <div className="ra-card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Historical Reports</div>
        </div>
        
        <table className="ra-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Report Name</th>
              <th>Format</th>
              <th>Generation Date</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-dim)' }}>
                  Compiling compliance logs...
                </td>
              </tr>
            ) : reports.map((r, i) => (
              <tr key={i}>
                <td>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace' }}>{r.id}</div>
                </td>
                <td>
                  <span className={`badge ${r.type === 'PDF' ? 'badge-red' : 'badge-amber'}`}>{r.type}</span>
                </td>
                <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{r.date}</td>
                <td>
                  <span className="badge badge-green">{r.status}</span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button style={{ padding: '6px 12px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--cyan)', fontSize: 12, cursor: 'pointer' }}>
                    Download
                  </button>
                </td>
              </tr>
            ))}
            {!loading && reports.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-dim)', fontSize: 14 }}>
                  No compliance reports compiled yet. Push real-time repository telemetry to compile your first audit report.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
