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
        serverRegion: 'IN'
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

    // --- Tab 1: Login Flow (User-First) ---
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
                else if (role === 'owner' || role === 'enterprise') navigate('/dashboard');
                else navigate('/');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Tab 2: Organization Onboarding (Manager-Led) ---
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

    // --- Tab 3: Regulator Request ---
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

    // --- Task: Accept Invitation ---
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

    // --- The 500ms Debounce Prefix Checker ---
    React.useEffect(() => {
        if (!formData.entityPrefix || formData.entityPrefix.trim() === '') {
            setIdStatus('idle');
            setCleanEntityId('');
            return;
        }

        setIdStatus('checking');

        const timer = setTimeout(async () => {
            try {
                // To avoid multiple checks, we'll keep this logic but use the domain-check one too
                // For now, let's keep it simple
                setIdStatus('idle');
            } catch (error) {
                console.error("ID Check Failed:", error);
                setIdStatus('idle');
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [formData.entityPrefix]);

    const handleProceedToDashboard = async () => {
        if (!successData) return;
        
        const { org_id, role, status } = successData;
        
        // --- 1. SUCCESS: Warp to login so they can use their new password ---
        setSuccessData(null);
        setActiveTab('login');
    };

    // --- Render: Success State ---
    if (successData) {
        const isOrgSuccess = successData.status === 'SUCCESS';
        const isPending = successData.status === 'PENDING_APPROVAL';

        return (
            <div className="min-h-screen bg-[#08080D] flex items-center justify-center font-mono p-4">
                <div className="w-full max-w-lg bg-[#0D0D14] border border-[#1E293B] p-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                    
                    <h2 className="text-xl mb-2 tracking-widest uppercase text-emerald-400">
                        {isOrgSuccess ? 'Organization Onboarded' : 'Request Submitted'}
                    </h2>
                    <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                        {isOrgSuccess 
                            ? "Your sovereign organization has been provisioned. As the Owner, you can now login to create projects and manage your team leads."
                            : successData.message}
                    </p>

                    <button 
                        onClick={handleProceedToDashboard}
                        className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 py-4 text-xs font-bold tracking-widest uppercase transition-colors"
                    >
                        Proceed to Login
                    </button>
                </div>
            </div>
        );
    }

    // --- Render: Main Auth Portal ---
    return (
        <div className="min-h-screen bg-[#08080D] flex flex-col items-center justify-center font-mono p-4">
            
            {/* Header */}
            <div className="mb-8 text-center">
                <h1 className="text-slate-200 text-2xl tracking-widest mb-2">ANCHOR GATEWAY</h1>
                <div className="flex items-center justify-center space-x-2 text-xs">
                    <span className="h-2 w-2 bg-cyan-400 rounded-full animate-pulse"></span>
                    <span className="text-cyan-400 tracking-widest">SECURE CONNECTION ESTABLISHED</span>
                </div>
            </div>

            <div className="w-full max-w-md bg-[#0D0D14] border border-[#1E293B] shadow-2xl relative">
                {/* Tabs — Hidden if in Invite Mode */}
                {!isInvite && (
                    <div className="flex border-b border-[#1E293B]">
                        {['login', 'register', 'auditor'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => { setActiveTab(tab); setError(''); }}
                                className={`flex-1 py-3 text-xs tracking-widest uppercase transition-colors ${
                                    activeTab === tab 
                                    ? 'bg-[#1E293B]/50 text-cyan-400 border-b-2 border-cyan-400' 
                                    : 'text-slate-500 hover:text-slate-300 hover:bg-[#1E293B]/20'
                                }`}
                            >
                                {tab === 'register' ? 'ONBOARD ORG' : tab}
                            </button>
                        ))}
                    </div>
                )}

                <div className="p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                            [ERROR] {error}
                        </div>
                    )}

                    {/* Tab 1: LOGIN */}
                    {activeTab === 'login' && (
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">PROFESSIONAL EMAIL</label>
                                <input required type="email" name="email" value={formData.email} onChange={handleInputChange}
                                    className="w-full bg-[#08080D] border border-[#1E293B] focus:border-cyan-400 text-slate-200 p-2 text-sm outline-none transition-colors"
                                    placeholder="your-name@company.com" />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">PASSWORD</label>
                                <input required type="password" name="password" value={formData.password} onChange={handleInputChange}
                                    className="w-full bg-[#08080D] border border-[#1E293B] focus:border-cyan-400 text-slate-200 p-2 text-sm outline-none transition-colors"
                                    placeholder="••••••••" />
                            </div>
                            <button disabled={isLoading} type="submit"
                                className="w-full mt-4 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 py-3 text-sm tracking-widest uppercase transition-colors disabled:opacity-50">
                                {isLoading ? 'Authenticating...' : 'Initialize Session'}
                            </button>
                        </form>
                    )}

                    {/* SPECIAL TAB: ACCEPT INVITE */}
                    {activeTab === 'accept_invite' && (
                        <div className="space-y-6">
                            <div className="border border-emerald-500/20 bg-emerald-500/5 p-4">
                                <h3 className="text-emerald-400 text-xs tracking-widest uppercase font-bold mb-1">Joining Organization</h3>
                                <p className="text-white text-lg font-serif">{inviteContext?.org_name || 'Loading...'}</p>
                                <p className="text-slate-500 text-[10px] uppercase tracking-widest mt-1">Role: {inviteContext?.role}</p>
                            </div>

                            <form onSubmit={handleAcceptInvite} className="space-y-4">
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">YOUR EMAIL</label>
                                    <input readOnly type="email" value={formData.email}
                                        className="w-full bg-[#08080D] border border-[#1E293B] text-slate-500 p-2 text-sm outline-none transition-colors" />
                                    <p className="text-[9px] text-slate-600 mt-1 uppercase tracking-widest">Email is locked to the invitation link.</p>
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">DISPLAY NAME</label>
                                    <input required type="text" name="displayName" value={formData.displayName} onChange={handleInputChange}
                                        className="w-full bg-[#08080D] border border-[#1E293B] focus:border-emerald-400 text-slate-200 p-2 text-sm outline-none transition-colors"
                                        placeholder="Full Name" />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">CREATE PASSWORD</label>
                                    <input required type="password" name="password" value={formData.password} onChange={handleInputChange}
                                        className="w-full bg-[#08080D] border border-[#1E293B] focus:border-emerald-400 text-slate-200 p-2 text-sm outline-none transition-colors"
                                        placeholder="••••••••" />
                                </div>
                                <button disabled={isLoading || !inviteContext} type="submit"
                                    className="w-full mt-4 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 py-3 text-sm tracking-widest uppercase transition-colors disabled:opacity-50">
                                    {isLoading ? 'Processing...' : '[ JOIN ORGANIZATION ]'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Tab 2: REGISTER (Enterprise) */}
                    {activeTab === 'register' && (
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="relative">
                                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1 tracking-widest">Choose Your Entity ID</label>
                                <input 
                                    required 
                                    type="text" 
                                    name="chosenEntityId" 
                                    value={formData.chosenEntityId} 
                                    onChange={handleInputChange}
                                    className={`w-full bg-[#08080D] border p-3 text-sm outline-none transition-all duration-200 ${
                                        idStatus === 'idle' || idStatus === 'checking' ? 'border-[#1E293B] focus:border-cyan-500 text-slate-200' : ''
                                    } ${
                                        idStatus === 'available' ? 'border-emerald-500/50 focus:border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : ''
                                    } ${
                                        idStatus === 'taken' ? 'border-rose-500/50 focus:border-rose-500 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.1)]' : ''
                                    }`}
                                    placeholder="e.g. animuslab (letters, numbers, hyphens)" 
                                />
                                <div className="absolute right-3 top-[32px] flex items-center">
                                    {idStatus === 'checking' && <span className="text-cyan-400 text-[10px] animate-pulse font-bold tracking-widest uppercase">Checking...</span>}
                                    {idStatus === 'available' && <span className="text-emerald-400 text-[10px] font-bold tracking-widest uppercase">✓ Available ({cleanEntityId})</span>}
                                    {idStatus === 'taken' && <span className="text-rose-400 text-[10px] font-bold tracking-widest uppercase">✗ ID Taken</span>}
                                </div>
                                <p className="text-[10px] text-slate-600 mt-1.5 uppercase tracking-wider italic">3-32 characters. This is your permanent identifier.</p>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">ENTERPRISE NAME</label>
                                <input required type="text" name="displayName" value={formData.displayName} onChange={handleInputChange}
                                    className="w-full bg-[#08080D] border border-[#1E293B] focus:border-cyan-400 text-slate-200 p-2 text-sm outline-none transition-colors"
                                    placeholder="Animus Global Trading" />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">COMPLIANCE CONTACT (EMAIL)</label>
                                <input required type="email" name="email" value={formData.email} onChange={handleInputChange}
                                    className="w-full bg-[#08080D] border border-[#1E293B] focus:border-cyan-400 text-slate-200 p-2 text-sm outline-none transition-colors"
                                    placeholder="admin@enterprise.com" />
                            </div>
                            <button disabled={isLoading} type="submit"
                                className="w-full mt-4 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 py-3 text-sm tracking-widest uppercase transition-colors disabled:opacity-50">
                                {isLoading ? 'Provisioning Fleet...' : 'Provision Fleet'}
                            </button>
                        </form>
                    )}

                    {/* Tab 3: AUDITOR (Regulator) */}
                    {activeTab === 'auditor' && (
                        <form onSubmit={handleRequestAccess} className="space-y-4">
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">AGENCY / DEPARTMENT NAME</label>
                                <input required type="text" name="displayName" value={formData.displayName} onChange={handleInputChange}
                                    className="w-full bg-[#08080D] border border-[#1E293B] focus:border-cyan-400 text-slate-200 p-2 text-sm outline-none transition-colors"
                                    placeholder="Securities and Exchange Commission" />
                            </div>
                        <button 
                            onClick={() => setActiveTab('login')}
                            className={`flex-1 py-4 text-[10px] tracking-[0.2em] transition-all ${
                                activeTab === 'login' ? 'bg-[#1E293B] text-cyan-400 font-bold' : 'text-slate-500 hover:text-slate-300'
                            }`}
                        >
                            LOGIN
                        </button>
                        <button 
                            onClick={() => setActiveTab('enterprise')}
                            className={`flex-1 py-4 text-[10px] tracking-[0.2em] transition-all ${
                                activeTab === 'enterprise' ? 'bg-[#1E293B] text-emerald-400 font-bold' : 'text-slate-500 hover:text-slate-300'
                            }`}
                        >
                            ONBOARD ORG
                        </button>
                    </div>

                    <div className="p-8">
                        {error && (
                            <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
                                <span className="h-1.5 w-1.5 bg-rose-500 rounded-full"></span>
                                <span>{error}</span>
                            </div>
                        )}

                        {/* --- LOGIN FORM --- */}
                        {activeTab === 'login' && (
                            <form onSubmit={handleLogin} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-500 tracking-widest uppercase">Email Identity</label>
                                    <input 
                                        type="email" name="email" required
                                        value={formData.email} onChange={handleInputChange}
                                        placeholder="user@company.com"
                                        className="w-full bg-[#08080D] border border-[#1E293B] p-4 text-sm text-slate-200 outline-none focus:border-cyan-500/50 transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-500 tracking-widest uppercase">Password</label>
                                    <input 
                                        type="password" name="password" required
                                        value={formData.password} onChange={handleInputChange}
                                        placeholder="••••••••"
                                        className="w-full bg-[#08080D] border border-[#1E293B] p-4 text-sm text-slate-200 outline-none focus:border-cyan-500/50 transition-colors"
                                    />
                                </div>
                                <button 
                                    type="submit" disabled={isLoading}
                                    className="w-full bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 py-4 text-xs font-bold tracking-widest uppercase transition-all disabled:opacity-50"
                                >
                                    {isLoading ? 'ESTABLISHING SESSION...' : 'AUTHORIZE ACCESS'}
                                </button>
                            </form>
                        )}

                        {/* --- ORGANIZATION ONBOARDING --- */}
                        {activeTab === 'enterprise' && (
                            <form onSubmit={handleRegister} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-slate-500 tracking-widest uppercase">Org Prefix</label>
                                        <input 
                                            type="text" name="entityPrefix" required
                                            value={formData.entityPrefix} onChange={handleInputChange}
                                            placeholder="animuslab"
                                            className="w-full bg-[#08080D] border border-[#1E293B] p-3 text-sm text-slate-200 outline-none focus:border-emerald-500/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-slate-500 tracking-widest uppercase">Region</label>
                                        <select 
                                            name="serverRegion"
                                            value={formData.serverRegion} onChange={handleInputChange}
                                            className="w-full bg-[#08080D] border border-[#1E293B] p-3 text-sm text-slate-200 outline-none"
                                        >
                                            <option value="IN">INDIA (MUM-1)</option>
                                            <option value="EU">EUROPE (FRA-1)</option>
                                            <option value="US">USA (IAD-1)</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-500 tracking-widest uppercase">Contact Name</label>
                                    <input 
                                        type="text" name="displayName" required
                                        value={formData.displayName} onChange={handleInputChange}
                                        placeholder="Onboarding Manager"
                                        className="w-full bg-[#08080D] border border-[#1E293B] p-3 text-sm text-slate-200 outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-500 tracking-widest uppercase">Corporate Email</label>
                                    <input 
                                        type="email" name="email" required
                                        value={formData.email} onChange={handleInputChange}
                                        placeholder="manager@company.com"
                                        className="w-full bg-[#08080D] border border-[#1E293B] p-3 text-sm text-slate-200 outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-500 tracking-widest uppercase">New Password</label>
                                    <input 
                                        type="password" name="password" required
                                        value={formData.password} onChange={handleInputChange}
                                        placeholder="••••••••"
                                        className="w-full bg-[#08080D] border border-[#1E293B] p-3 text-sm text-slate-200 outline-none"
                                    />
                                </div>
                                <button 
                                    type="submit" disabled={isLoading}
                                    className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 py-4 text-xs font-bold tracking-widest uppercase transition-all"
                                >
                                    {isLoading ? 'PROVISIONING...' : 'INITIALIZE ORGANIZATION'}
                                </button>
                            </form>
                        )}
                    </div>
            </div>
        </div>
    );
}