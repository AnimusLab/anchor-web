import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { endpoints } from '../lib/api';

export default function ForensicQueue() {
  const { token } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch(`${endpoints.baseUrl}/api/forensic/pending`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRequests(data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const handleAction = async (id, action) => {
    try {
      const res = await fetch(`${endpoints.baseUrl}/api/forensic/approve/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: action })
      });
      if (res.ok) {
        setRequests(reqs => reqs.map(r => r.id === id ? { ...r, status: action } : r));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24, height: '100%' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Forensic Pull Approval Queue</div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Review and authorize Regulator requests for raw cryptographic data.</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--amber)', letterSpacing: '0.05em' }}>{requests.filter(r => r.status === 'PENDING').length} PENDING PULLS</span>
        </div>
      </div>

      <div className="ra-card" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <table className="ra-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Auditor / Authority</th>
              <th>Hub / Spoke</th>
              <th>Time</th>
              <th style={{ textAlign: 'center' }}>Decision</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-dim)' }}>
                  Loading forensic requests...
                </td>
              </tr>
            ) : requests.map(req => (
              <tr key={req.id}>
                <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text-secondary)' }}>
                  {req.id}
                </td>
                <td>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{req.auditor_name} (ID: {req.auditor_id})</div>
                </td>
                <td>
                  <span className="badge badge-purple">{req.hub_id}</span>
                </td>
                <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{req.created_at}</td>
                <td style={{ textAlign: 'center' }}>
                  {req.status === 'PENDING' ? (
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                      <button onClick={() => handleAction(req.id, 'APPROVED')} style={{ padding: '6px 12px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 4, color: 'var(--green)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                        Authorize
                      </button>
                      <button onClick={() => handleAction(req.id, 'DENIED')} style={{ padding: '6px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 4, color: 'var(--red)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className={`badge ${req.status === 'APPROVED' ? 'badge-green' : 'badge-red'}`}>
                      {req.status}
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {!loading && requests.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-dim)' }}>
                  No forensic pulls pending.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
