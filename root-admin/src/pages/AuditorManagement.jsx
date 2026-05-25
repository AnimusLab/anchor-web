import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { endpoints } from '../lib/api';

const REGULATORS = ['SEC', 'FCA', 'RBI', 'SEBI', 'EU-AI', 'CFPB', 'MAS', 'CFTC', 'NIST', 'FINOS'];
const JURISDICTIONS = ['USA', 'UK', 'India', 'EU', 'Singapore', 'UAE', 'Japan', 'Australia'];

function Field({ label, children }) {
  return (
    <div>
      <div className="field-label">{label}</div>
      {children}
    </div>
  );
}

export default function AuditorManagement() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const [form, setForm] = useState({
    display_name: '', 
    email: '', 
    regulator: 'SEC', 
    department: '', 
    jurisdiction: 'India',
    
    // v6.2 Institutional Governance Defaults
    identity_subtype: 'government_auditor',
    provisioned_capabilities: 'can_replay,can_export',
    entity_visibility_scope: 'ai_agent,gateway',
    governance_scope: 'jurisdiction_wide',
    clearance_level: 1 // DEPRECATED
  });

  const handleProvision = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(endpoints.provisionAuditor, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        const data = await res.json();
        setMessage({
          type: 'SUCCESS',
          text: `Auditor provisioned. TOTP QR + Entity ID (${data.entity_id}) dispatched to ${form.email}. They can now login at oversight.anchorgovernance.tech.`
        });
        setForm({ display_name: '', email: '', regulator: 'SEC', department: '', jurisdiction: 'USA' });
      } else {
        const err = await res.json();
        setMessage({ type: 'ERROR', text: err.detail || 'Provisioning failed.' });
      }
    } catch (e) {
      setMessage({ type: 'ERROR', text: 'Network error — verify server connectivity.' });
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1100 }}>

      {/* Header */}
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
          Regulatory Officials
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          Provision individual auditors with isolated TOTP credentials. Each official operates as a sovereign session.
        </div>
      </div>

      {/* Response message */}
      {message && (
        <div style={{
          padding: '14px 20px', borderRadius: 6,
          border: `1px solid ${message.type === 'SUCCESS' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
          background: message.type === 'SUCCESS' ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)',
        }} className="slide-in">
          <div style={{
            fontSize: 12, fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em',
            color: message.type === 'SUCCESS' ? 'var(--green-soft)' : 'var(--red-soft)',
          }}>
            {message.type === 'SUCCESS' ? '✓ Success' : '✗ Error'}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{message.text}</div>
        </div>
      )}

      {/* Content grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 20, alignItems: 'start' }}>
        <div className="ra-card" style={{ padding: 28 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
            Official Identity Metadata
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 24, lineHeight: 1.6 }}>
            This creates a fully provisioned auditor with an isolated TOTP secret.
            Unlike enterprises, auditors do not share credentials — each official has their own sovereign session.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Field label="Official Full Name">
              <input className="ra-input" placeholder="e.g. John Doe"
                value={form.display_name}
                onChange={e => setForm({ ...form, display_name: e.target.value })}
              />
            </Field>
            <Field label="Government Email">
              <input className="ra-input" type="email" placeholder="auditor@regulator.gov"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Regulatory Body">
                <select className="ra-select" value={form.regulator}
                  onChange={e => setForm({ ...form, regulator: e.target.value })}
                >
                  {REGULATORS.map(r => <option key={r}>{r}</option>)}
                </select>
              </Field>
              <Field label="Jurisdiction">
                <select className="ra-select" value={form.jurisdiction}
                  onChange={e => setForm({ ...form, jurisdiction: e.target.value })}
                >
                  {JURISDICTIONS.map(j => <option key={j}>{j}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Department / Division">
              <input className="ra-input" placeholder="e.g. AI Compliance Bureau"
                value={form.department}
                onChange={e => setForm({ ...form, department: e.target.value })}
              />
            </Field>

            {/* v6.2 Institutional Governance Fields */}
            <div style={{ padding: '16px 0 0 0', borderTop: '1px solid var(--border)', marginTop: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--amber-soft)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                Governance Architecture (v6.2 Institutional)
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <Field label="Identity Subtype">
                  <select className="ra-select" value={form.identity_subtype} onChange={e => setForm({ ...form, identity_subtype: e.target.value })}>
                    <option value="government_auditor">Government Auditor</option>
                    <option value="standard_auditor">Standard Auditor</option>
                    <option value="cross_hub_auditor">Cross-Hub Auditor</option>
                  </select>
                </Field>

                <Field label="Capability Overrides (CSV)">
                  <input className="ra-input" placeholder="can_replay, can_export"
                    value={form.provisioned_capabilities}
                    onChange={e => setForm({ ...form, provisioned_capabilities: e.target.value })} />
                </Field>
              </div>

              <div style={{ marginTop: 14 }}>
                <Field label="Entity Visibility Scope">
                  <input className="ra-input" placeholder="ai_agent,gateway"
                    value={form.entity_visibility_scope}
                    onChange={e => setForm({ ...form, entity_visibility_scope: e.target.value })} />
                </Field>
              </div>
            </div>

            <button
              className="btn-primary"
              disabled={loading || !form.display_name || !form.email}
              onClick={handleProvision}
              style={{
                width: '100%', padding: '13px', fontSize: 14, marginTop: 6,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Generating Credentials...' : 'Provision & Dispatch Credentials →'}
            </button>
          </div>
        </div>

        {/* Right: Protocol explainer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="ra-card" style={{ padding: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 18 }}>
              Auditor Provisioning Protocol
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { n: '01', text: 'A unique Entity ID (e.g. aud_f3a1_sec) is cryptographically generated from the jurisdiction.' },
                { n: '02', text: 'An isolated TOTP secret is created — this official\'s QR code is unique and not shared with any organization.' },
                { n: '03', text: 'Email dispatched with Entity ID + QR code via the Sovereign Gatekeeper. Secret is shown once.' },
                { n: '04', text: 'Official scans QR with Google Authenticator, then logs in at oversight.anchorgovernance.tech with their clearance ID + TOTP.' },
              ].map(s => (
                <div key={s.n} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <span style={{
                    width: 24, height: 24, flexShrink: 0,
                    background: 'var(--accent-dim)',
                    borderRadius: 6,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, color: 'var(--accent-soft)',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}>{s.n}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key difference callout */}
          <div className="ra-card" style={{
            padding: 20,
            borderColor: 'rgba(245,158,11,0.2)',
            background: 'rgba(245,158,11,0.03)',
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b', marginBottom: 10, letterSpacing: '0.06em' }}>
              ⚡ KEY DIFFERENCE FROM ENTERPRISE
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              Enterprise owners receive a <strong style={{ color: 'var(--text-primary)' }}>Master Key</strong> they share
              with their development team for SDK integration. Auditors receive <strong style={{ color: 'var(--text-primary)' }}>only
              a personal TOTP code</strong> — there is no shared secret. Each auditor session is cryptographically
              isolated and sovereign.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
