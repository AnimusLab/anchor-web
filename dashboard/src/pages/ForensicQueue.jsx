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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#f0ad4e', letterSpacing: '0.05em' }}>{requests.length} PENDING ACTIVATIONS</span>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#444' }}>Loading queue...</div>
        ) : requests.length === 0 ? (
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
                    <div style={{ fontSize: 14, color: '#ccc' }}>{req.requester || req.auditor_name}</div>
                    <div style={{ fontSize: 11, color: '#444' }}>{req.type || 'FORENSIC_PULL'}</div>
                  </td>
                  <td style={{ padding: 12 }}>
                    <div style={{ fontSize: 13, color: '#aaa', fontWeight: 600 }}>{req.capability || 'Emergency Forensic Pull'}</div>
                    <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                      <span style={{ color: '#888', fontWeight: 700 }}>JUSTIFICATION:</span> {req.justification || req.purpose || 'Institutional Audit'}
                    </div>
                  </td>
                  <td style={{ padding: 12 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button 
                        onClick={() => handleAction(req.id, req.type || 'FORENSIC_PULL', 'APPROVED')}
                        style={{ padding: '6px 12px', backgroundColor: '#fff', border: 'none', color: '#000', borderRadius: 4, fontWeight: 700, cursor: 'pointer', fontSize: 12 }}
                      >
                        AUTHORIZE
                      </button>
                      <button 
                        onClick={() => handleAction(req.id, req.type || 'FORENSIC_PULL', 'DENIED')}
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
