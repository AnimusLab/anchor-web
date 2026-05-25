import React, { useState } from 'react';

/**
 * Anchor v6.1: Institutional Authority Activation Dialog
 * 
 * Formalizes the transition from 'requested' to 'authorized' access.
 * Requirement: Every privileged action must have a declared intent.
 */
export default function GovernanceActivationModal({ isOpen, onClose, onActivated, capabilityId, hubId }) {
  const [purpose, setPurpose] = useState('audit');
  const [justification, setJustification] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestId, setRequestId] = useState(null);

  const purposes = [
    { value: 'audit', label: 'Forensic Audit' },
    { value: 'investigation', label: 'Incident Investigation' },
    { value: 'legal_inquiry', label: 'Legal/Regulatory Inquiry' },
    { value: 'emergency', label: 'Emergency Operational Analysis' },
    { value: 'internal_review', label: 'Internal Compliance Review' }
  ];

  const handleSubmitRequest = async () => {
    if (!justification) return alert("Justification is mandatory for evidentiary accountability.");
    
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/governance/request-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('anchor_token')}`
        },
        body: JSON.stringify({
          capability_id: capabilityId,
          purpose,
          justification,
          hub_id: hubId
        })
      });

      const data = await response.json();
      if (response.ok) {
        setRequestId(data.request_id);
      } else {
        alert("GOVERNANCE_FAILURE: " + data.detail);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="governance-modal-overlay" style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
      backdropFilter: 'blur(4px)'
    }}>
      <div className="governance-modal-container" style={{
        backgroundColor: '#111', border: '1px solid #333', borderRadius: 8,
        width: 480, padding: 32, color: '#eee', boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
      }}>
        <div style={{ fontFamily: 'Crimson Pro, serif', fontSize: 24, marginBottom: 8, color: '#fff' }}>
          {requestId ? 'AUTHORIZATION PENDING' : 'GOVERNANCE ACTIVATION REQUIRED'}
        </div>
        
        <div style={{ fontSize: 13, color: '#888', marginBottom: 24, letterSpacing: '0.05em' }}>
          OFFICIAL GOVERNANCE REQUEST · PROTOCOL v6.1
        </div>

        {!requestId ? (
          <>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 8, textTransform: 'uppercase' }}>
                Primary Purpose
              </label>
              <select 
                value={purpose}
                onChange={e => setPurpose(e.target.value)}
                style={{
                  width: '100%', backgroundColor: '#000', border: '1px solid #333',
                  color: '#fff', padding: '12px 10px', borderRadius: 4, outline: 'none'
                }}
              >
                {purposes.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 8, textTransform: 'uppercase' }}>
                Evidentiary Justification
              </label>
              <textarea 
                placeholder="Declare the legal or operational intent for this access..."
                value={justification}
                onChange={e => setJustification(e.target.value)}
                style={{
                  width: '100%', height: 100, backgroundColor: '#000', border: '1px solid #333',
                  color: '#fff', padding: 12, borderRadius: 4, outline: 'none', resize: 'none',
                  fontSize: 14, lineHeight: 1.5, fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                onClick={onClose}
                style={{ flex: 1, padding: '12px 0', backgroundColor: 'transparent', border: '1px solid #333', color: '#888', borderRadius: 4, cursor: 'pointer' }}
              >
                CANCEL
              </button>
              <button 
                onClick={handleSubmitRequest}
                disabled={isSubmitting}
                style={{ 
                  flex: 2, padding: '12px 0', backgroundColor: '#fff', color: '#000', 
                  border: 'none', borderRadius: 4, fontWeight: 700, cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.5 : 1
                }}
              >
                {isSubmitting ? 'SIGNING...' : 'INITIATE AUTHORIZATION'}
              </button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 14, color: '#aaa', marginBottom: 24, lineHeight: 1.6 }}>
              Request <span style={{ color: '#fff', fontWeight: 700 }}>{requestId}</span> has been broadcast to the Hub. 
              Waiting for institutional clearance.
            </div>
            <div className="pulsing-registry" style={{
              width: 40, height: 40, border: '2px solid #fff', borderRadius: '50%',
              margin: '0 auto 24px', borderTopColor: 'transparent', animation: 'spin 1s linear infinite'
            }} />
            <button 
                onClick={onClose}
                style={{ width: '100%', padding: '12px 0', backgroundColor: 'transparent', border: '1px solid #333', color: '#888', borderRadius: 4, cursor: 'pointer' }}
              >
                CLOSE
              </button>
          </div>
        )}
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
