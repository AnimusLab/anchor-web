import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { endpoints } from '../lib/api';

const ROLES = ['owner', 'auditor', 'admin'];

export default function WhitelistManagement() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  
  const [form, setForm] = useState({
    email: '', org_id: '', role: 'owner'
  });

  const fetchWhitelist = async () => {
    try {
      const res = await fetch(endpoints.whitelist, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setItems(await res.json());
    } catch (e) { console.error('Whitelist fetch error', e); }
  };

  useEffect(() => {
    fetchWhitelist();
  }, [token]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(endpoints.whitelist, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setForm({ email: '', org_id: '', role: 'owner' });
        fetchWhitelist();
      } else {
        const err = await res.json();
        setError(err.detail || 'Failed to add entry');
      }
    } catch (e) {
      setError('Network error');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Revoke this authorization?')) return;
    try {
      const res = await fetch(endpoints.deleteWhitelist(id), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchWhitelist();
    } catch (e) { console.error('Delete error', e); }
  };

  return (
    <div style={{ padding: 28, maxWidth: 1000 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
          Access Whitelist
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          Manage pre-authorized entities allowed to onboard into the Sovereign Mesh.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 24 }}>
        {/* Form */}
        <div className="ra-card" style={{ padding: 24, alignSelf: 'start' }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 20 }}>
            Authorize New Entity
          </h2>
          <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="field-label">Target Email</label>
              <input
                className="ra-input"
                type="email"
                placeholder="identity@company.ai"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="field-label">Organization Slug (e.g. jpmc)</label>
              <input
                className="ra-input"
                placeholder="lowercase-slug"
                required
                value={form.org_id}
                onChange={e => setForm({ ...form, org_id: e.target.value })}
              />
            </div>
            <div>
              <label className="field-label">Access Role</label>
              <select
                className="ra-select"
                value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value })}
              >
                {ROLES.map(r => <option key={r} value={r}>{r.toUpperCase()}</option>)}
              </select>
            </div>
            
            {error && (
              <div style={{ fontSize: 12, color: 'var(--red-soft)', background: 'rgba(239,68,68,0.1)', padding: 10, borderRadius: 4 }}>
                {error}
              </div>
            )}

            <button className="btn-primary" disabled={loading} style={{ width: '100%', padding: 12 }}>
              {loading ? 'Processing...' : 'Authorize Entry →'}
            </button>
          </form>
        </div>

        {/* List */}
        <div className="ra-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Active Authorizations</h2>
            <span className="badge badge-lit">{items.length} ENTRIES</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {items.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-dim)', fontSize: 13 }}>
                No whitelisted identities found.
              </div>
            ) : items.map(item => (
              <div key={item.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 16px', background: 'var(--bg-void)', borderRadius: 8,
                border: '1px solid var(--border)',
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{item.email}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>
                    ORG: {item.org_id} · ROLE: {item.role.toUpperCase()}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>
                    {new Date(item.created_at).toLocaleDateString()}
                  </div>
                  <button
                    onClick={() => handleDelete(item.id)}
                    style={{
                      background: 'none', border: 'none', color: 'var(--red-soft)',
                      cursor: 'pointer', padding: 4, opacity: 0.7
                    }}
                    onMouseOver={e => e.currentTarget.style.opacity = 1}
                    onMouseOut={e => e.currentTarget.style.opacity = 0.7}
                  >
                    <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 18, height: 18 }}>
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
