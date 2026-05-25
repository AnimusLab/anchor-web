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

  const handleAction = async (id, type, action) => {
    try {
      const endpoint = type === 'GOVERNANCE_ACTIVATION' 
        ? `${endpoints.baseUrl}/api/governance/approve-access`
        : `${endpoints.baseUrl}/api/forensic/approve/${id}`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(
          type === 'GOVERNANCE_ACTIVATION' 
          ? { request_id: id, status: action }
          : { status: action }
        )
      });
      
      if (response.ok) {
        setRequests(reqs => reqs.filter(r => r.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24, height: '100%', backgroundColor: '#000', color: '#eee' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 6 }}>Governance Activation Queue</div>
          <div style={{ fontSize: 13, color: '#888', letterSpacing: '0.04em' }}>Review institutional access requests and authorize authority delegation.</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {requests.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#444', border: '1px dashed #222', borderRadius: 8 }}>
            No pending governance activations.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #222' }}>
                <th style={{ padding: 12, fontSize: 11, color: '#555', textTransform: 'uppercase' }}>Scope/Hub</th>
                <th style={{ padding: 12, fontSize: 11, color: '#555', textTransform: 'uppercase' }}>Requester</th>
                <th style={{ padding: 12, fontSize: 11, color: '#555', textTransform: 'uppercase' }}>Capability / Purpose</th>
                <th style={{ padding: 12, fontSize: 11, color: '#555', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: 12, fontSize: 11, color: '#555', textTransform: 'uppercase' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(req => (
                <tr key={req.id} style={{ borderBottom: '1px solid #111' }}>
                  <td style={{ padding: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{req.hub_id}</div>
                    <div style={{ fontSize: 11, color: '#444' }}>ID: {req.id}</div>
                  </td>
                  <td style={{ padding: 12 }}>
                    <div style={{ fontSize: 14, color: '#ccc' }}>{req.requester}</div>
                    <div style={{ fontSize: 11, color: '#444' }}>{req.type}</div>
                  </td>
                  <td style={{ padding: 12 }}>
                    <div style={{ fontSize: 13, color: '#aaa', fontWeight: 600 }}>{req.capability}</div>
                    <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                      <span style={{ color: '#888', fontWeight: 700 }}>{req.purpose.toUpperCase()}:</span> {req.justification}
                    </div>
                  </td>
                  <td style={{ padding: 12 }}>
                    <div style={{ fontSize: 12, color: '#f0ad4e' }}>PENDING</div>
                  </td>
                  <td style={{ padding: 12 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button 
                        onClick={() => handleAction(req.id, req.type, 'APPROVED')}
                        style={{ padding: '6px 12px', backgroundColor: '#fff', border: 'none', color: '#000', borderRadius: 4, fontWeight: 700, cursor: 'pointer', fontSize: 12 }}
                      >
                        AUTHORIZE
                      </button>
                      <button 
                        onClick={() => handleAction(req.id, req.type, 'DENIED')}
                        style={{ padding: '6px 12px', backgroundColor: 'transparent', border: '1px solid #333', color: '#888', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}
                      >
                        DENY
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
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
