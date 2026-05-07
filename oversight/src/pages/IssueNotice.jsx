import React, { useState, useEffect } from 'react';
import PortalLayout from '../components/PortalLayout';
import { useAuth } from '../contexts/AuthContext';
import { endpoints } from '../lib/api';

const SEVERITY_CONFIG = {
  LOW:      { color: 'var(--green)',  badge: 'badge-green',  label: 'LOW — Advisory notice' },
  MEDIUM:   { color: 'var(--cyan)',   badge: 'badge-cyan',   label: 'MEDIUM — Compliance warning' },
  HIGH:     { color: 'var(--amber)',  badge: 'badge-amber',  label: 'HIGH — Enforcement action' },
  CRITICAL: { color: 'var(--red)',    badge: 'badge-red',    label: 'CRITICAL — Emergency suspension' },
};

export default function IssueNotice() {
  const { token, user } = useAuth();
  const [form, setForm] = useState({ company: '', rule_violated: '', severity: 'HIGH', description: '', deadline: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [filed, setFiled]     = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Load prior notices on mount
  useEffect(() => {
    fetch(`${endpoints.baseUrl}/api/oversight/enforcement`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(setHistory)
      .catch(console.error)
      .finally(() => setLoadingHistory(false));
  }, [token, filed]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch(`${endpoints.baseUrl}/api/oversight/enforcement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          company:       form.company,
          rule_violated: form.rule_violated,
          severity:      form.severity,
          description:   form.description,
          deadline:      form.deadline || null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setFiled(data);
        setForm({ company: '', rule_violated: '', severity: 'HIGH', description: '', deadline: '' });
      } else {
        setError(data.detail || 'Failed to file notice.');
      }
    } catch (err) {
      setError('Connection failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PortalLayout>
      <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Issue Enforcement Notice</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              File a formal compliance notice against an AI entity. Notices are persisted to the regulatory ledger.
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Filed by</div>
            <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>{user?.name || user?.regulator}</div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--text-dim)' }}>{user?.sub}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, alignItems: 'start' }}>

          {/* Form */}
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Success banner */}
            {filed && (
              <div style={{ padding: '16px 20px', borderRadius: 6, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span className="badge badge-green">NOTICE FILED</span>
                  <button onClick={() => setFiled(null)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 12 }}>dismiss</button>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600, marginBottom: 4 }}>{filed.notice_id}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{filed.message}</div>
              </div>
            )}

            {/* Error banner */}
            {error && (
              <div style={{ padding: '12px 16px', borderRadius: 6, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--red-soft)', fontSize: 13 }}>
                ✗ {error}
              </div>
            )}

            <div className="ra-card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                Notice Details
              </div>

              {/* Company */}
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Company / AI Entity</div>
                <input required value={form.company} onChange={e => set('company', e.target.value)}
                  placeholder="e.g. OpenAI GPT-4 Production" className="ra-input" />
              </div>

              {/* Rule */}
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Rule / Policy Violated</div>
                <input required value={form.rule_violated} onChange={e => set('rule_violated', e.target.value)}
                  placeholder="e.g. RBI/AI-GOV-2024-07" className="ra-input" />
              </div>

              {/* Severity */}
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Severity Level</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                  {Object.entries(SEVERITY_CONFIG).map(([key, cfg]) => (
                    <button
                      key={key} type="button" onClick={() => set('severity', key)}
                      style={{
                        padding: '10px 8px', borderRadius: 6, border: `1px solid`,
                        cursor: 'pointer', transition: 'all 0.15s', textAlign: 'center',
                        background: form.severity === key ? `${cfg.color}18` : 'transparent',
                        borderColor: form.severity === key ? cfg.color : 'var(--border)',
                        color: form.severity === key ? cfg.color : 'var(--text-muted)',
                        fontSize: 12, fontWeight: 700,
                      }}
                    >{key}</button>
                  ))}
                </div>
                <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-dim)' }}>
                  {SEVERITY_CONFIG[form.severity]?.label}
                </div>
              </div>

              {/* Deadline */}
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Compliance Deadline <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>(optional)</span></div>
                <input type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} className="ra-input" />
              </div>

              {/* Description */}
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Description of Violation</div>
                <textarea required value={form.description} onChange={e => set('description', e.target.value)}
                  placeholder="Describe the nature of the AI compliance breach in detail..." rows={5}
                  style={{ width: '100%', background: 'var(--bg-void)', border: '1px solid var(--border-lit)', borderRadius: 6, padding: '10px 14px', fontSize: 14, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif', outline: 'none', resize: 'vertical' }} />
              </div>

              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '12px', borderRadius: 6,
                background: SEVERITY_CONFIG[form.severity]?.color || 'var(--amber)',
                border: 'none', color: '#fff', fontSize: 14, fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                transition: 'opacity 0.15s',
              }}>
                {loading ? 'Filing Notice...' : `File ${form.severity} Enforcement Notice →`}
              </button>
            </div>
          </form>

          {/* History panel */}
          <div className="ra-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>My Filed Notices</span>
              <span className="badge badge-purple">{history.length}</span>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', maxHeight: 600 }}>
              {loadingHistory ? (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-dim)', fontSize: 13 }}>Loading...</div>
              ) : history.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-dim)', fontSize: 13 }}>
                  No notices filed yet
                </div>
              ) : history.map((n, i) => (
                <div key={i} style={{ padding: '14px 16px', borderBottom: i < history.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <span className={`badge ${SEVERITY_CONFIG[n.severity]?.badge || 'badge-amber'}`}>{n.severity}</span>
                    <span className={`badge ${n.status === 'OPEN' ? 'badge-red' : n.status === 'RESOLVED' ? 'badge-green' : 'badge-amber'}`}>{n.status}</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>{n.company}</div>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 4 }}>{n.rule_violated}</div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--text-dim)' }}>
                    {n.notice_id} · {n.filed_at?.slice(0, 10)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
