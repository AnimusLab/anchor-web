import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { endpoints } from '../lib/api'
import AuditorBadge from '../components/AuditorBadge'


const TOKEN = {
  bg:     '#070710',
  card:   '#0c0c18',
  border: '#1a1f2e',
  amber:  '#f59e0b',
  amberL: '#fbbf24',
  amberD: 'rgba(245,158,11,0.08)',
  red:    '#ef4444',
  green:  '#10b981',
  txt:    '#f1f5f9',
  txtS:   '#94a3b8',
  txtD:   '#374151',
  mono:   "'JetBrains Mono', 'DM Mono', monospace",
  sans:   "'Inter', sans-serif",
}

const FALLBACK_JURISDICTIONS = [
  { id: 'USA', label: 'United States' },
  { id: 'INDIA', label: 'India' },
  { id: 'UK', label: 'United Kingdom' },
  { id: 'EU', label: 'European Union' },
  { id: 'AE', label: 'UAE' },
  { id: 'SG', label: 'Singapore' }
];

const iBase = {
  width: '100%',
  background: 'rgba(0,0,0,0.45)',
  border: '1px solid #1a1f2e',
  borderRadius: 8,
  padding: '12px 16px',
  fontSize: 14,
  color: TOKEN.txt,
  fontFamily: TOKEN.sans,
  outline: 'none',
  transition: 'border-color 0.15s, box-shadow 0.15s',
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <label style={{
        fontSize: 11, fontWeight: 700, color: TOKEN.txtD,
        letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: TOKEN.sans,
      }}>{label}</label>
      {children}
    </div>
  )
}

function Dot({ color = TOKEN.amber, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      <div style={{ width: 7, height: 7, borderRadius: '50%', background: color, boxShadow: `0 0 7px ${color}` }} />
      <span style={{ fontSize: 11, fontFamily: TOKEN.mono, color, letterSpacing: '0.08em' }}>{label}</span>
    </div>
  )
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [activeTab, setActiveTab] = useState('login') // 'login' | 'register'
  const [form, setForm] = useState({ 
    clearanceId: '', 
    agencyId: '', 
    email: '', 
    totp: '',
    displayName: '', 
    agencyName: '',
    jurisdiction: 'US' 
  })
  const [stage, setStage] = useState('identify')   // 'identify' | 'verify'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)
  const [focused, setFocused] = useState(null)
  const [jurisdictionData, setJurisdictionData] = useState([])

  useEffect(() => {
    fetch(`${endpoints.baseUrl}/api/auth/jurisdictions`)
      .then(res => {
        if (!res.ok) throw new Error('API_REACH_FAILURE');
        return res.json();
      })
      .then(data => {
        if (data.jurisdictions && data.jurisdictions.length > 0) {
          setJurisdictionData(data.jurisdictions);
        } else {
          setJurisdictionData(FALLBACK_JURISDICTIONS);
        }
      })
      .catch((err) => {
        console.warn('Oversight Jurisdictions: API unavailable, using fallbacks.', err);
        setJurisdictionData(FALLBACK_JURISDICTIONS);
      });
  }, [])

  useEffect(() => {
    const id = form.clearanceId.trim().toUpperCase();

    if (id.length === 0) {
      setForm(prev => ({ ...prev, email: '', agencyId: '' }));
      return;
    }

    if (id.length < 5 || activeTab !== 'login' || stage !== 'identify') {
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${endpoints.baseUrl}/api/auth/identify-first`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clearance_id: id }),
          signal: controller.signal
        });

        if (!res.ok) return;

        const data = await res.json();
        if (data.status === 'ERROR' || !data.email) return;

        setForm(prev => ({
          ...prev,
          email: prev.email ? prev.email : data.email,
          agencyId: data.hub_id || prev.agencyId,
          displayName: data.display_name || prev.displayName,
        }));
      } catch (e) {
        // ignore aborts
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [form.clearanceId, activeTab, stage]);

  const f = (field) => ({
    ...iBase,
    borderColor: focused === field ? TOKEN.amber : TOKEN.border,
    boxShadow: focused === field ? `0 0 0 3px rgba(245,158,11,0.1)` : 'none',
  })

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))
  const fo = (k) => () => setFocused(k)
  const bl =  () => setFocused(null)

  const safeJson = async (res) => {
    const text = await res.text();
    try { return JSON.parse(text); }
    catch { return { detail: text || `Error ${res.status}: ${res.statusText}` }; }
  };

  const handleIdentify = async (e) => {
    e.preventDefault()
    if (!form.clearanceId || !form.agencyId || !form.email) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${endpoints.baseUrl}/api/oversight/identify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clearance_id: form.clearanceId.trim().toUpperCase(),
          email:        form.email.trim().toLowerCase(),
        })
      })
      const data = await safeJson(res);
      if (res.ok) {
        setForm(prev => ({ 
          ...prev, 
          displayName: data.display_name,
          agencyId: data.agency_hub_id || prev.agencyId,
          email: data.email || prev.email
        }))
        setStage('verify')
      } else {
        setError(data.detail || 'Identity not found.')
      }
    } catch (err) {
      setError('Handshake failed: ' + (err.message || 'Connection error'))
    } finally {
      setLoading(false)
    }
  }

  // --- Auto-fill logic ---
  useEffect(() => {
    const id = form.clearanceId.trim().toUpperCase()
    // Trigger lookup when ID matches tactical pattern (e.g. SEC-ALFA-9)
    if (id.length >= 5 && stage === 'identify') {
      const timer = setTimeout(async () => {
        try {
          const res = await fetch(endpoints.identifyFirst, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clearance_id: id })
          })
          if (res.ok) {
            const data = await res.json()
            setForm(prev => {
              const dName = data.display_name || "AUTHORIZED AUDITOR";
              let aName = data.org_name || "REGULATORY BUREAU";
              
              if (aName.toUpperCase() === dName.toUpperCase()) {
                aName = "VERIFIED AGENCY";
              }
              
              return {
                ...prev,
                agencyId: data.hub_id || prev.agencyId,
                email: data.email || prev.email,
                displayName: dName,
                agencyName: aName
              };
            })
          }
        } catch (e) { /* silent fail for auto-fill */ }
      }, 600)
      return () => clearTimeout(timer)
    } else if (id.length === 0) {
       setForm(prev => ({ ...prev, email: '', agencyId: '' }));
    }
  }, [form.clearanceId, stage])

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const payload = new FormData();
      payload.append('display_name', form.displayName);
      payload.append('email', form.email);
      payload.append('jurisdiction', form.jurisdiction);
      payload.append('department', form.agencyId || 'General');

      const res = await fetch(`${endpoints.baseUrl}/api/auth/register/auditor`, {
        method: 'POST',
        body: payload
      })
      const data = await safeJson(res);
      if (res.ok) {
        setSuccess(data.message)
      } else {
        const errorMsg = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail) || 'Registration failed.';
        setError(errorMsg);
      }
    } catch (err) {
      setError('Connection failed: ' + (err.message || 'Server unreachable.'))
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${endpoints.baseUrl}/api/oversight/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clearance_id: form.clearanceId.trim().toUpperCase(),
          hub_id:       form.agencyId.trim().toUpperCase(),
          email:        form.email.trim().toLowerCase(),
          totp_code:    form.totp.trim(),
        }),
      })
      const data = await safeJson(res);
      if (res.ok && data.access_token) {
        // Normalize to consistent user object (API uses display_name/entity_id, profile reads name/sub)
        const userData = {
          ...data,
          name:      data.display_name,   // JWT claim: "name"
          sub:       data.entity_id,      // JWT claim: "sub" = clearance ID
          regulator: data.regulator,      // department e.g. "RBI"
          access_level: data.access_level || 'READ_ONLY',
          session_id:   data.session_id,
        }
        login(data.access_token, userData)

        // Backup persistence
        localStorage.setItem('anchor_token', data.access_token)
        localStorage.setItem('anchor_entity', data.entity_id)
        localStorage.setItem('anchor_regulator', data.regulator)

        navigate('/dashboard')
      } else {
        setError(data.detail || 'Verification failed.')
      }
    } catch {
      setError('Connection failed.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: TOKEN.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ position: 'relative', zIndex: 2, background: 'rgba(7,7,16,0.8)', padding: 40, borderRadius: 20, border: `1px solid ${TOKEN.acc}`, width: '100%', maxWidth: 440, backdropFilter: 'blur(10px)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>✓</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: TOKEN.txt, marginBottom: 8 }}>Request Submitted</div>
          <p style={{ fontSize: 13, color: TOKEN.txtS, lineHeight: 1.6 }}>{success}</p>
          <button onClick={() => { setSuccess(null); setActiveTab('login'); }} style={{ marginTop: 24, width: '100%', padding: 13, borderRadius: 8, background: 'rgba(16,185,129,0.1)', border: `1px solid ${TOKEN.green}`, color: TOKEN.green, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Return to Login</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: TOKEN.bg, display: 'flex', fontFamily: TOKEN.sans, overflow: 'hidden' }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes scanH { from{transform:translateY(-100%);opacity:0} 50%{opacity:0.25} to{transform:translateY(100vh);opacity:0} }
        .scan-beam { animation: scanH 6s linear infinite; position:absolute; left:0; right:0; top:0; height:2px; }
      `}</style>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(245,158,11,0.06) 0%, transparent 55%)' }} />
        <div className="scan-beam" style={{ background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.35), transparent)' }} />
      </div>

      <div style={{ width: 400, flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '48px 40px', borderRight: `1px solid ${TOKEN.border}`, position: 'relative', zIndex: 10, background: 'rgba(7,7,16,0.6)', backdropFilter: 'blur(20px)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
            <div style={{ width: 36, height: 36, background: TOKEN.amber, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 24 24" fill="#1c1200" style={{ width: 18, height: 18 }}><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: TOKEN.txt }}>Anchor Oversight</div>
              <div style={{ fontSize: 10, color: TOKEN.amber, letterSpacing: '0.1em', fontFamily: TOKEN.mono }}>REGULATORY PORTAL</div>
            </div>
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: TOKEN.txt, lineHeight: 1.15, marginBottom: 16 }}>Cryptographic <span style={{ color: TOKEN.amber }}>Audit Ledger</span> Access</h1>
          <p style={{ fontSize: 13, color: TOKEN.txtS, lineHeight: 1.75, marginBottom: 32 }}>Authorized regulators access tamper-evident AI governance records via secure relay.</p>
          
          <Dot color={TOKEN.amber} label="REGULATORY RELAY ACTIVE" />
        </div>

        <div style={{ padding: 20, background: 'rgba(245,158,11,0.05)', border: `1px solid rgba(245,158,11,0.2)`, borderRadius: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: TOKEN.amber, boxShadow: `0 0 10px ${TOKEN.amber}` }} />
              <span style={{ fontSize: 11, fontWeight: 800, color: TOKEN.amber, letterSpacing: '0.1em' }}>CLEARANCE PROTOCOL</span>
          </div>
          <p style={{ fontSize: 11, color: TOKEN.txtS, margin: 0, lineHeight: 1.6 }}>
            Mission identity verification requires 48 hours for administrative clearance review. Access is cryptographically scoped per session.
          </p>
        </div>
      </div>

      {/* ── Main content area with Grid ── */}
      <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
        {/* Background Grid */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.15, backgroundImage: `linear-gradient(${TOKEN.border} 1px, transparent 1px), linear-gradient(90deg, ${TOKEN.border} 1px, transparent 1px)`, backgroundSize: '50px 50px' }} />

        {/* Global Identity Layer (Behind Form, Full Width) */}
        <AuditorBadge 
          active={true} 
          name={form.displayName || "AUDITOR"} 
          agency={form.agencyName || "PENDING"} 
          clearanceId={form.clearanceId || "ID_PENDING"} 
        />

        {/* Left Side: Handshake Form */}
        <div style={{ flex: 1.2, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', position: 'relative', zIndex: 10 }}>
          <div style={{ width: '100%', maxWidth: 440 }}>
            <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.03)', border: `1px solid ${TOKEN.border}`, borderRadius: 10, padding: 4, marginBottom: 32 }}>
              {['login', 'register'].map(tab => (
                <button key={tab} onClick={() => { setActiveTab(tab); setStage('identify'); setError(''); }} style={{ flex: 1, padding: '9px 0', borderRadius: 7, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', background: activeTab === tab ? TOKEN.amber : 'transparent', color: activeTab === tab ? '#1c1200' : TOKEN.txtS }}>{tab === 'login' ? '🔐 Sign In' : '🛡️ Onboard'}</button>
              ))}
            </div>

            {error && <div style={{ padding: '12px 16px', borderRadius: 8, marginBottom: 20, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: 13 }}>✗ {error}</div>}

            {activeTab === 'login' ? (
              <form onSubmit={stage === 'identify' ? handleIdentify : handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {stage === 'identify' ? (
                  <>
                    <Field label="Tactical Clearance ID"><input required autoComplete="off" type="text" value={form.clearanceId} onChange={set('clearanceId')} onFocus={fo('clearanceId')} onBlur={bl} placeholder="E.G. SEC-ALFA-9" style={f('clearanceId')} /></Field>
                    <Field label="Agency Hub ID"><input required autoComplete="off" type="text" value={form.agencyId} onChange={set('agencyId')} onFocus={fo('agencyId')} onBlur={bl} placeholder="SEC, RBI, NIST..." style={f('agencyId')} /></Field>
                    <Field label="Your Official Email"><input required autoComplete="off" type="email" value={form.email} onChange={set('email')} onFocus={fo('email')} onBlur={bl} placeholder="auditor@regulator.gov" style={f('email')} /></Field>
                  </>
                ) : (
                  <>
                    <div style={{ padding: '14px 18px', borderRadius: 8, background: TOKEN.amberD, border: `1px solid rgba(245,158,11,0.2)` }}>
                      <div style={{ fontSize: 9, color: TOKEN.amber, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Identity Recognized</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: TOKEN.txt }}>{form.clearanceId} // {form.agencyId}</div>
                    </div>
                    <Field label="6-Digit TOTP Code"><input required type="text" maxLength={6} value={form.totp} onChange={set('totp')} onFocus={fo('totp')} onBlur={bl} placeholder="000000" style={{ ...f('totp'), textAlign: 'center', fontSize: 32, letterSpacing: '0.3em' }} /></Field>
                  </>
                )}
                <button type="submit" style={{ width: '100%', padding: 13, borderRadius: 8, fontSize: 14, fontWeight: 700, background: TOKEN.amber, color: '#1c1200', border: 'none', cursor: 'pointer' }}>{stage === 'identify' ? 'Review Clearance →' : 'Initialize Session →'}</button>
              </form>
            ) : (
              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <Field label="Your Full Name"><input required type="text" value={form.displayName} onChange={set('displayName')} placeholder="YOUR FULL NAME" style={f('dn')} /></Field>
                <Field label="Your Official Email"><input required type="email" value={form.email} onChange={set('email')} placeholder="auditor@regulator.gov" style={f('em')} /></Field>
                <Field label="Requested Agency Hub ID"><input required type="text" value={form.agencyId} onChange={set('agencyId')} placeholder="E.G. SEC, RBI" style={f('ai')} /></Field>
                <Field label="Jurisdiction (Nation State)">
                  <select required value={form.jurisdiction} onChange={set('jurisdiction')} style={{ ...f('jx'), appearance: 'none' }}>
                    <option value="">Select Nation</option>
                    {jurisdictionData.map(jx => (
                      <option key={jx.id} value={jx.id}>{jx.label}</option>
                    ))}
                  </select>
                </Field>
                <button type="submit" disabled={loading} style={{ width: '100%', padding: 13, borderRadius: 8, fontSize: 14, fontWeight: 700, background: TOKEN.amber, color: '#1c1200', border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}>
                  {loading ? 'Submitting...' : 'Request Access →'}
                </button>
              </form>
            )}

            <div style={{ marginTop: 24, textAlign: 'center', fontSize: 11, color: TOKEN.txtD, fontFamily: TOKEN.mono }}>
              ENFORCEMENT PRIORITY: 01 · SYSTEM_VERSION: v5.0.2-OVERSIGHT // WEB_v1
            </div>
          </div>
        </div>

        {/* Right Side: Spacer & Interaction Label */}
        <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', borderLeft: `1px solid rgba(255,255,255,0.02)`, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', bottom: 40, textAlign: 'center', pointerEvents: 'none' }}>
            <div style={{ fontSize: 9, color: TOKEN.txtD, letterSpacing: '0.4em', fontWeight: 800 }}>IDENTITY_ZONE // 3D_SCAN_ACTIVE</div>
          </div>
        </div>
      </div>
    </div>
  )
}
