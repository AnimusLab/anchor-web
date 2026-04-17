import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { endpoints } from '../lib/api';

const REGULATORS = ['SEC', 'FCA', 'RBI', 'SEBI', 'EU-AI', 'CFPB', 'MAS', 'CFTC'];
const REGIONS = ['USA', 'UK', 'India', 'EU', 'Singapore', 'Canada', 'Australia', 'Japan'];

function Field({ label, children }) {
  return (
    <div>
      <div className="field-label">{label}</div>
      {children}
    </div>
  );
}

export default function ProvisioningPortal() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('AUDITOR');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const [auditorData, setAuditorData] = useState({
    display_name: '', email: '', regulator: 'SEC', department: '', jurisdiction: 'USA'
  });
  const [enterpriseData, setEnterpriseData] = useState({
    display_name: '', email: '', company_name: '', region: 'India', department: ''
  });

  const handleProvision = async (type) => {
    setLoading(true);
    setMessage(null);
    try {
      const payload = type === 'AUDITOR' ? auditorData : enterpriseData;
      const endpoint = type === 'AUDITOR'
        ? '/api/auth/admin/provision/auditor'
        : '/api/auth/admin/provision/enterprise';

      const res = await fetch(`${endpoints.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setMessage({ type: 'SUCCESS', text: `Credentials dispatched to ${payload.email}. Sovereign Gatekeeper handshake initiated.` });
      } else {
        const err = await res.json();
        setMessage({ type: 'ERROR', text: err.detail || 'Provisioning failed — check payload.' });
      }
    } catch (e) {
      setMessage({ type: 'ERROR', text: 'Network error — verify server connectivity.' });
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1100 }}>

      {/* Page header */}
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
          Fleet Provisioning
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          Generate identities and dispatch credentials to Regulatory Officials or Enterprise Owners.
        </div>
      </div>

      {/* Tab switcher */}
      <div style={{
        display: 'flex',
        gap: 4,
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: 4,
        alignSelf: 'flex-start',
      }}>
        {['AUDITOR', 'ENTERPRISE'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 20px',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s',
              background: activeTab === tab ? 'var(--accent)' : 'transparent',
              color: activeTab === tab ? '#fff' : 'var(--text-secondary)',
            }}
          >
            {tab === 'AUDITOR' ? '🏛 Regulatory Officials' : '🏢 Enterprise Owners'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 20, alignItems: 'start' }}>

        {/* Form */}
        <div className="ra-card" style={{ padding: 28 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 24 }}>
            {activeTab === 'AUDITOR' ? 'Official Identity Metadata' : 'Enterprise Owner Details'}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {activeTab === 'AUDITOR' ? (
              <>
                <Field label="Official Full Name">
                  <input
                    className="ra-input"
                    placeholder="e.g. John Doe"
                    value={auditorData.display_name}
                    onChange={e => setAuditorData({ ...auditorData, display_name: e.target.value })}
                  />
                </Field>
                <Field label="Government Email">
                  <input
                    className="ra-input"
                    type="email"
                    placeholder="name@regulator.gov"
                    value={auditorData.email}
                    onChange={e => setAuditorData({ ...auditorData, email: e.target.value })}
                  />
                </Field>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <Field label="Regulatory Body">
                    <select
                      className="ra-select"
                      value={auditorData.regulator}
                      onChange={e => setAuditorData({ ...auditorData, regulator: e.target.value })}
                    >
                      {REGULATORS.map(r => <option key={r}>{r}</option>)}
                    </select>
                  </Field>
                  <Field label="Jurisdiction">
                    <select
                      className="ra-select"
                      value={auditorData.jurisdiction}
                      onChange={e => setAuditorData({ ...auditorData, jurisdiction: e.target.value })}
                    >
                      {REGIONS.map(r => <option key={r}>{r}</option>)}
                    </select>
                  </Field>
                </div>
                <Field label="Department">
                  <input
                    className="ra-input"
                    placeholder="e.g. Compliance Oversight"
                    value={auditorData.department}
                    onChange={e => setAuditorData({ ...auditorData, department: e.target.value })}
                  />
                </Field>
              </>
            ) : (
              <>
                <Field label="Owner Full Name">
                  <input
                    className="ra-input"
                    placeholder="e.g. Haritha Desai"
                    value={enterpriseData.display_name}
                    onChange={e => setEnterpriseData({ ...enterpriseData, display_name: e.target.value })}
                  />
                </Field>
                <Field label="Corporate Email">
                  <input
                    className="ra-input"
                    type="email"
                    placeholder="owner@company.ai"
                    value={enterpriseData.email}
                    onChange={e => setEnterpriseData({ ...enterpriseData, email: e.target.value })}
                  />
                </Field>
                <Field label="Company Name">
                  <input
                    className="ra-input"
                    placeholder="e.g. Global Bank AI"
                    value={enterpriseData.company_name}
                    onChange={e => setEnterpriseData({ ...enterpriseData, company_name: e.target.value })}
                  />
                </Field>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <Field label="Region">
                    <select
                      className="ra-select"
                      value={enterpriseData.region}
                      onChange={e => setEnterpriseData({ ...enterpriseData, region: e.target.value })}
                    >
                      {REGIONS.map(r => <option key={r}>{r}</option>)}
                    </select>
                  </Field>
                  <Field label="Department">
                    <input
                      className="ra-input"
                      placeholder="AI Safety Branch"
                      value={enterpriseData.department}
                      onChange={e => setEnterpriseData({ ...enterpriseData, department: e.target.value })}
                    />
                  </Field>
                </div>
              </>
            )}

            <button
              className="btn-primary"
              disabled={loading}
              onClick={() => handleProvision(activeTab)}
              style={{
                width: '100%',
                padding: '13px',
                fontSize: 14,
                marginTop: 6,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Dispatching Credentials...' : `Approve & Grant ${activeTab === 'AUDITOR' ? 'Auditor' : 'Enterprise'} Access`}
            </button>
          </div>
        </div>

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Protocol steps */}
          <div className="ra-card" style={{ padding: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 18 }}>
              Operational Protocol
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { n: '01', text: 'Submitting triggers background credential generation — ID + TOTP + Master Key.' },
                { n: '02', text: 'System pulls the official\'s public key or embeds a secure TOTP QR in the welcome packet.' },
                { n: '03', text: 'Automated transmission dispatched via Sovereign Gatekeeper (mail.py).' },
                { n: '04', text: 'Access logged in Audit Ledger as a PROVISION_EVENT for Root accountability.' },
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

          {/* Response message */}
          {message && (
            <div style={{
              padding: '16px 20px',
              borderRadius: 6,
              border: `1px solid ${message.type === 'SUCCESS' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
              background: message.type === 'SUCCESS' ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)',
            }} className="slide-in">
              <div style={{
                fontSize: 12, fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em',
                color: message.type === 'SUCCESS' ? 'var(--green-soft)' : 'var(--red-soft)',
              }}>
                {message.type === 'SUCCESS' ? '✓ Success' : '✗ Error'}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{message.text}</div>
            </div>
          )}

          {/* Audit counts */}
          <div className="ra-card" style={{ padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>Recent Provisions</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'Auditors', value: '—', color: 'var(--cyan)' },
                { label: 'Enterprises', value: '—', color: 'var(--accent-soft)' },
              ].map(item => (
                <div key={item.label} style={{
                  background: 'var(--bg-void)',
                  borderRadius: 6,
                  padding: '12px 16px',
                  border: '1px solid var(--border)',
                }}>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: item.color }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
