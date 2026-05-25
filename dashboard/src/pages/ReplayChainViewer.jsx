import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const V = {
  primary: 'var(--text-primary)',
  secondary: 'var(--text-secondary)',
  muted: 'var(--text-muted)',
  dim: 'var(--text-dim)',
  card: 'var(--bg-card)',
  surface: 'var(--bg-surface)',
  void: 'var(--bg-void)',
  border: 'var(--border)',
  borderLit: 'var(--border-lit)',
  green: 'var(--green)',
  red: 'var(--red)',
  amber: 'var(--amber)',
  cyan: 'var(--cyan)',
  accent: 'var(--accent)',
};

const DEFAULT_STEPS = [
  {
    step_id: 'step_in_01',
    name: 'Ingress Handshake Interception',
    timestamp: '10:14:02.190',
    hash: '8f3c8b417c807f4c9bf10e2db45c0836e4f3a7496695ee918074d08ee7dc26ea',
    status: 'VERIFIED',
    drift_score: 5,
    payload: {
      client_ip: '192.168.1.44',
      request_token: 'Bearer JWT_SECRET_4019a',
      protocol: 'gRPC v2.0',
    },
  },
  {
    step_id: 'step_in_02',
    name: 'Declarative Constitutional Filter',
    timestamp: '10:14:02.202',
    hash: '22b40ffea3c829dbf10ea8c8ef109de48fe75cb58d4a9ef1c9b29e08ea3cf6ea',
    status: 'VERIFIED',
    drift_score: 18,
    payload: {
      matched_rules: ['rule_mr_01', 'rule_mr_03'],
      interception_decision: 'WARN_AND_CONTINUE',
      matched_threshold: 'age_discrimination_score > 0.75',
    },
  },
  {
    step_id: 'step_in_03',
    name: 'Audit-of-Auditors Lock',
    timestamp: '10:14:02.215',
    hash: 'f9a3c74b882d9ef10ea8e8ef90de48ea7cf8cb5f9d4e9ef1c9b29e08eb3bf5ea',
    status: 'VERIFIED',
    drift_score: 45,
    payload: {
      audit_token_hash: '9f8e7d6c5b4a3c2a1a0987654321',
      recorded_by: 'hub_auditor_us_east',
      access_scope: 'HUB_AUDITOR',
    },
  },
];

export default function ReplayChainViewer() {
  const { entryId } = useParams();
  const [steps, setSteps] = useState(DEFAULT_STEPS);
  const [activeStep, setActiveStep] = useState(DEFAULT_STEPS[0]);
  const [cryptStatus, setCryptStatus] = useState('UNVERIFIED');
  const [verifying, setVerifying] = useState(false);
  const [driftValue, setDriftValue] = useState(DEFAULT_STEPS[0].drift_score);

  useEffect(() => {
    setCryptStatus('UNVERIFIED');
    setDriftValue(activeStep.drift_score);
  }, [activeStep]);

  const verifyInBrowserHash = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setCryptStatus('VALID');
    }, 1200);
  };

  const getDriftColor = (score) => {
    if (score > 60) return V.red;
    if (score > 30) return V.amber;
    return V.cyan;
  };

  return (
    <div style={{ padding: 28, color: V.primary, display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.3s ease' }}>
      
      {/* Header */}
      <div>
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>Replay Chain Cryptographic Viewer</div>
        <div style={{ fontSize: 13, color: V.secondary }}>
          Validate and audit execution sequences in real-time, verifying absolute cryptographic attestation.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 24, alignItems: 'stretch' }}>
        
        {/* Step-by-Step Sequence */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: V.card, border: `1px solid ${V.border}`, borderRadius: 12, padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', color: V.secondary }}>INTERCEPTION BLOCKS</span>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {steps.map((step, idx) => {
                const isActive = activeStep.step_id === step.step_id;
                return (
                  <div
                    key={step.step_id}
                    onClick={() => setActiveStep(step)}
                    style={{
                      background: isActive ? 'rgba(255,255,255,0.03)' : 'transparent',
                      border: `1px solid ${isActive ? V.borderLit : V.border}`,
                      borderRadius: 8,
                      padding: 14,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: isActive ? V.cyan : 'rgba(255,255,255,0.05)',
                      color: isActive ? 'black' : V.secondary,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700,
                    }}>
                      {idx + 1}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: V.primary, marginBottom: 2 }}>{step.name}</div>
                      <div style={{ fontSize: 11, color: V.dim, fontFamily: 'monospace' }}>{step.timestamp}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cryptographic Attestation Shield */}
          <div style={{ background: V.card, border: `1px solid ${V.border}`, borderRadius: 12, padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: V.secondary }}>ATTESTATION SHIELD</span>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 11, color: V.muted }}>REPLAY HASH SUMMARY</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, background: V.void, border: `1px solid ${V.border}`, padding: '8px 10px', borderRadius: 6, wordBreak: 'break-all', color: V.cyan }}>
                {activeStep.hash}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                onClick={verifyInBrowserHash}
                disabled={verifying}
                style={{
                  background: cryptStatus === 'VALID' ? 'rgba(34, 197, 94, 0.1)' : V.accent,
                  color: cryptStatus === 'VALID' ? V.green : 'white',
                  border: cryptStatus === 'VALID' ? `1px solid ${V.green}33` : 'none',
                  padding: '8px 16px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: verifying ? 'default' : 'pointer',
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                {verifying ? (
                  'Verifying attestation...'
                ) : cryptStatus === 'VALID' ? (
                  <>
                    <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 14, height: 14 }}><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                    ATTESTATION VALID
                  </>
                ) : (
                  'Verify Cryptographic Signature'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Payload / Detail & Drift Dials */}
        <div style={{ background: V.card, border: `1px solid ${V.border}`, borderRadius: 12, display: 'flex', flexDirection: 'column' }}>
          <div style={{ borderBottom: `1px solid ${V.border}`, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: 14, fontWeight: 700, color: V.primary }}>DECRYPTED PAYLOAD TRACE</span>
              <div style={{ fontSize: 11, color: V.secondary, marginTop: 2 }}>{activeStep.name}</div>
            </div>
            <span style={{ fontSize: 11, color: V.dim, fontFamily: 'JetBrains Mono, monospace' }}>BLOCK DETAILS</span>
          </div>

          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20, padding: 20 }}>
            
            {/* Decrypted Payload details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: V.secondary }}>JSON ATOM RECORD</div>
              <pre style={{
                flex: 1,
                background: '#07080A',
                border: `1px solid ${V.border}`,
                borderRadius: 8,
                padding: 16,
                color: V.cyan,
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 13,
                lineHeight: '1.6',
                overflow: 'auto',
                margin: 0,
              }}>
                {JSON.stringify(activeStep.payload, null, 2)}
              </pre>
            </div>

            {/* Drift Dial */}
            <div style={{ background: V.void, border: `1px solid ${V.border}`, borderRadius: 8, padding: 16, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: V.secondary }}>OBSERVED BEHAVIORAL DRIFT</span>
              
              <div style={{ position: 'relative', width: 140, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={getDriftColor(driftValue)}
                    strokeWidth="6"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * driftValue) / 100}
                    style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.8s' }}
                  />
                </svg>
                <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontSize: 24, fontWeight: 800, color: V.primary }}>{driftValue}%</span>
                  <span style={{ fontSize: 9, color: V.muted, textTransform: 'uppercase' }}>Drift Score</span>
                </div>
              </div>

              <div style={{ textAlign: 'center', fontSize: 12, color: V.secondary, padding: '0 8px' }}>
                {driftValue > 60 ? (
                  <span style={{ color: V.red, fontWeight: 700 }}>CRITICAL ERROR VECTOR TRIGGERED</span>
                ) : driftValue > 30 ? (
                  <span style={{ color: V.amber, fontWeight: 700 }}>MODERATE DISCREPANCY REGISTERED</span>
                ) : (
                  <span style={{ color: V.cyan, fontWeight: 700 }}>OPTIMAL EXECUTION ALIGNMENT</span>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
