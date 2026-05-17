import React, { useState } from 'react';

const MOCK_REPORTS = [
  { id: 'rep_004', name: 'Q3 EU AI Act Alignment', type: 'PDF', date: '2 days ago', status: 'READY' },
  { id: 'rep_003', name: 'ISO 42001 Audit Log', type: 'JSON', date: '1 week ago', status: 'READY' },
];

export default function ReportsExport() {
  const [reports] = useState(MOCK_REPORTS);

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Compliance Reports & Export</div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Generate regulatory artifacts mapped to ISO, EU AI Act, and internal policies.</div>
        </div>
        <button style={{ padding: '8px 16px', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          Generate New Report
        </button>
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
            {reports.map((r, i) => (
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
          </tbody>
        </table>
      </div>
    </div>
  );
}
