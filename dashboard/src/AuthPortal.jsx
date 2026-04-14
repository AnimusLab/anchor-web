import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { endpoints } from './lib/api';

export default function AuthPortal({ isInvite = false }) {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { token } = useParams();
    
    // UI State
    const [activeTab, setActiveTab] = useState(isInvite ? 'accept_invite' : 'login');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successData, setSuccessData] = useState(null);

    // Invite Context
    const [inviteContext, setInviteContext] = useState(null);

    // ID Availability States
    const [idStatus, setIdStatus] = useState('idle'); 
    const [cleanEntityId, setCleanEntityId] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        email: '', password: '',
        entityPrefix: '', displayName: '', 
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
            
            setInviteContext(data);
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
            const role = await login(formData.email, formData.password);
            const origin = location.state?.from?.pathname;
            if (origin) {
                navigate(origin);
            } else {
                if (role === 'admin') navigate('/admin');
                else if (role === 'owner' || role === 'enterprise' || role === 'root') navigate('/dashboard');
                else navigate('/');
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
            payload.append('password', formData.password);
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

    const handleRequestAccess = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const payload = new FormData();
            payload.append('display_name', formData.displayName);
            payload.append('email', formData.email);
            payload.append('jurisdiction', formData.jurisdiction);

            const res = await fetch(endpoints.requestAccess, { method: 'POST', body: payload });
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.detail || 'Request failed');
            setSuccessData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAcceptInvite = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const payload = new FormData();
            payload.append('token', token);
            payload.append('display_name', formData.displayName);
            payload.append('password', formData.password);

            const res = await fetch(endpoints.acceptInvite, { method: 'POST', body: payload });
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.detail || 'Failed to accept invitation');
            
            setSuccessData({
                status: 'SUCCESS',
                message: `Identity Established. You are now a member of ${inviteContext?.org_name}.`
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleProceedToDashboard = async () => {
        setSuccessData(null);
        setActiveTab('login');
    };

    function GridBackground() {
        return (
            <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
                {/* Subtle cyan vignette at center */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(34,211,238,0.03) 0%, transparent 70%)',
                }} />
                {/* Grid lines */}
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
                    <button onClick={handleProceedToDashboard}
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
            <div className="mb-8 text-center text-slate-200">
                <h1 className="text-2xl tracking-[0.5em] font-bold">ANCHOR COMMAND</h1>
                <div className="flex items-center justify-center space-x-2 text-[10px] mt-2 opacity-60">
                    <span className="h-2 w-2 bg-cyan-400 rounded-full animate-pulse"></span>
                    <span className="tracking-widest uppercase">Federated Node Link Established</span>
                </div>
            </div>

            <div className="w-full max-w-xl bg-[#0D0D14] border border-[#1E293B] shadow-2xl overflow-hidden relative z-10">
                {!isInvite && (
                    <div className="flex border-b border-[#1E293B]">
                        {['login', 'register', 'auditor'].map((tab) => (
                            <button key={tab} onClick={() => { setActiveTab(tab); setError(''); }}
                                className={`flex-1 py-4 text-[10px] tracking-widest uppercase transition-all ${
                                    activeTab === tab ? 'bg-[#1E293B]/50 text-cyan-400 border-b-2 border-cyan-400 font-bold' : 'text-slate-500 hover:text-slate-300'
                                }`}>
                                {tab === 'register' ? 'ONBOARD ORG' : tab}
                            </button>
                        ))}
                    </div>
                )}

                <div className="p-12">
                    {error && (
                        <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] uppercase font-bold tracking-widest">
                            [SECURITY_ERROR] {error}
                        </div>
                    )}

                    {activeTab === 'login' && (
                        <form onSubmit={handleLogin} className="space-y-12">
                            <div>
                                <label className="block text-[11px] text-[#8B949E] tracking-[0.3em] uppercase mb-4 font-bold">Primary Identity (Email)</label>
                                <input required type="email" name="email" value={formData.email} onChange={handleInputChange}
                                    className="w-full bg-[#08080D] border border-[#1E293B] focus:border-cyan-400/50 text-slate-200 h-14 px-5 text-sm outline-none transition-all shadow-inner"
                                    placeholder="user@organization.com" />
                            </div>
                            <div>
                                <label className="block text-[11px] text-[#8B949E] tracking-[0.3em] uppercase mb-4 font-bold">Key Phrase (Password)</label>
                                <input required type="password" name="password" value={formData.password} onChange={handleInputChange}
                                    className="w-full bg-[#08080D] border border-[#1E293B] focus:border-cyan-400/50 text-slate-200 h-14 px-5 text-sm outline-none transition-all shadow-inner"
                                    placeholder="••••••••" />
                            </div>
                            <button disabled={isLoading} type="submit"
                                className="w-full bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 py-4 text-xs font-bold tracking-widest uppercase transition-all">
                                {isLoading ? 'AUTHORIZING...' : 'ESTABLISH SESSION'}
                            </button>
                        </form>
                    )}

                    {activeTab === 'register' && (
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div>
                                <label className="block text-[10px] text-slate-500 tracking-widest uppercase mb-2">Organization Prefix</label>
                                <input required type="text" name="entityPrefix" value={formData.entityPrefix} onChange={handleInputChange}
                                    className="w-full bg-[#08080D] border border-[#1E293B] focus:border-emerald-400/50 text-slate-200 p-3 text-sm outline-none"
                                    placeholder="e.g. animus-global" />
                            </div>
                            <div>
                                <label className="block text-[10px] text-slate-500 tracking-widest uppercase mb-2">Display Name</label>
                                <input required type="text" name="displayName" value={formData.displayName} onChange={handleInputChange}
                                    className="w-full bg-[#08080D] border border-[#1E293B] focus:border-emerald-400/50 text-slate-200 p-3 text-sm outline-none"
                                    placeholder="Entity Legal Name" />
                            </div>
                            <div>
                                <label className="block text-[10px] text-slate-500 tracking-widest uppercase mb-2">Admin Email</label>
                                <input required type="email" name="email" value={formData.email} onChange={handleInputChange}
                                    className="w-full bg-[#08080D] border border-[#1E293B] focus:border-emerald-400/50 text-slate-200 p-3 text-sm outline-none"
                                    placeholder="admin@entity.com" />
                            </div>
                            <div>
                                <label className="block text-[10px] text-slate-500 tracking-widest uppercase mb-2">Master Password</label>
                                <input required type="password" name="password" value={formData.password} onChange={handleInputChange}
                                    className="w-full bg-[#08080D] border border-[#1E293B] focus:border-emerald-400/50 text-slate-200 p-3 text-sm outline-none"
                                    placeholder="••••••••" />
                            </div>
                            <button disabled={isLoading} type="submit"
                                className="w-full mt-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 py-4 text-xs font-bold tracking-widest uppercase transition-all">
                                {isLoading ? 'PROVISIONING...' : 'INITIALIZE FLEET'}
                            </button>
                        </form>
                    )}

                    {activeTab === 'auditor' && (
                        <form onSubmit={handleRequestAccess} className="space-y-4">
                            <div>
                                <label className="block text-[10px] text-slate-500 tracking-widest uppercase mb-2">Regulator Agency</label>
                                <input required type="text" name="displayName" value={formData.displayName} onChange={handleInputChange}
                                    className="w-full bg-[#08080D] border border-[#1E293B] focus:border-cyan-400 text-slate-200 p-3 text-sm outline-none" />
                            </div>
                            <div>
                                <label className="block text-[10px] text-slate-500 tracking-widest uppercase mb-2">Agent Email</label>
                                <input required type="email" name="email" value={formData.email} onChange={handleInputChange}
                                    className="w-full bg-[#08080D] border border-[#1E293B] focus:border-cyan-400 text-slate-200 p-3 text-sm outline-none" />
                            </div>
                            <button disabled={isLoading} type="submit"
                                className="w-full mt-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 py-4 text-xs font-bold tracking-widest uppercase items-center">
                                Request Auditor Credentials
                            </button>
                        </form>
                    )}

                    {activeTab === 'accept_invite' && (
                        <form onSubmit={handleAcceptInvite} className="space-y-4">
                            <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 mb-4">
                                <p className="text-[10px] text-emerald-400 tracking-widest uppercase font-bold">Invitational Context</p>
                                <p className="text-white text-lg">{inviteContext?.org_name}</p>
                                <p className="text-slate-500 text-[10px] tracking-widest uppercase">Target Role: {inviteContext?.role}</p>
                            </div>
                            <div>
                                <label className="block text-[10px] text-slate-500 tracking-widest uppercase mb-2">Your Name</label>
                                <input required type="text" name="displayName" value={formData.displayName} onChange={handleInputChange}
                                    className="w-full bg-[#08080D] border border-[#1E293B] focus:border-emerald-400 text-slate-200 p-3 text-sm outline-none" />
                            </div>
                            <div>
                                <label className="block text-[10px] text-slate-500 tracking-widest uppercase mb-2">Create Password</label>
                                <input required type="password" name="password" value={formData.password} onChange={handleInputChange}
                                    className="w-full bg-[#08080D] border border-[#1E293B] focus:border-emerald-400 text-slate-200 p-3 text-sm outline-none" />
                            </div>
                            <button disabled={isLoading} type="submit"
                                className="w-full mt-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 py-4 text-xs font-bold tracking-widest uppercase transition-all">
                                [ JOIN ORGANIZATION ]
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}