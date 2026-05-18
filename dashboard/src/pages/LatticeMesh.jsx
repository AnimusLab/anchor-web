import React, { useState } from 'react';
import TacticalLattice from '../components/dashboard/TacticalLattice';

export default function LatticeMesh() {
  const [selectedNode, setSelectedNode] = useState(null);

  // Mock nodes to feed into TacticalLattice
  const mockHubs = [
    { id: 'AN-ROOT-01', type: 'ROOT', name: 'Anchor Core', region: 'Global', status: 'ACTIVE' },
    { id: 'AN-SPOKE-02', type: 'SPOKE', name: 'Credit Scoring Engine', region: 'US-East', status: 'ACTIVE' },
    { id: 'AN-SPOKE-03', type: 'SPOKE', name: 'Retail Chatbot', region: 'EU-West', status: 'VIOLATION' },
    { id: 'AN-SPOKE-04', type: 'SPOKE', name: 'Fraud Mesh', region: 'AP-South', status: 'ACTIVE' },
  ];

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24, height: '100%' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Lattice Mesh Visualization</div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Live cryptographic topology of all agents and hubs in the Sovereign network.</div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button style={{ padding: '8px 16px', background: 'var(--bg-surface)', border: '1px solid var(--border-lit)', borderRadius: 6, color: 'var(--text-primary)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            Filter Nodes
          </button>
          <button style={{ padding: '8px 16px', background: 'var(--bg-surface)', border: '1px solid var(--border-lit)', borderRadius: 6, color: 'var(--text-primary)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            Export Topology
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, flex: 1, minHeight: 0 }}>
        
        {/* The 3D Mesh */}
        <div className="ra-card" style={{ position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ position: 'absolute', top: 20, left: 24, zIndex: 5, pointerEvents: 'none' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Encrypted Telemetry</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>PROTOCOL_v5.8 // PROOF_OF_INTEGRITY</div>
          </div>
          
          <div style={{ flex: 1, position: 'relative', cursor: 'crosshair' }} onClick={() => setSelectedNode(mockHubs[1])}>
             <TacticalLattice projects={mockHubs} department="Governance" />
          </div>
        </div>

        {/* Node Inspector Panel */}
        <div className="ra-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Node Inspector</div>
          </div>
          
          <div style={{ padding: 20, flex: 1, overflowY: 'auto' }}>
            {selectedNode ? (
              <div className="fade-in">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: selectedNode.status === 'ACTIVE' ? 'var(--green)' : 'var(--red)', boxShadow: `0 0 8px ${selectedNode.status === 'ACTIVE' ? 'var(--green)' : 'var(--red)'}` }} />
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{selectedNode.id}</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Node Type</div>
                    <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{selectedNode.type}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Project Context</div>
                    <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{selectedNode.name}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Data Sovereign Region</div>
                    <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{selectedNode.region}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Cryptographic Status</div>
                    <div style={{ fontSize: 13, color: selectedNode.status === 'ACTIVE' ? 'var(--green)' : 'var(--red)' }}>{selectedNode.status}</div>
                  </div>
                </div>

                <div style={{ marginTop: 32 }}>
                  <button style={{ width: '100%', padding: '10px', background: 'var(--bg-surface)', border: '1px solid var(--border-lit)', borderRadius: 6, color: 'var(--text-primary)', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}>
                    View Raw Telemetry
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.5 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 32, height: 32, marginBottom: 12 }}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Select a node in the mesh</div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
