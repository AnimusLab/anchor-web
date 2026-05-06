import React, { useState } from 'react';
import PortalLayout from '../components/PortalLayout';

export default function IssueNotice() {
  const [form, setForm] = useState({ company: '', rule: '', severity: 'HIGH', description: '', deadline: '' });
  const [sent, setSent] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = (e) => { e.preventDefault(); setSent(true); };

  return (
    <PortalLayout>
      <div style={{ padding: 28, maxWidth: 700 }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Issue Enforcement Notice</div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>File a formal compliance notice against an AI entity within your jurisdiction.</div>
        </div>

        {sent ? (
          <div className="ra-card" style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>✓</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Notice Filed</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>Enforcement notice against <strong>{form.company}</strong> has been recorded in the regulatory ledger.</div>
            <button onClick={() => setSent(false)} style={{ padding: '10px 24px', borderRadius: 6, background: 'var(--accent)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Issue Another</button>
          </div>
        ) : (
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="ra-card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>Notice Details</div>

              {[
                { label: 'Company / AI Entity Name', key: 'company', placeholder: 'e.g. OpenAI GPT-4 Production' },
                { label: 'Rule or Policy Violated', key: 'rule', placeholder: 'e.g. RBI/AI-GOV-2024-07' },
              ].map(f => (
                <div key={f.key}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{f.label}</div>
                  <input required value={form[f.key]} onChange={e => set(f.key, e.target.value)} placeholder={f.placeholder} className="ra-input" />
                </div>
              ))}

              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Severity Level</div>
                <select value={form.severity} onChange={e => set('severity', e.target.value)} className="ra-select">
                  <option value="LOW">LOW — Advisory notice</option>
                  <option value="MEDIUM">MEDIUM — Compliance warning</option>
                  <option value="HIGH">HIGH — Enforcement action</option>
                  <option value="CRITICAL">CRITICAL — Emergency suspension</option>
                </select>
              </div>

              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Compliance Deadline</div>
                <input type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} className="ra-input" />
              </div>

              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Description of Violation</div>
                <textarea required value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe the nature of the AI compliance breach..." rows={5}
                  style={{ width: '100%', background: 'var(--bg-void)', border: '1px solid var(--border-lit)', borderRadius: 6, padding: '10px 14px', fontSize: 14, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif', outline: 'none', resize: 'vertical' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" style={{ flex: 1, padding: '12px', borderRadius: 6, background: 'var(--amber)', border: 'none', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                File Enforcement Notice →
              </button>
            </div>
          </form>
        )}
      </div>
    </PortalLayout>
  );
}
