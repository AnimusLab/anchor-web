import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { endpoints } from '../lib/api';
import EnterpriseAccessSection from '../components/EnterpriseAccessSection';

const REGIONS = ['USA', 'UK', 'India', 'EU', 'Singapore', 'Canada', 'Australia', 'Japan', 'UAE'];

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
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [orgs, setOrgs] = useState([]);
  const [orgsLoading, setOrgsLoading] = useState(true);

  const [form, setForm] = useState({
    display_name: '', email: '', company_name: '', region: 'India', department: ''
  });

  // Fetch existing organizations
  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const res = await fetch(`${endpoints.baseUrl}/api/auth/admin/orgs`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setOrgs(await res.json());
      } catch (e) { console.error('Org fetch error', e); }
      finally { setOrgsLoading(false); }
    };
    fetchOrgs();
    const interval = setInterval(fetchOrgs, 15000);
    return () => clearInterval(interval);
  }, [token]);

  const handleProvision = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(endpoints.provisionEnterprise, {
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
          text: `Enterprise node provisioned. Master Key and TOTP QR dispatched to ${form.email}. Entity: ${data.entity_id}`
        });
        setForm({ display_name: '', email: '', company_name: '', region: 'India', department: '' });
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

      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
            Enterprise Provisioning
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            Provision new enterprise organizations with Master Key, TOTP, and regional Spoke node allocation.
          </div>
        </div>
        <div style={{
          padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600,
          background: 'rgba(6,182,212,0.08)', color: 'var(--cyan)',
          border: '1px solid rgba(6,182,212,0.2)',
          fontFamily: 'JetBrains Mono, monospace',
        }}>
          {orgs.length} ORGANIZATIONS
        </div>
      </div>

      {/* Content grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 20, alignItems: 'start' }}>

        {/* Form */}
        <div className="ra-card" style={{ padding: 28 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
            Organization Owner Details
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 24, lineHeight: 1.6 }}>
            The owner receives a Regional Master Key and TOTP QR code. They can then invite members,
            create projects, and share the Master Key with their development team.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Field label="Owner Full Name">
              <input
                className="ra-input"
                placeholder="e.g. Haritha Desai"
                value={form.display_name}
                onChange={e => setForm({ ...form, display_name: e.target.value })}
              />
            </Field>
            <Field label="Corporate Email">
              <input
                className="ra-input"
                type="email"
                placeholder="owner@company.ai"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </Field>
            <Field label="Company Name">
              <input
                className="ra-input"
                placeholder="e.g. Global Bank AI"
                value={form.company_name}
                onChange={e => setForm({ ...form, company_name: e.target.value })}
              />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Region">
                <select
                  className="ra-select"
                  value={form.region}
                  onChange={e => setForm({ ...form, region: e.target.value })}
                >
                  {REGIONS.map(r => <option key={r}>{r}</option>)}
                </select>
              </Field>
              <Field label="Department">
                <input
                  className="ra-input"
                  placeholder="AI Safety Branch"
                  value={form.department}
                  onChange={e => setForm({ ...form, department: e.target.value })}
                />
              </Field>
            </div>

            <button
              className="btn-primary"
              disabled={loading || !form.display_name || !form.email || !form.company_name}
              onClick={handleProvision}
              style={{
                width: '100%', padding: '13px', fontSize: 14, marginTop: 6,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Provisioning...' : 'Provision Enterprise Node →'}
            </button>
          </div>
        </div>

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* What happens */}
          <div className="ra-card" style={{ padding: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 18 }}>
              Provisioning Protocol
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { n: '01', text: 'Organization record created with a unique Hub ID and domain lock.' },
                { n: '02', text: 'Regional Master Key generated — owner uses this to create sub-projects and integrate the SDK.' },
                { n: '03', text: 'TOTP secret generated and QR code emailed — owner scans with Google Authenticator for login.' },
                { n: '04', text: 'Owner can then invite team members via the Enterprise Dashboard, sharing the Master Key securely.' },
              ].map(s => (
                <div key={s.n} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <span style={{
                    width: 24, height: 24, flexShrink: 0,
                    background: 'rgba(6,182,212,0.1)',
                    borderRadius: 6,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, color: 'var(--cyan)',
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
              padding: '16px 20px', borderRadius: 6,
              border: `1px solid ${message.type === 'SUCCESS' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
              background: message.type === 'SUCCESS' ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)',
            }} className="slide-in">
              <div style={{
                fontSize: 12, fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em',
                color: message.type === 'SUCCESS' ? 'var(--green-soft)' : 'var(--red-soft)',
              }}>
                {message.type === 'SUCCESS' ? '✓ Node Provisioned' : '✗ Error'}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{message.text}</div>
            </div>
          )}

          {/* Org list */}
          <div className="ra-card" style={{ padding: 20 }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14,
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Active Organizations</div>
              <span className="badge badge-cyan">{orgs.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 220, overflowY: 'auto' }}>
              {orgsLoading ? (
                <div style={{ fontSize: 12, color: 'var(--text-dim)', textAlign: 'center', padding: '20px 0' }}>
                  Loading...
                </div>
              ) : orgs.length === 0 ? (
                <div style={{ fontSize: 12, color: 'var(--text-dim)', textAlign: 'center', padding: '20px 0' }}>
                  No organizations provisioned yet
                </div>
              ) : orgs.map(o => (
                <div key={o.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 14px', background: 'var(--bg-void)', borderRadius: 6,
                  border: '1px solid var(--border)',
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{o.display_name}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace' }}>
                      {o.domain || o.entity_prefix} · {o.server_region || '—'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace' }}>
                      {o.member_count || 0} members
                    </span>
                    <span className={`badge ${o.status === 'active' ? 'badge-green' : 'badge-red'}`} style={{ fontSize: 10 }}>
                      {(o.status || 'active').toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Enterprise Access Section */}
      <div style={{ marginTop: 40, paddingTop: 28, borderTop: '1px solid var(--border)' }}>
        <EnterpriseAccessSection />
      </div>
    </div>
  );
}
