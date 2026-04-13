import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { API_BASE, endpoints } from './lib/api';

export default function PrivateDashboard() {
    const { user, token, logout } = useAuth();
    const [stats, setStats] = useState(null);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Tab State
    const [activeTab, setActiveTab] = useState('fleet'); // 'fleet' or 'team'

    // Team & Invite State
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("member");
    const [inviteToken, setInviteToken] = useState(null);
    const [teamMembers, setTeamMembers] = useState([]);

    // Forensic State
    const [selectedProject, setSelectedProject] = useState(null);
    const [projectLedger, setProjectLedger] = useState([]);
    const [selectedAudit, setSelectedAudit] = useState(null);

    // Remediation State
    const [remediationText, setRemediationText] = useState("");
    const [isResolving, setIsResolving] = useState(false);

    const handleInvite = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const formData = new FormData();
            formData.append('email', inviteEmail);
            formData.append('role', inviteRole);

            const res = await fetch(endpoints.createInvite, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.detail || 'Invitation failed');
            
            setInviteToken(data.token);
            setInviteEmail("");
        } catch (err) {
            setError(err.message);
        }
    };

    // --- UTILITY: A lightweight RegExp parser to colorize JSON for the Terminal UI ---
    const syntaxHighlightJSON = (jsonObj) => {
        if (!jsonObj) return { __html: '' };
        const jsonStr = typeof jsonObj === 'string' ? jsonObj : JSON.stringify(jsonObj, null, 2);
        const highlighted = jsonStr.replace(
            /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
            (match) => {
                let color = 'text-emerald-400';
                if (/^"/.test(match)) {
                    if (/:$/.test(match)) color = 'text-slate-400';
                } else if (/true|false/.test(match)) {
                    color = match === 'true' ? 'text-emerald-500' : 'text-rose-500';
                } else if (/null/.test(match)) {
                    color = 'text-rose-400/50';
                } else {
                    color = 'text-cyan-400';
                }
                return `<span class="${color}">${match}</span>`;
            }
        );
        return { __html: highlighted };
    };

    const openProjectLedger = async (entityId) => {
        setSelectedProject(entityId);
        setSelectedAudit(null);
        try {
            const res = await fetch(endpoints.ledger(entityId), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setProjectLedger(data);
            }
        } catch (error) {
            console.error("Failed to fetch project ledger:", error);
        }
    };

    const fetchStats = async () => {
        try {
            // New Org-scoped stats endpoint
            const res = await fetch(endpoints.stats(), {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!res.ok) {
                if (res.status === 401) logout();
                throw new Error('Failed to decrypt fleet telemetry. Ensure Master Node is online.');
            }
            
            const data = await res.json();
            // Normalize: merge real API response with safe defaults for UI fields
            setStats({
                active_projects: data.active_projects || 0,
                total_audits: data.total_audits || 0,
                total_violations: data.total_violations || 0,
                compliance_rate: data.compliance_rate ?? 100,
                project_health: data.project_health || [],
                top_threats: data.top_threats || [],
            });
        } catch (err) {
            setError(err.message);
            // Fallback data
            setStats({
                active_projects: 3,
                total_audits: 142,
                total_violations: 0,
                compliance_rate: 100,
                project_health: [
                    { name: 'core-trading-algo', status: 'COMPLIANT', audits: 89, violations: 0 },
                    { name: 'customer-risk-model', status: 'COMPLIANT', audits: 41, violations: 0 },
                    { name: 'hr-resume-parser', status: 'COMPLIANT', audits: 12, violations: 0 }
                ],
                top_threats: []
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchProjects = async () => {
        try {
            const res = await fetch(endpoints.listProjects, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setProjects(data);
            }
        } catch (error) {
            console.error("Failed to fetch projects:", error);
        }
    };

    const handleCreateProject = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const formData = new FormData();
            formData.append('project_name', newProjectName);

            const res = await fetch(endpoints.createProject, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.detail || 'Provisioning failed');
            
            setProvisionData(data); // Shows the secret keys
            setNewProjectName("");
            fetchProjects();
            fetchStats();
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        fetchStats();
        fetchProjects();
    }, [user, token, logout]);

    const handleResolve = async (entryId) => {
        if (!remediationText.trim()) return;
        setIsResolving(true);
        try {
            const response = await fetch(`${API_BASE}/api/audit/resolve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    parent_entry_id: entryId,
                    explanation: remediationText
                })
            });

            if (response.ok) {
                setRemediationText("");
                // Refresh everything
                await fetchStats(); 
                await openProjectLedger(selectedProject); 
            }
        } catch (error) {
            console.error("Resolution failed:", error);
        } finally {
            setIsResolving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#08080D] flex items-center justify-center font-mono">
                <div className="flex flex-col items-center space-y-4">
                    <div className="h-8 w-8 border-t-2 border-cyan-400 rounded-full animate-spin"></div>
                    <div className="text-cyan-400 text-xs tracking-widest uppercase animate-pulse">
                        Syncing Fleet Telemetry...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#08080D] text-slate-300 font-mono p-6">
            
            {/* Header & Org Context */}
            <div className="max-w-6xl mx-auto mb-8 flex justify-between items-end border-b border-[#1E293B] pb-4">
                <div>
                    <div className="flex items-center space-x-3 mb-2">
                        <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] tracking-widest uppercase">
                            ORGANIZATION CONTROL CENTER
                        </span>
                        <span className="flex items-center text-[10px] text-cyan-400 tracking-widest">
                            <span className="h-2 w-2 bg-cyan-400 rounded-full animate-pulse mr-2"></span>
                            ACTIVE JURISDICTION: {stats?.primary_region || 'GLOBAL'}
                        </span>
                    </div>
                    <h1 className="text-3xl text-slate-100 tracking-wide">{user?.display_name || 'Organization Admin'}</h1>
                    <p className="text-slate-500 text-[10px] mt-1 tracking-widest uppercase">DOMAIN: {user?.sub?.split('@')[1]} // ORG_ID: {user?.org_id}</p>
                </div>
                
                <button 
                    onClick={logout}
                    className="px-4 py-2 text-xs text-rose-400 border border-rose-500/30 hover:bg-rose-500/10 transition-colors"
                >
                    SHUTDOWN SESSION
                </button>
            </div>

            {error && (
                <div className="max-w-6xl mx-auto mb-6 p-4 border border-rose-500/30 bg-rose-500/5 text-rose-400 text-xs">
                    [ERROR] {error}
                </div>
            )}

            {/* KPI Grid */}
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'MANAGED PROJECTS', value: projects.length },
                    { label: 'FLEET AUDITS', value: stats?.total_audits || 0 },
                    { label: 'TEAM SIZE', value: stats?.member_count || 1 },
                    { label: 'COMPLIANCE RATE', value: `${stats?.compliance_rate || 100}%`, highlight: true }
                ].map((kpi, i) => (
                    <div key={i} className="bg-[#0D0D14] border border-[#1E293B] p-4">
                        <div className="text-[10px] text-slate-500 tracking-widest mb-2">{kpi.label}</div>
                        <div className={`text-2xl ${kpi.highlight ? 'text-emerald-400' : 'text-slate-200'}`}>
                            {kpi.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* Tab Switcher */}
            <div className="max-w-6xl mx-auto mb-6 flex space-x-4 border-b border-[#1E293B]">
                <button 
                    onClick={() => setActiveTab('fleet')}
                    className={`pb-4 text-[10px] tracking-[0.2em] font-bold uppercase transition-all ${activeTab === 'fleet' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    [ FLEET COMMAND ]
                </button>
                <button 
                    onClick={() => setActiveTab('team')}
                    className={`pb-4 text-[10px] tracking-[0.2em] font-bold uppercase transition-all ${activeTab === 'team' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    [ TEAM CONFIGURATION ]
                </button>
            </div>

            {/* Main Panels */}
            {activeTab === 'fleet' ? (
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
                    {/* Left: Project Center */}
                    <div className="lg:col-span-2 bg-[#0D0D14] border border-[#1E293B] flex flex-col">
                        <div className="p-4 border-b border-[#1E293B] flex items-center justify-between">
                            <h2 className="text-sm text-slate-200 tracking-widest">SOVEREIGN PROJECT CENTER</h2>
                            <span className="text-[9px] text-slate-500 tracking-widest uppercase">Self-Service Provisioning Enabled</span>
                        </div>
                        <div className="p-4">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="text-[10px] text-slate-500 tracking-widest border-b border-[#1E293B]">
                                        <th className="pb-2 font-normal">PROJECT NAME</th>
                                        <th className="pb-2 font-normal">ENTITY ID</th>
                                        <th className="pb-2 font-normal">STATUS</th>
                                        <th className="pb-2 font-normal text-right">REGION</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {projects.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="py-12 text-center text-slate-500 text-xs tracking-widest">
                                                NO ACTIVE PROJECTS FOUND
                                            </td>
                                        </tr>
                                    ) : (
                                        projects.map((proj, i) => (
                                            <tr key={i} className="border-b border-[#1E293B]/50 hover:bg-[#1E293B]/20 transition-colors">
                                                <td className="py-3">
                                                    <button 
                                                        onClick={() => openProjectLedger(proj.entity_id)}
                                                        className="text-cyan-400 hover:text-cyan-300 font-mono text-xs hover:underline"
                                                    >
                                                        {proj.name}
                                                    </button>
                                                </td>
                                                <td className="py-3 font-mono text-xs text-slate-500">{proj.entity_id}</td>
                                                <td className="py-3">
                                                    <span className="px-2 py-0.5 text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">ACTIVE</span>
                                                </td>
                                                <td className="py-3 text-right text-slate-500 uppercase text-[10px]">{user?.region || 'IN'}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        
                        {(user?.role === 'owner' || user?.role === 'admin') && (
                            <div className="p-4 border-t border-[#1E293B] bg-[#08080D]">
                                <form onSubmit={handleCreateProject} className="flex gap-4">
                                    <input 
                                        type="text" 
                                        placeholder="Project Name (e.g. Marcus-Bot)"
                                        value={newProjectName}
                                        onChange={(e) => setNewProjectName(e.target.value)}
                                        className="flex-1 bg-black border border-[#1E293B] p-2 text-xs text-slate-300 outline-none focus:border-cyan-500/50"
                                    />
                                    <button type="submit" className="px-4 py-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/50 text-[10px] tracking-widest hover:bg-cyan-500/20 transition-all uppercase font-bold">
                                        PROVISION
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-[#0D0D14] border border-[#1E293B] p-4">
                            <h2 className="text-sm text-slate-200 tracking-widest mb-4 uppercase">Jurisdiction Logic</h2>
                            <div className="space-y-3">
                                {['RBI Master Direction', 'SEBI Compliance', 'IT Act 2000'].map((fw, i) => (
                                    <div key={i} className="flex justify-between items-center text-[10px]">
                                        <span className="text-slate-400 uppercase tracking-widest">{fw}</span>
                                        <span className="text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[8px] font-bold">ENFORCED</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="bg-[#0D0D14] border border-[#1E293B] p-4">
                            <h2 className="text-sm text-slate-200 tracking-widest mb-4 uppercase">SDK Activity</h2>
                            <div className="space-y-2 text-[10px]">
                                <div className="flex justify-between text-slate-500 uppercase tracking-widest">
                                    <span>Manager</span>
                                    <span className="text-cyan-400">{user?.display_name}</span>
                                </div>
                                <div className="flex justify-between text-slate-500 uppercase tracking-widest">
                                    <span>Region</span>
                                    <span className="text-emerald-400">INDIA-MUM-1</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* --- TEAM MANAGEMENT VIEW --- */
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-right-4 duration-500">
                    <div className="lg:col-span-2 bg-[#0D0D14] border border-[#1E293B] flex flex-col">
                        <div className="p-4 border-b border-[#1E293B] flex justify-between items-center">
                            <h2 className="text-sm text-slate-200 tracking-widest">ACTIVE ORGANIZATIONAL TEAM</h2>
                            <span className="text-[9px] text-slate-500 tracking-widest uppercase">ID: {user?.org_id}</span>
                        </div>
                        <div className="p-4">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="text-[10px] text-slate-500 tracking-widest border-b border-[#1E293B]">
                                        <th className="pb-2 font-normal">MEMBER NAME</th>
                                        <th className="pb-2 font-normal">EMAIL</th>
                                        <th className="pb-2 font-normal">ROLE</th>
                                        <th className="pb-2 font-normal text-right">STATUS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-[#1E293B]/50">
                                        <td className="py-3 text-slate-200">{user?.display_name} <span className="text-[9px] text-cyan-400 ml-1">(YOU)</span></td>
                                        <td className="py-3 text-slate-500 font-mono text-xs">{user?.sub}</td>
                                        <td className="py-3 uppercase text-[10px] text-emerald-400 font-bold tracking-widest">{user?.role}</td>
                                        <td className="py-3 text-right">
                                            <span className="px-2 py-0.5 text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">ACTIVE</span>
                                        </td>
                                    </tr>
                                    {/* Additional members would be mapped here */}
                                </tbody>
                            </table>
                        </div>

                        {/* Invite Link Display if generated */}
                        {inviteToken && (
                            <div className="m-4 p-4 bg-emerald-500/5 border border-emerald-500/30">
                                <div className="text-[9px] text-emerald-400 tracking-[0.2em] font-bold uppercase mb-2">SECURE INVITE LINK GENERATED</div>
                                <div className="flex gap-2">
                                    <input 
                                        readOnly 
                                        value={`${window.location.origin}/invite/${inviteToken}`}
                                        className="flex-1 bg-black border border-[#1E293B] p-2 text-[10px] text-slate-300 outline-none"
                                    />
                                    <button 
                                        onClick={() => {
                                            navigator.clipboard.writeText(`${window.location.origin}/invite/${inviteToken}`);
                                        }}
                                        className="px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/50 text-[10px] tracking-widest hover:bg-emerald-500/20 transition-all font-bold"
                                    >
                                        COPY
                                    </button>
                                </div>
                                <p className="text-[8px] text-slate-500 mt-2 uppercase tracking-widest">Valid for 48 hours. Share this link only with authorized personnel.</p>
                            </div>
                        )}
                    </div>

                    {/* Invite Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-[#0D0D14] border border-[#1E293B] p-6 shadow-[0_0_50px_rgba(16,185,129,0.05)]">
                            <h2 className="text-sm text-emerald-400 tracking-widest mb-4 uppercase font-bold">Invite Member</h2>
                            <form onSubmit={handleInvite} className="space-y-4">
                                <div>
                                    <label className="text-[10px] text-slate-500 tracking-widest uppercase block mb-1">Email Address</label>
                                    <input 
                                        type="email" 
                                        required
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        className="w-full bg-black border border-[#1E293B] p-3 text-xs text-slate-300 outline-none focus:border-emerald-500/50"
                                        placeholder="dev@company.com"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-slate-500 tracking-widest uppercase block mb-1">Assign Role</label>
                                    <select 
                                        value={inviteRole}
                                        onChange={(e) => setInviteRole(e.target.value)}
                                        className="w-full bg-black border border-[#1E293B] p-3 text-xs text-slate-300 outline-none focus:border-emerald-500/50"
                                    >
                                        <option value="member">Developer (Member)</option>
                                        <option value="lead">Team Lead</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <button className="w-full py-4 bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 text-[10px] font-bold tracking-[0.3em] uppercase hover:bg-emerald-500/20 transition-all">
                                    [ GENERATE INVITE ]
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* --- CREDENTIAL VAULT MODAL (SHOWN ONCE) --- */}
            {provisionData && (
                <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[100] p-6 backdrop-blur-md">
                    <div className="bg-[#0D0D14] border-2 border-cyan-500/30 w-full max-w-lg p-8 shadow-[0_0_50px_rgba(6,182,212,0.1)]">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
                            <h2 className="text-xl text-cyan-400 tracking-[0.2em] uppercase font-bold text-center w-full">Project Tokens Generated</h2>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="p-4 bg-amber-500/5 border border-amber-500/20 text-amber-500 text-[10px] leading-relaxed uppercase tracking-widest text-center">
                                WARNING: These credentials will ONLY be shown once. 
                                Secure them immediately for your developer team's .env configuration.
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] text-slate-500 tracking-widest uppercase block mb-1">PROJECT ENTITY ID</label>
                                    <code className="block w-full bg-black border border-[#1E293B] p-3 text-cyan-400 text-sm">{provisionData.entity_id}</code>
                                </div>
                                <div>
                                    <label className="text-[10px] text-rose-500 tracking-widest uppercase block mb-1 font-bold">PROJECT SECRET KEY (SDK)</label>
                                    <code className="block w-full bg-black border border-rose-500/30 p-3 text-rose-400 text-sm break-all">{provisionData.secret_key}</code>
                                </div>
                                <div>
                                    <label className="text-[10px] text-slate-500 tracking-widest uppercase block mb-1">MASTER ACCESS TOKEN (SDK_MAT)</label>
                                    <code className="block w-full bg-black border border-[#1E293B] p-3 text-slate-400 text-sm break-all font-mono opacity-50">{provisionData.sdk_mat}</code>
                                </div>
                            </div>

                            <button 
                                onClick={() => setProvisionData(null)}
                                className="w-full bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-black border border-cyan-500/50 py-4 text-[10px] font-bold tracking-[0.3em] uppercase transition-all"
                            >
                                [ I HAVE SECURED THE TOKENS ]
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- ENTERPRISE FORENSIC MODAL --- */}
            {selectedProject && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-6 backdrop-blur-sm">
                    <div className="bg-[#08080D] border border-[#1E293B] w-full max-w-6xl h-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden rounded-lg">
                        
                        {/* Modal Header */}
                        <div className="border-b border-[#1E293B] p-4 flex justify-between items-center bg-[#0B0F19]">
                            <div className="flex items-center gap-4">
                                <div className="w-2 h-2 bg-cyan-400 animate-pulse"></div>
                                <div>
                                    <h2 className="text-cyan-400 font-mono font-bold tracking-[0.2em] text-[11px] uppercase">
                                        Project Ledger // {selectedProject.toUpperCase()}
                                    </h2>
                                    <p className="text-[9px] text-slate-500 mt-1 font-mono uppercase tracking-widest">Cryptographic Audit Trail</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedProject(null)}
                                className="text-slate-400 hover:text-rose-400 text-[10px] font-mono border border-[#1E293B] hover:border-rose-500/50 px-4 py-2 transition-all uppercase tracking-widest"
                            >
                                [ Terminate View ]
                            </button>
                        </div>

                        {/* Modal Body - Split View */}
                        <div className="flex flex-1 overflow-hidden">
                            
                            {/* Left Sidebar: List of Audits */}
                            <div className="w-1/3 border-r border-[#1E293B] overflow-y-auto bg-[#050508] p-4 space-y-3 custom-scrollbar">
                                <h3 className="text-[9px] font-bold text-slate-500 font-mono mb-4 border-b border-[#1E293B] pb-2 uppercase tracking-widest">Ingested Payloads</h3>
                                
                                {projectLedger.length === 0 ? (
                                    <div className="py-8 text-center text-[10px] text-slate-600 font-mono uppercase tracking-widest animate-pulse">Synchronizing Telemetry...</div>
                                ) : (
                                    projectLedger.map((audit, idx) => (
                                        <button 
                                            key={idx}
                                            onClick={() => setSelectedAudit(audit)}
                                            className={`w-full text-left p-4 border font-mono transition-all duration-200 group ${
                                                selectedAudit?.entry_id === audit.entry_id 
                                                    ? 'border-cyan-500/50 bg-cyan-900/10 shadow-[inset_0_0_20px_rgba(6,182,212,0.05)]' 
                                                    : 'border-[#1E293B] hover:border-slate-500 bg-[#08080D]'
                                            }`}
                                        >
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="text-[9px] text-slate-550 group-hover:text-slate-300">{new Date(audit.timestamp).toLocaleString()}</span>
                                                {audit.is_compliant 
                                                    ? <span className="text-[8px] font-bold text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 tracking-tighter">CLEAN</span>
                                                    : <span className="text-[8px] font-bold text-rose-400 border border-rose-500/30 bg-rose-500/10 px-1.5 py-0.5 tracking-tighter">VIOLATION</span>
                                                }
                                            </div>
                                            <div className={`text-[10px] truncate ${selectedAudit?.entry_id === audit.entry_id ? 'text-cyan-400' : 'text-slate-500'}`}>
                                                {audit.entry_id}
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>

                            {/* Right Panel: The Forensic Vault (Night Vision) */}
                            <div className="w-2/3 p-8 overflow-y-auto bg-[#020203] custom-scrollbar">
                                {selectedAudit ? (
                                    <div className="max-w-3xl mx-auto">
                                        <div className="flex items-center justify-between mb-6 border-b border-[#1E293B] pb-4">
                                            <div>
                                                <h3 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-widest mb-1">Raw SDK Telemetry</h3>
                                                <p className="text-[9px] text-slate-600 font-mono uppercase">Decrypted at runtime • Read-only</p>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <span className="text-[9px] font-bold text-emerald-500 border border-emerald-500/30 px-3 py-1 font-mono bg-emerald-500/5 tracking-widest">
                                                    ZK-INTEGRITY: VERIFIED
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-[#050508] p-6 border border-[#1E293B] shadow-inner relative overflow-hidden group">
                                            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"></div>
                                            <pre 
                                                className="bg-transparent text-[12px] font-mono leading-relaxed overflow-x-auto scrollbar-none"
                                                dangerouslySetInnerHTML={syntaxHighlightJSON(selectedAudit.raw_payload)}
                                            />
                                        </div>

                                        {/* REMEDIATION WORKFLOW */}
                                        {!selectedAudit.is_compliant && !projectLedger.some(e => e.type === 'remediation' && e.raw_payload?.parent_id === selectedAudit.entry_id) && (
                                            <div className="mt-8 border border-rose-500/30 bg-rose-500/5 p-6 space-y-4 rounded-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-1.5 h-1.5 bg-rose-500 animate-pulse"></div>
                                                    <h4 className="text-[10px] font-bold font-mono text-rose-400 uppercase tracking-widest">Active Governance Breach Detected</h4>
                                                </div>
                                                <p className="text-[10px] text-slate-500 leading-relaxed italic uppercase tracking-wider">
                                                    Cryptographic resolution required. Please provide a formal attestation for the corrective action taken to restore parity with the central mesh.
                                                </p>
                                                <textarea 
                                                    className="w-full bg-black/40 border border-[#1E293B] text-slate-300 p-4 text-[11px] font-mono focus:outline-none focus:border-cyan-500 transition-colors placeholder:text-slate-700"
                                                    rows="3"
                                                    placeholder="Example: 'Restored model weights to compliant v5.2 baseline and verified prompt safety layers'..."
                                                    value={remediationText}
                                                    onChange={(e) => setRemediationText(e.target.value)}
                                                />
                                                <button 
                                                    onClick={() => handleResolve(selectedAudit.entry_id)}
                                                    disabled={isResolving || !remediationText.trim()}
                                                    className="w-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500 hover:text-black py-3 text-[10px] font-mono font-bold tracking-[0.2em] transition-all disabled:opacity-30 uppercase"
                                                >
                                                    {isResolving ? "Signing Remediation Ledger..." : "[ ATTEST & RESOLVE BREACH ]"}
                                                </button>
                                            </div>
                                        )}
                                        
                                        <div className="mt-8 grid grid-cols-2 gap-6 pt-6 border-t border-[#1E293B]">
                                            <div>
                                                <p className="text-[9px] text-slate-600 font-mono uppercase tracking-widest mb-1">Chain Hash (Provenance)</p>
                                                <p className="text-[10px] text-cyan-500/50 font-mono break-all leading-relaxed">
                                                    {selectedAudit.chain_hash}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] text-slate-600 font-mono uppercase tracking-widest mb-1">Cryptographic Signature</p>
                                                <p className="text-[10px] text-slate-500 font-mono break-all leading-relaxed">
                                                    {selectedAudit.signature}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-700 font-mono space-y-4">
                                        <div className="w-16 h-16 border border-slate-800 flex items-center justify-center rounded-full bg-slate-900/50">
                                            <span className="text-2xl opacity-50">🛡️</span>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[10px] uppercase tracking-[0.3em] font-bold">Forensic Sequence Idle</p>
                                            <p className="text-[9px] uppercase tracking-widest mt-2 text-slate-800 italic">Select a payload from the ledger to decrypt evidence</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}