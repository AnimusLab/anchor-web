import React, { useState, useEffect, useRef } from 'react';
import PortalLayout from '../components/PortalLayout';
import { useAuth } from '../contexts/AuthContext';
import { AvatarVault } from '../lib/AvatarVault';

export default function MyProfile() {
  const { user } = useAuth();
  const [avatar, setAvatar]   = useState(null);
  const [preview, setPreview] = useState(null);
  const [saved, setSaved]     = useState(false);
  const fileRef               = useRef(null);
  const fingerprint           = user?.id || user?.sub;

  useEffect(() => {
    if (fingerprint) {
      AvatarVault.getAvatar(fingerprint).then(stored => {
        if (stored) { setAvatar(stored); setPreview(stored); }
      });
    }
  }, [fingerprint]);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const saveAvatar = async () => {
    if (!preview || !fingerprint) return;
    await AvatarVault.saveAvatar(fingerprint, preview);
    setAvatar(preview);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    // Notify layouts
    window.dispatchEvent(new CustomEvent('anchor_avatar_update', { detail: preview }));
  };

  const removeAvatar = async () => {
    if (!fingerprint) return;
    await AvatarVault.removeAvatar(fingerprint);
    setAvatar(null); setPreview(null);
    window.dispatchEvent(new CustomEvent('anchor_avatar_update', { detail: null }));
  };

  const initials = (user?.name?.slice(0,1) || user?.regulator?.slice(0,1) || 'R').toUpperCase();

  const fields = [
    { label: 'Display Name',  value: user?.name || '—' },
    { label: 'Clearance ID',  value: user?.sub  || '—', mono: true },
    { label: 'Regulator',     value: user?.regulator || '—' },
    { label: 'Access Level',  value: user?.access_level || 'READ_ONLY' },
    { label: 'Session ID',    value: user?.session_id || '—', mono: true },
    { label: 'Portal',        value: 'oversight.anchorgovernance.tech' },
    { label: 'Token Scope',   value: 'regulator' },
  ];

  return (
    <PortalLayout>
      <div style={{ padding: 28, maxWidth: 680, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>My Profile</div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Your regulatory clearance, session info, and avatar.</div>
        </div>

        {/* Avatar card */}
        <div className="ra-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: 24 }}>
          {/* Avatar display */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: preview ? 'transparent' : 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 30, fontWeight: 700, color: '#fff',
              overflow: 'hidden', border: '2px solid var(--border-lit)',
            }}>
              {preview
                ? <img src={preview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                : initials
              }
            </div>
            {/* Camera button overlay */}
            <button
              onClick={() => fileRef.current?.click()}
              style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 26, height: 26, borderRadius: '50%',
                background: 'var(--accent)', border: '2px solid var(--bg-card)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <svg viewBox="0 0 20 20" fill="white" style={{ width: 12, height: 12 }}>
                <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
              </svg>
            </button>
          </div>

          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }}/>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
              {user?.name || 'Regulatory Official'}
            </div>
            <span className="badge badge-purple">{user?.regulator || 'REGULATOR'}</span>
            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-dim)' }}>
              Avatar is stored locally on this device — no database upload.
              It will persist across sessions on this browser.
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
            <button onClick={() => fileRef.current?.click()} style={{
              padding: '8px 16px', borderRadius: 6, border: '1px solid var(--border-lit)',
              background: 'transparent', color: 'var(--text-secondary)', fontSize: 12,
              fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-lit)'}
            >
              Choose Photo
            </button>
            {preview && preview !== avatar && (
              <button onClick={saveAvatar} style={{
                padding: '8px 16px', borderRadius: 6, border: 'none',
                background: 'var(--accent)', color: '#fff', fontSize: 12,
                fontWeight: 600, cursor: 'pointer',
              }}>
                {saved ? '✓ Saved!' : 'Save Avatar'}
              </button>
            )}
            {avatar && (
              <button onClick={removeAvatar} style={{
                padding: '8px 16px', borderRadius: 6, border: '1px solid rgba(239,68,68,0.3)',
                background: 'transparent', color: 'var(--red-soft)', fontSize: 12,
                fontWeight: 600, cursor: 'pointer',
              }}>Remove</button>
            )}
          </div>
        </div>

        {/* Fields */}
        <div className="ra-card" style={{ overflow: 'hidden' }}>
          {fields.map((f, i) => (
            <div key={i} style={{ padding: '14px 20px', borderBottom: i < fields.length - 1 ? '1px solid var(--border)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{f.label}</span>
              <span style={{ fontSize: 13, color: 'var(--text-primary)', fontFamily: f.mono ? 'JetBrains Mono, monospace' : 'inherit' }}>{f.value}</span>
            </div>
          ))}
        </div>

        <div style={{ padding: '12px 16px', background: 'rgba(124,58,237,0.06)', borderRadius: 6, border: '1px solid rgba(124,58,237,0.15)', fontSize: 12, color: 'var(--text-dim)' }}>
          Session tokens expire after 8 hours. TOTP re-authentication required on next login.
        </div>
      </div>
    </PortalLayout>
  );
}
