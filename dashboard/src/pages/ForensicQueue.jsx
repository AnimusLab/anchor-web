import React, { useState } from 'react';

const MOCK_REQUESTS = [
  { id: 'req_881', auditor: 'M. Chen', scope: 'Retail Chatbot PII Logs', reason: 'Investigating potential data leak in customer service routing.', time: '2 hours ago', status: 'PENDING' },
  { id: 'req_875', auditor: 'J. Smith', scope: 'Credit Score Weights', reason: 'Routine fair lending audit for Q3 compliance.', time: '1 day ago', status: 'APPROVED' },
];

export default function ForensicQueue() {
  const [requests, setRequests] = useState(MOCK_REQUESTS);

  const handleAction = (id, action) => {
    setRequests(reqs => reqs.map(r => r.id === id ? { ...r, status: action } : r));
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
              <th>Data Scope</th>
              <th>Justification</th>
              <th>Time</th>
              <th style={{ textAlign: 'center' }}>Decision</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => (
              <tr key={req.id}>
                <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text-secondary)' }}>
                  {req.id}
                </td>
                <td>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{req.auditor}</div>
                </td>
                <td>
                  <span className="badge badge-purple">{req.scope}</span>
                </td>
                <td style={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: 13, color: 'var(--text-dim)' }}>
                  {req.reason}
                </td>
                <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{req.time}</td>
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
            {requests.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-dim)' }}>
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
