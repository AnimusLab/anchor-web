import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { endpoints } from '../lib/api';

export default function PolicyViewer() {
  const { user, token } = useAuth();
  const [activeFile, setActiveFile] = useState('constitution.anchor');
  const [constitution, setConstitution] = useState('Loading governance manifest...');

  useEffect(() => {
    if (activeFile === 'constitution.anchor') {
      fetch(`${endpoints.baseUrl}/api/governance/constitution`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(r => r.json())
      .then(data => setConstitution(data.content || 'Error loading manifest.'))
      .catch(() => setConstitution('Failed to connect to Governance Hub.'));
    }
  }, [activeFile, token]);

  const compiledPolicy = `# =============================================================================
# POLICY — Project Policy
# =============================================================================
# This is FORGE project-specific sovereign rules.
# Automatically loaded by the Anchor Governance Engine.
#

version: "4.0"

metadata:
  project: "forge"
  org: "${(user?.org_id || 'animuslab')}"
  maintainer: "ciso@${(user?.org_id || 'animuslab')}.com"
  spoke_handle: "${(user?.sub || 'OWN-AN-SOLAPUR-990')}"
  hub_id: "${(user?.hub_id || 'AN-IN-SOL01')}"

custom_rules:
  - id: INTERNAL-001
    name: "Vault Access Outside Approved Namespace"
    severity: blocker
    category: security
    description: >
      Vault read operations must only access the approved_keys
      namespace. Broad vault access exposes all secrets.
    detection:
      method: regex
      pattern: 'vault\\.read\\((?!approved_keys)'
      context_required: code_execution

  - id: INTERNAL-002
    name: "Unapproved AI Model Endpoint"
    severity: blocker
    category: security
    description: >
      Only approved internal model endpoints may be called.
      External endpoints bypass the governed proxy layer.
    detection:
      method: regex
      pattern: 'model_endpoint.*(?!approved-models\\.internal)'
      context_required: code_execution
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
            <pre style={{ margin: 0, fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#C9D1D9', lineHeight: 1.6 }}>
              {activeFile === 'constitution.anchor' ? constitution : compiledPolicy}
            </pre>
          </div>
        </div>

      </div>
    </div>
  );
}
