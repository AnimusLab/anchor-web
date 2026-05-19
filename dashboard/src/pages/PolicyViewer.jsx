import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function PolicyViewer() {
  const { user } = useAuth();
  const [activeFile, setActiveFile] = useState('constitution.anchor');

  const compiledConstitution = `type: manifest
version: 5.0.4
anchor_version: '>=5.0.0'
name: Anchor Constitutional Root

core_domains:
  - path: domains/security.anchor
    namespace: SEC
    required: true
    active: true
  - path: domains/ethics.anchor
    namespace: ETH
    required: true
    active: true
  - path: domains/shared.anchor
    namespace: SHR
    required: true
    active: true
  - path: domains/alignment.anchor
    namespace: ALN
    required: true
    active: true
  - path: domains/agentic.anchor
    namespace: AGT
    required: true
    active: true
  - path: domains/privacy.anchor
    namespace: PRV
    required: true
    active: true

frameworks:
  - path: frameworks/FINOS_Framework.anchor
    namespace: FINOS
    source: FINOS AI Governance Framework
    active: true
  - path: frameworks/OWASP_LLM.anchor
    namespace: OWASP
    source: OWASP LLM Top 10 2025
    active: true

regulators:
  - path: government/RBI_Regulations.anchor
    namespace: RBI
    source: RBI FREE-AI Report August 2025
    active: true
  - path: government/EU_AI_Act.anchor
    namespace: EU
    source: EU AI Act 2024/1689
    active: true

policy:
  path: policy.anchor
  enforce_raise_only: true
  allow_custom_rules: true
  custom_rule_prefix: INTERNAL
`;

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
            <pre style={{ margin: 0, fontFamily: 'JetBrains Mono, monospace', fontSize: 14, color: '#C9D1D9', lineHeight: 1.6 }}>
              {activeFile === 'constitution.anchor' ? compiledConstitution : compiledPolicy}
            </pre>
          </div>
        </div>

      </div>
    </div>
  );
}
