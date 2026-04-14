import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { endpoints } from './lib/api';

export default function AuthPortal({ isInvite = false }) {
    const { completeRelayLogin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { token } = useParams();
    
    // UI State
    const [activeTab, setActiveTab] = useState(isInvite ? 'accept_invite' : 'login');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successData, setSuccessData] = useState(null);

    // Relay State
    const [loginStep, setLoginStep] = useState('identify'); // 'identify' or 'verify'
    const [intentToken, setIntentToken] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        email: '', 
        orgId: '', 
        totpCode: '',
        entityPrefix: '', 
        displayName: '', 
        serverRegion: 'IN',
        jurisdiction: ''
    });

    useEffect(() => {
        if (isInvite && token) {
            verifyInviteToken();
        }
    }, [isInvite, token]);

    const verifyInviteToken = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(endpoints.verifyInvite(token));
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || 'Invitation invalid or expired');
            setFormData(prev => ({ ...prev, email: data.email }));
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            if (loginStep === 'identify') {
                const res = await fetch(endpoints.identify, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: formData.email, org_id: formData.orgId })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.detail || 'Identity lookup failed');
                setIntentToken(data.intent_token);
                setLoginStep('verify');
            } else {
                const res = await fetch(endpoints.verifyTotp, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: formData.email,
                        org_id: formData.orgId,
                        totp_code: formData.totpCode,
                        intent_token: intentToken
                    })
                });
                const data = await res.json();
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
            payload.append('entity_prefix', formData.entityPrefix.trim().toLowerCase());
            payload.append('display_name', formData.displayName);
            payload.append('email', formData.email);
            payload.append('password', 'DUMMY_UNUSED'); // Backend now handles passwordless
            payload.append('server_region', formData.serverRegion);

            const res = await fetch(endpoints.registerOrg, { method: 'POST', body: payload });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || 'Onboarding failed');
            setSuccessData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    function GridBackground() {
        return (
            <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(34,211,238,0.03) 0%, transparent 70%)',
                }} />
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: `
                        linear-gradient(rgba(34,211,238,0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(34,211,238,0.03) 1px, transparent 1px)
                    `,
                    backgroundSize: '48px 48px',
                }} />
            </div>
        )
    }

    if (successData) {
        return (
            <div className="min-h-screen bg-[#08080D] flex items-center justify-center font-mono p-4">
                <div className="w-full max-w-lg bg-[#0D0D14] border border-[#1E293B] p-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                    <h2 className="text-xl mb-2 tracking-widest uppercase text-emerald-400">Request Processed</h2>
                    <p className="text-slate-400 text-sm mb-6 leading-relaxed">{successData.message}</p>
                    <button onClick={() => setSuccessData(null)}
                        className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 py-4 text-xs font-bold tracking-widest uppercase items-center">
                        Proceed to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#08080D] flex flex-col items-center justify-center font-mono p-4 relative">
            <GridBackground />
            <div className="w-full max-w-xl bg-[#0D0D14] border border-[#1E293B] shadow-2xl overflow-hidden relative z-10">
                {/* Header Strip */}
                <div className="flex items-center gap-4 px-8 py-6 bg-[#08080D] border-b border-[#1E293B]">
                    <div className="w-8 h-8 flex items-center justify-center bg-cyan-500/10 border border-cyan-500/30">
                        <div className="w-3 h-3 bg-cyan-500" />
                    </div>
                    <div>
                        <div className="text-[12px] font-bold tracking-[0.2em] uppercase text-cyan-400">Security Clearance</div>
                        <div className="text-[9px] tracking-widest uppercase text-slate-600 mt-1">Federated Node Link Established</div>
                    </div>
                </div>

                <div className="p-20">
                {error && (
                    <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] uppercase font-bold tracking-widest leading-relaxed">
                        [SECURITY_ERROR] {error}
                    </div>
                )}

                {activeTab === 'login' && (
                    <form onSubmit={handleLogin} className="space-y-16 animate-in fade-in duration-500">
                        {loginStep === 'identify' ? (
                            <>
                                <div className="space-y-4">
                                    <label className="block text-[11px] text-[#8B949E] tracking-[0.3em] uppercase font-bold">Primary Identity (Email)</label>
                                    <input required type="email" name="email" value={formData.email} onChange={handleInputChange}
                                        className="w-full bg-[#08080D] border border-[#1E293B] focus:border-cyan-400/50 text-slate-200 h-14 px-5 text-sm outline-none transition-all shadow-inner"
                                        placeholder="user@organization.com" />
                                </div>
                                <div className="space-y-4">
                                    <label className="block text-[11px] text-[#8B949E] tracking-[0.3em] uppercase font-bold">Organizational ID (Entity)</label>
                                    <input required type="text" name="orgId" value={formData.orgId} onChange={handleInputChange}
                                        className="w-full bg-[#08080D] border border-[#1E293B] focus:border-cyan-400/50 text-slate-200 h-14 px-5 text-sm outline-none transition-all shadow-inner"
                                        placeholder="e.g. animuslab" />
                                </div>
                            </>
                        ) : (
                            <div className="text-center">
                                <div className="mb-10 p-6 bg-cyan-500/5 border border-cyan-500/20 rounded-xl">
                                    <p className="text-[10px] text-cyan-400 tracking-widest uppercase mb-1">Identity Confirmed</p>
                                    <p className="text-white text-sm font-bold">{formData.email}</p>
                                </div>
                                <label className="block text-[11px] text-[#8B949E] tracking-[0.3em] uppercase mb-6 font-bold text-center">Enter 6-Digit Verify Code</label>
                                <input required type="text" name="totpCode" maxLength={6} value={formData.totpCode} onChange={handleInputChange} autoFocus
                                    className="w-full bg-[#08080D] border-b-2 border-[#1E293B] focus:border-cyan-400 text-cyan-400 text-4xl text-center h-20 outline-none transition-all tracking-[0.6em] font-bold"
                                    placeholder="000000" />
                                <button type="button" onClick={() => setLoginStep('identify')}
                                    className="mt-8 text-[9px] text-slate-600 hover:text-slate-400 uppercase tracking-widest transition-colors font-bold">
                                    ← RE-IDENTIFY ACCOUNT
                                </button>
                            </div>
                        )}
                        <button disabled={isLoading} type="submit"
                            className="w-full bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-black border border-cyan-500/50 py-5 text-xs font-bold tracking-widest uppercase transition-all duration-300">
                            {isLoading ? 'AUTHORIZING...' : loginStep === 'identify' ? 'PROCEED TO CHALLENGE' : 'VERIFY & ESTABLISH SESSION'}
                        </button>
                    </form>
                )}
                </div>
                
                {/* System Bar */}
                <div className="flex items-center justify-between px-8 py-4 bg-[#08080D] border-t border-[#1E293B]">
                    <span className="text-[9px] tracking-widest uppercase text-slate-700">mesh.anchorgovernance.tech</span>
                    <span className="text-[9px] font-mono text-slate-700 uppercase">Authenticated Session Required</span>
                </div>
            </div>
        </div>
    );
}