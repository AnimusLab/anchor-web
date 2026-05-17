import React, { useState } from 'react';

const MOCK_POLICY = `[ANCHOR_CONSTITUTION]
Version: 5.8
Hash: 9a7b...8f21
Enforcement: STRICT

[RULES]
1. No unencrypted PII leaves the isolated runtime.
2. All model drifts > 5% require Owner approval.
3. Chatbots must enforce content safety filters (Level: High).
4. Raw data pulls require manual Auditor justification.
`;

export default function PolicyViewer() {
  const [activeFile, setActiveFile] = useState('constitution.anchor');

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
            {['constitution.anchor', 'policy.anchor', 'mesh_rules.json'].map(file => (
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
            <button style={{ padding: '6px 16px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              Propose Edit
            </button>
          </div>
          <div style={{ flex: 1, padding: 20, overflowY: 'auto', background: '#0D1117' }}>
            <pre style={{ margin: 0, fontFamily: 'JetBrains Mono, monospace', fontSize: 14, color: '#C9D1D9', lineHeight: 1.6 }}>
              {activeFile === 'constitution.anchor' ? MOCK_POLICY : `// Contents of ${activeFile}\n\n// Awaiting sync from Hub...`}
            </pre>
          </div>
        </div>

      </div>
    </div>
  );
}
