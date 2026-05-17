import React, { useState } from 'react';

const MOCK_PROJECTS = [
  { id: 'prj_credit_score_v4', name: 'Credit Scoring Engine v4', repo: 'animus/credit-ai', status: 'COMPLIANT', agents: 3, lastAudit: '2 hours ago' },
  { id: 'prj_chatbot_retail', name: 'Retail Customer Chatbot', repo: 'animus/retail-bot', status: 'VIOLATION', agents: 1, lastAudit: '12 mins ago' },
  { id: 'prj_fraud_detect', name: 'Fraud Detection Mesh', repo: 'animus/fraud-mesh', status: 'COMPLIANT', agents: 5, lastAudit: '1 day ago' },
];

export default function ProjectInventory() {
  const [projects] = useState(MOCK_PROJECTS);

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Project & Agent Inventory</div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Overview of all AI models, agents, and codebases governed by this Hub.</div>
        </div>
        <button style={{ padding: '8px 16px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          + Register New Project
        </button>
      </div>

      <div className="ra-card" style={{ overflow: 'hidden' }}>
        <table className="ra-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Project Entity</th>
              <th>Repository / Source</th>
              <th>Active Agents</th>
              <th>Compliance Status</th>
              <th>Last Audit Pulse</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p, i) => (
              <tr key={i}>
                <td>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace' }}>{p.id}</div>
                </td>
                <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text-secondary)' }}>
                  {p.repo}
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--cyan)', boxShadow: '0 0 4px var(--cyan)' }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{p.agents}</span>
                  </div>
                </td>
                <td>
                  <span className={`badge ${p.status === 'COMPLIANT' ? 'badge-green' : 'badge-red'}`}>
                    {p.status}
                  </span>
                </td>
                <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.lastAudit}</td>
                <td style={{ textAlign: 'right' }}>
                  <button style={{ padding: '6px 12px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer' }}>
                    View Mesh
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
