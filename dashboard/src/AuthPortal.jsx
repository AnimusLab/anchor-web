import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { endpoints } from './lib/api';

/* Animated grid background */
function GridBg() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(16,185,129,0.06) 0%, transparent 60%)',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(16,185,129,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(16,185,129,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '52px 52px',
      }} />
    </div>
  );
}

function StatusDot({ online = true }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      <div style={{
        width: 7, height: 7, borderRadius: '50%',
        background: online ? '#10b981' : '#ef4444',
        boxShadow: online ? '0 0 8px #10b981' : '0 0 8px #ef4444',
        animation: 'pulse 2s infinite',
      }} />
      <span style={{
        fontSize: 11, fontFamily: 'JetBrains Mono, monospace',
        color: online ? '#10b981' : '#ef4444',
        letterSpacing: '0.08em',
      }}>
        {online ? 'SOVEREIGN RELAY ACTIVE' : 'RELAY OFFLINE'}
      </span>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={{
        fontSize: 11, fontWeight: 600, color: '#6b7280',
        letterSpacing: '0.1em', textTransform: 'uppercase',
        fontFamily: 'Inter, sans-serif',
      }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%',
  background: 'rgba(0,0,0,0.4)',
  border: '1px solid #1f2937',
  borderRadius: 8,
  padding: '12px 16px',
  fontSize: 14,
  color: '#f9fafb',
  fontFamily: 'Inter, sans-serif',
  outline: 'none',
  transition: 'border-color 0.15s, box-shadow 0.15s',
};

export default function AuthPortal({ isInvite = false }) {
  const { completeRelayLogin } = useAuth();
  const navigate = useNavigate();
  const { token } = useParams();

  const [activeTab, setActiveTab] = useState(isInvite ? 'accept_invite' : 'login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);
  const [loginStep, setLoginStep] = useState('identify');
  const [intentToken, setIntentToken] = useState(null);
  const [focusedField, setFocusedField] = useState(null);
  const [formData, setFormData] = useState({
    email: '', orgId: '', clearanceId: '', totpCode: '',
    entityPrefix: '', serverRegion: 'IN', jurisdiction: '',
    displayName: '', companyName: '',
  });

  useEffect(() => {
    if (isInvite && token) verifyInviteToken();
  }, [isInvite, token]);

  const safeJson = async (res) => {
    const text = await res.text();
    try { return JSON.parse(text); }
    catch { return { detail: text || `Error ${res.status}: ${res.statusText}` }; }
  };

  const verifyInviteToken = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(endpoints.verifyInvite(token));
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data.detail || 'Invitation invalid or expired');
      setFormData(prev => ({ 
        ...prev, 
        email: data.email, 
        orgId: data.org_id, 
        clearanceId: data.clearance_id 
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      if (loginStep === 'identify') {
        const res = await fetch(endpoints.identify, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: formData.email, 
            hub_id: formData.orgId,
            clearance_id: formData.clearanceId 
          })
        });
        const data = await safeJson(res);
        if (!res.ok) throw new Error(data.detail || 'Identity lookup failed');
        setIntentToken(data.intent_token);
        setLoginStep('verify');
      } else {
        const res = await fetch(endpoints.verifyTotp, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email, hub_id: formData.orgId,
            totp_code: formData.totpCode, intent_token: intentToken
          })
        });
        const data = await safeJson(res);
        if (!res.ok) throw new Error(data.detail || 'Invalid verification code');
        const role = await completeRelayLogin(data.access_token);
        if (role) navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const payload = new FormData();
      // Derive hub_id: lowercase, no spaces
      const derivedHubId = formData.companyName.trim().toLowerCase().replace(/\s+/g, '-');
      payload.append('hub_id', derivedHubId);
      payload.append('display_name', formData.displayName);
      payload.append('company_name', formData.companyName);
      payload.append('email', formData.email);
      payload.append('password', 'DUMMY_UNUSED');
      payload.append('server_region', formData.serverRegion);
      payload.append('department', formData.department);
      const res = await fetch(endpoints.registerOrg, { method: 'POST', body: payload });
      const data = await safeJson(res);
      if (!res.ok) {
        const errorMsg = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail) || 'Onboarding failed';
        throw new Error(errorMsg);
      }
      setSuccessData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (successData) {
    return (
      <div style={{ minHeight: '100vh', background: '#060610', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'Inter, sans-serif' }}>
        <GridBg />
        <div style={{
          position: 'relative', zIndex: 1, width: '100%', maxWidth: 480,
          background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: 16, padding: 40, textAlign: 'center',
        }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>✓</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#f9fafb', marginBottom: 8 }}>Request Submitted</div>
          <p style={{ fontSize: 14, color: '#9ca3af', lineHeight: 1.7, marginBottom: 28 }}>{successData.message}</p>
          <button onClick={() => { setSuccessData(null); setActiveTab('login'); }} style={{
            width: '100%', padding: '12px', borderRadius: 8, background: 'rgba(16,185,129,0.12)',
            border: '1px solid rgba(16,185,129,0.4)', color: '#34d399', fontSize: 14,
            fontWeight: 600, cursor: 'pointer',
          }}>
            Proceed to Login →
          </button>
        </div>
      </div>
    );
  }

  // ── Main layout ───────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh', background: '#060610',
      display: 'flex', fontFamily: 'Inter, sans-serif', overflow: 'hidden',
    }}>
      <GridBg />

      {/* ── Left brand panel ── */}
      <div style={{
        width: 420, flexShrink: 0, display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', padding: '48px 48px',
        borderRight: '1px solid #111827',
        position: 'relative', zIndex: 1,
      }}
        className="hidden-mobile"
      >
        {/* Logo */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
            <div style={{
              width: 36, height: 36, background: '#10b981', borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg viewBox="0 0 20 20" fill="white" style={{ width: 18, height: 18 }}>
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#f9fafb' }}>Anchor</div>
              <div style={{ fontSize: 11, color: '#10b981', letterSpacing: '0.08em', fontFamily: 'JetBrains Mono, monospace' }}>ENTERPRISE PORTAL</div>
            </div>
          </div>

          <div style={{ marginBottom: 40 }}>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: '#f9fafb', lineHeight: 1.2, marginBottom: 16 }}>
              Sovereign<br />
              <span style={{ color: '#10b981' }}>Governance</span><br />
              Gateway
            </h1>
            <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7 }}>
              Authenticate your enterprise identity to access real-time AI governance, audit trails, and compliance dashboards.
            </p>
          </div>

          {/* Feature list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { icon: '🛡', text: 'TOTP cryptographic authentication' },
              { icon: '📋', text: 'Real-time audit ledger access' },
              { icon: '🌐', text: 'Federated mesh telemetry' },
              { icon: '⚖️', text: '170 governance rules enforced' },
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 16 }}>{f.icon}</span>
                <span style={{ fontSize: 13, color: '#9ca3af' }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status */}
        <div>
          <StatusDot online={true} />
          <div style={{ marginTop: 12, fontSize: 11, color: '#374151', fontFamily: 'JetBrains Mono, monospace' }}>
            mesh.anchorgovernance.tech
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px', position: 'relative', zIndex: 1,
      }}>
        <div style={{ width: '100%', maxWidth: 440 }}>

          {/* Tab switcher */}
          <div style={{
            display: 'flex', gap: 4,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid #1f2937',
            borderRadius: 10, padding: 4,
            marginBottom: 32,
          }}>
            {['login', 'register'].map(tab => (
              <button key={tab} onClick={() => { setActiveTab(tab); setError(''); }}
                style={{
                  flex: 1, padding: '9px 0', borderRadius: 7, fontSize: 13,
                  fontWeight: 600, border: 'none', cursor: 'pointer',
                  background: activeTab === tab ? '#10b981' : 'transparent',
                  color: activeTab === tab ? '#fff' : '#6b7280',
                  transition: 'all 0.15s',
                }}>
                {tab === 'login' ? '🔐 Sign In' : '🏢 Onboard'}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: '12px 16px', borderRadius: 8, marginBottom: 20,
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#f87171', fontSize: 13, lineHeight: 1.5,
            }}>
              ✗ {error}
            </div>
          )}

          {/* ── LOGIN FLOW ── */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {loginStep === 'identify' ? (
                <>
                  <div style={{ marginBottom: 4 }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#f9fafb', marginBottom: 6 }}>Welcome back</div>
                    <div style={{ fontSize: 14, color: '#6b7280' }}>Enter your identity credentials to proceed.</div>
                  </div>
                  <Field label="Corporate Access Email">
                    <input required type="email" name="email" value={formData.email} onChange={handleInputChange}
                      placeholder="owner@company.ai"
                      style={{ ...inputStyle, borderColor: focusedField === 'email' ? '#10b981' : '#1f2937' }}
                      onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
                    />
                  </Field>
                  <Field label="Organization Hub ID">
                    <input required type="text" name="orgId" value={formData.orgId} onChange={handleInputChange}
                      placeholder="e.g. animuslab"
                      style={{ ...inputStyle, fontFamily: 'JetBrains Mono, monospace', borderColor: focusedField === 'orgId' ? '#10b981' : '#1f2937' }}
                      onFocus={() => setFocusedField('orgId')} onBlur={() => setFocusedField(null)}
                    />
                  </Field>
                  <Field label="Tactical Clearance ID">
                    <input required type="text" name="clearanceId" value={formData.clearanceId} onChange={handleInputChange}
                      placeholder="e.g. DEV-SEC-X92F"
                      style={{ ...inputStyle, fontFamily: 'JetBrains Mono, monospace', borderColor: focusedField === 'clearanceId' ? '#10b981' : '#1f2937' }}
                      onFocus={() => setFocusedField('clearanceId')} onBlur={() => setFocusedField(null)}
                    />
                  </Field>
                </>
              ) : (
                <>
                  <div style={{ marginBottom: 4 }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#f9fafb', marginBottom: 6 }}>Verify Identity</div>
                    <div style={{ fontSize: 14, color: '#6b7280' }}>Enter the 6-digit code from your TOTP app.</div>
                  </div>
                  <div style={{
                    padding: '16px', borderRadius: 8,
                    background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 11, color: '#10b981', marginBottom: 4, letterSpacing: '0.08em' }}>IDENTITY CONFIRMED</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#f9fafb' }}>{formData.email}</div>
                  </div>
                  <input required type="text" name="totpCode" maxLength={6} value={formData.totpCode}
                    onChange={handleInputChange} autoFocus
                    placeholder="000000"
                    style={{
                      ...inputStyle, textAlign: 'center', fontSize: 36, letterSpacing: '0.4em',
                      fontWeight: 700, fontFamily: 'JetBrains Mono, monospace',
                      color: '#10b981',
                      borderColor: focusedField === 'totp' ? '#10b981' : '#1f2937',
                      boxShadow: focusedField === 'totp' ? '0 0 0 3px rgba(16,185,129,0.1)' : 'none',
                    }}
                    onFocus={() => setFocusedField('totp')} onBlur={() => setFocusedField(null)}
                  />
                  <button type="button" onClick={() => setLoginStep('identify')} style={{
                    background: 'none', border: 'none', color: '#6b7280', fontSize: 13,
                    cursor: 'pointer', fontFamily: 'Inter, sans-serif', padding: 0,
                  }}>
                    ← Back to identity
                  </button>
                </>
              )}
              <button type="submit" disabled={isLoading} style={{
                width: '100%', padding: '13px', borderRadius: 8, fontSize: 14,
                fontWeight: 700, border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer',
                background: '#10b981', color: '#fff', opacity: isLoading ? 0.6 : 1,
                transition: 'opacity 0.15s',
                letterSpacing: '0.04em',
              }}>
                {isLoading ? 'Authenticating...' : loginStep === 'identify' ? 'Continue →' : 'Establish Session →'}
              </button>
            </form>
          )}

          {/* ── REGISTER FLOW ── */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ marginBottom: 4 }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#f9fafb', marginBottom: 6 }}>Onboard Enterprise</div>
                <div style={{ fontSize: 14, color: '#6b7280' }}>Register your organization on the Anchor mesh.</div>
              </div>
              <Field label="Your Full Name">
                <input required type="text" name="displayName" value={formData.displayName} onChange={handleInputChange}
                  placeholder="YOUR FULL NAME"
                  style={{ ...inputStyle, borderColor: '#1f2937' }}
                  onFocus={e => e.target.style.borderColor = '#10b981'}
                  onBlur={e => e.target.style.borderColor = '#1f2937'}
                />
              </Field>
              <Field label="Your Corporate Email">
                <input required type="email" name="email" value={formData.email} onChange={handleInputChange}
                  placeholder="owner@company.ai"
                  style={{ ...inputStyle, borderColor: '#1f2937' }}
                  onFocus={e => e.target.style.borderColor = '#10b981'}
                  onBlur={e => e.target.style.borderColor = '#1f2937'}
                />
              </Field>
              <Field label="Company Name">
                <input required type="text" name="companyName" value={formData.companyName} onChange={handleInputChange}
                  placeholder="e.g. Global Bank"
                  style={{ ...inputStyle, borderColor: '#1f2937' }}
                  onFocus={e => e.target.style.borderColor = '#10b981'}
                  onBlur={e => e.target.style.borderColor = '#1f2937'}
                />
              </Field>
              <Field label="Region of your department or company">
                <select required name="serverRegion" value={formData.serverRegion} onChange={handleInputChange}
                  style={{ ...inputStyle, appearance: 'none', borderColor: '#1f2937', cursor: 'pointer' }}>
                  <option value="">Select Region</option>
                  <option value="IN">India (IN)</option>
                  <option value="US">United States (US)</option>
                  <option value="EU">European Union (EU)</option>
                  <option value="UK">United Kingdom (UK)</option>
                  <option value="SG">Singapore (SG)</option>
                  <option value="AE">United Arab Emirates (UAE)</option>
                  <option value="CA">Canada (CA)</option>
                  <option value="AU">Australia (AU)</option>
                  <option value="JP">Japan (JP)</option>
                  <option value="DE">Germany (DE)</option>
                  <option value="FR">France (FR)</option>
                  <option value="BR">Brazil (BR)</option>
                  <option value="CH">Switzerland (CH)</option>
                  <option value="HK">Hong Kong (HK)</option>
                  <option value="KR">South Korea (KR)</option>
                  <option value="IL">Israel (IL)</option>
                  <option value="SA">Saudi Arabia (SA)</option>
                  <option value="QA">Qatar (QA)</option>
                  <option value="ZA">South Africa (ZA)</option>
                  <option value="EG">Egypt (EG)</option>
                  <option value="BR">Brazil (BR)</option>
                  <option value="MX">Mexico (MX)</option>
                  <option value="AR">Argentina (AR)</option>
                  <option value="ID">Indonesia (ID)</option>
                  <option value="TR">Turkey (TR)</option>
                  <option value="MY">Malaysia (MY)</option>
                  <option value="TH">Thailand (TH)</option>
                  <option value="VN">Vietnam (VN)</option>
                  <option value="PH">Philippines (PH)</option>
                  <option value="NZ">New Zealand (NZ)</option>
                  <option value="NO">Norway (NO)</option>
                  <option value="SE">Sweden (SE)</option>
                  <option value="DK">Denmark (DK)</option>
                  <option value="FI">Finland (FI)</option>
                  <option value="IE">Ireland (IE)</option>
                  <option value="ES">Spain (ES)</option>
                  <option value="IT">Italy (IT)</option>
                  <option value="NL">Netherlands (NL)</option>
                  <option value="BE">Belgium (BE)</option>
                  <option value="AT">Austria (AT)</option>
                  <option value="PT">Portugal (PT)</option>
                  <option value="GR">Greece (GR)</option>
                  <option value="PL">Poland (PL)</option>
                  <option value="CZ">Czech Republic (CZ)</option>
                  <option value="HU">Hungary (HU)</option>
                  <option value="RO">Romania (RO)</option>
                  <option value="UA">Ukraine (UA)</option>
                  <option value="CL">Chile (CL)</option>
                  <option value="CO">Colombia (CO)</option>
                  <option value="PE">Peru (PE)</option>
                  <option value="KZ">Kazakhstan (KZ)</option>
                  <option value="NG">Nigeria (NG)</option>
                  <option value="KE">Kenya (KE)</option>
                  <option value="GH">Ghana (GH)</option>
                </select>
              </Field>
              <Field label="Your Department / Division">
                <input required type="text" name="department" value={formData.department} onChange={handleInputChange}
                  placeholder="e.g. Risk Ops, Compliance"
                  style={{ ...inputStyle, borderColor: '#1f2937' }}
                  onFocus={e => e.target.style.borderColor = '#10b981'}
                  onBlur={e => e.target.style.borderColor = '#1f2937'}
                />
              </Field>
              <div style={{
                padding: '12px 16px', borderRadius: 8,
                background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)',
                fontSize: 12, color: '#fbbf24', lineHeight: 1.6,
              }}>
                ℹ Registration requests are reviewed by the Root Administrator before activation. All regions use localized sovereignty protocols.
              </div>
              <button type="submit" disabled={isLoading} style={{
                width: '100%', padding: '13px', borderRadius: 8, fontSize: 14,
                fontWeight: 700, border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer',
                background: '#10b981', color: '#fff', opacity: isLoading ? 0.6 : 1,
              }}>
                {isLoading ? 'Submitting...' : 'Submit for Review →'}
              </button>
            </form>
          )}

        </div>
        <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #1f2937', color: '#4b5563', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}>
          CORE_IDENTITY_PROTOCOL: v5.0.2 // WEB_v1 // TRIPLE_FACTOR_AUTH
        </div>
      </div>
    </div>
  );
}