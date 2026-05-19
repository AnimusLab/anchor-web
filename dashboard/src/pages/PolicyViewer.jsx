import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function PolicyViewer() {
  const { user } = useAuth();
  const [activeFile, setActiveFile] = useState('constitution.anchor');

  const compiledConstitution = `[ANCHOR_FOUNDATION_NODE]
# IMMUTABLE CRYPTOGRAPHIC LEDGER
# This file defines the core, uneditable sovereign rules of the Anchor Engine.
# Modifications are restricted to Anchor Core Members via Multi-Sig consensus.

Network_ID: ANCHOR-ROOT-${(user?.org_id || 'AN').toUpperCase()}
Consensus_Protocol: PROOF_OF_INTEGRITY
Sovereign_Jurisdiction: ${(user?.region || 'GLOBAL').toUpperCase()}
Active_Spoke_Handle: ${(user?.sub || 'PENDING')}

[CORE_DIRECTIVES]
0x01: NODE_ISOLATION_ENFORCED
0x02: ZERO_KNOWLEDGE_PROOFS_REQUIRED
0x03: UNAUTHORIZED_PII_EGRESS_FATAL
0x04: AUDIT_LEDGER_APPEND_ONLY
`;

  const compiledPolicy = `[${(user?.hub_id || 'ENTERPRISE_HUB').toUpperCase()}_POLICY]
# Local Hub settings synced from Anchor Root. Read Only.

Hub_Callsign: ${user?.hub_name || 'AN-IN-SOL01 animuslab Solapur Branch'}
Organization: ${user?.org_id || 'animuslab'}
Sovereign_Region: ${user?.region || 'IN'}
Max_Agent_Count: 50
Telemetry_Ping_Rate: 30s
Forensic_Retention: 365_DAYS
Silo_Activation_Key: ${(user?.regional_key || 'sk_live_...').slice(0, 16)}... [SECURE]
`;

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24, height: '100%', overflow: 'hidden' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Policy Management</div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>View and manage cryptographic rule files for your Hub.</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: 24, flex: 1, overflow: 'hidden' }}>
        
        {/* File Explorer */}
        <div className="ra-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Hub Configuration
          </div>
          <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {['constitution.anchor', 'policy.anchor'].map(file => (
              <div 
                key={file}
                onClick={() => setActiveFile(file)}
                style={{ 
                  padding: '10px 14px', borderRadius: 6, cursor: 'pointer',
                  fontSize: 13, fontFamily: 'JetBrains Mono, monospace',
                  background: activeFile === file ? 'var(--bg-surface)' : 'transparent',
                  color: activeFile === file ? 'var(--cyan)' : 'var(--text-secondary)',
                  border: `1px solid ${activeFile === file ? 'var(--border-lit)' : 'transparent'}`
                }}
              >
                {file}
              </div>
            ))}
          </div>
        </div>

        {/* Editor */}
        <div className="ra-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 13, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-primary)' }}>
              {activeFile}
            </div>
            <span className="badge badge-purple">READ ONLY</span>
          </div>
          <div style={{ flex: 1, padding: 20, overflowY: 'auto', background: '#0D1117' }}>
            <pre style={{ margin: 0, fontFamily: 'JetBrains Mono, monospace', fontSize: 14, color: '#C9D1D9', lineHeight: 1.6 }}>
              {activeFile === 'constitution.anchor' ? compiledConstitution : compiledPolicy}
            </pre>
          </div>
        </div>

      </div>
    </div>
  );
}
