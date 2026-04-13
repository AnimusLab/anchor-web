import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './contexts/AuthContext';
import { API_BASE, WS_BASE, endpoints } from './lib/api';

export default function AdminDashboard() {
  const { user, token, logout } = useAuth();

  // Dashboard State
  const [activeTab, setActiveTab] = useState('overview');
  const [rebindStatus, setRebindStatus] = useState('IDLE');
  const [formData, setFormData] = useState({ entityId: '', oldKey: '', newKey: '' });

  // Live Telemetry Stream (NOC)
  const [liveAlerts, setLiveAlerts] = useState([]);
  const [fleetStats, setFleetStats] = useState({
    activeFleets: 0, totalAudits: 0, violationRate: 0, status: 'DISCONNECTED'
  });
  const ws = useRef(null);

  // Identity Resolution
  const [resolveQuery, setResolveQuery] = useState('');
  const [resolveResult, setResolveResult] = useState(null);
  const [isResolving, setIsResolving] = useState(false);

  // Fleet Inspection
  const [inspectionId, setInspectionId] = useState('');
  const [inspectionLedger, setInspectionLedger] = useState(null);
  const [isInspecting, setIsInspecting] = useState(false);

  // Access Requests
  const [pendingRequests, setPendingRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);

  // Org Registry (Root Admin)
  const [orgRegistry, setOrgRegistry] = useState([]);
  const [orgsLoading, setOrgsLoading] = useState(false);

  // Global Stats
  const [globalStats, setGlobalStats] = useState(null);

  // --- Helper: Authenticated Fetch ---
  const authFetch = async (url, options = {}) => {
    const res = await fetch(url, {
      ...options,
      headers: { 'Authorization': `Bearer ${token}`, ...options.headers }
    });
    if (res.status === 401) { logout(); return null; }
    return res;
  };

  // --- 0. NOC LIVE STREAM ENGINE ---
  useEffect(() => {
    // Connect to WebSocket with JWT
    const entity_id = "master_noc_01";
    const wsUrl = endpoints.fleet(entity_id, token);
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      setFleetStats(prev => ({ ...prev, status: 'LIVE_OVERSIGHT' }));
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'VIOLATION_ALERT') {
        setLiveAlerts(prev => [data, ...prev].slice(0, 50));
        setFleetStats(prev => ({
          ...prev,
          totalAudits: prev.totalAudits + 1,
          violationRate: prev.violationRate + 1
        }));
      }
    };

    ws.current.onclose = () => {
      setFleetStats(prev => ({ ...prev, status: 'OVERSIGHT_DISCONNECTED' }));
    };

    return () => { if (ws.current) ws.current.close(); };
  }, [token]);

  // --- 1. Fetch Global Stats on Mount ---
  useEffect(() => {
    const fetchGlobalStats = async () => {
      const res = await authFetch(endpoints.stats());
      if (res) {
        const data = await res.json();
        setGlobalStats(data);
        setFleetStats(prev => ({
          ...prev,
          totalAudits: data.total_audits,
          violationRate: data.total_violations,
          activeFleets: data.active_projects,
        }));
      }
    };
    fetchGlobalStats();
  }, [token]);

  // --- 2. Real Identity Resolution ---
  const handleResolve = async (e) => {
    e.preventDefault();
    if (!resolveQuery) return;
    setIsResolving(true);
    setResolveResult(null);

    try {
      const res = await authFetch(endpoints.resolve, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: resolveQuery, root_key: '' })
      });
      if (res && res.ok) {
        const data = await res.json();
        setResolveResult({
          entityId: data.entity_id,
          keyHash: data.key_hash || 'REDACTED',
          status: 'ACTIVE',
          provisioned: data.created_at
        });
      } else if (res) {
        const err = await res.json();
        setResolveResult({ entityId: resolveQuery, keyHash: 'NOT FOUND', status: err.detail, provisioned: null });
      }
    } catch (err) {
      setResolveResult({ entityId: resolveQuery, keyHash: 'ERROR', status: err.message, provisioned: null });
    } finally {
      setIsResolving(false);
    }
  };

  // --- 3. Real Fleet Inspection ---
  const handleInspect = async (e) => {
    e.preventDefault();
    if (!inspectionId) return;
    setIsInspecting(true);

    try {
      const res = await authFetch(endpoints.ledger(inspectionId));
      if (res && res.ok) {
        const data = await res.json();
        setInspectionLedger(data);
      } else {
        setInspectionLedger([]);
      }
    } catch (err) {
      console.error("INSPECTION FAILURE:", err);
      setInspectionLedger([]);
    } finally {
      setIsInspecting(false);
    }
  };

  // --- 4. Real Key Re-bind ---
  const handleRebind = async (e) => {
    e.preventDefault();
    if (!formData.entityId) return;
    setRebindStatus('PROCESSING');

    try {
      const res = await authFetch(`${API_BASE}/api/admin/rotate-secret/${formData.entityId}`, {
        method: 'POST'
      });
      if (res && res.ok) {
        setRebindStatus('SUCCESS');
        setFormData({ entityId: '', oldKey: '', newKey: '' });
        setTimeout(() => setRebindStatus('IDLE'), 3000);
      } else {
        setRebindStatus('IDLE');
        alert('Re-bind failed. Check entity ID.');
      }
    } catch (err) {
      setRebindStatus('IDLE');
    }
  };

  // --- 5. Fetch Pending Access Requests ---
  const fetchPendingRequests = async () => {
    setRequestsLoading(true);
    try {
      const res = await authFetch(endpoints.pending);
      if (res && res.ok) {
        const data = await res.json();
        setPendingRequests(data);
      }
    } catch (err) {
      console.error("PENDING FETCH FAILURE:", err);
    } finally {
      setRequestsLoading(false);
    }
  };

  const fetchOrgRegistry = async () => {
    setOrgsLoading(true);
    try {
      const res = await authFetch(endpoints.adminOrgs);
      if (res && res.ok) {
        const data = await res.json();
        setOrgRegistry(data);
      }
    } catch (err) {
      console.error("ORG REGISTRY FETCH FAILURE:", err);
    } finally {
      setOrgsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
    fetchOrgRegistry();
  }, [token]);

  const handleApprove = async (entityId) => {
    const payload = new FormData();
    payload.append('target_entity_id', entityId);
    const res = await authFetch(endpoints.approve, { method: 'POST', body: payload });
    if (res && res.ok) {
      fetchPendingRequests(); // Refresh list
    }
  };

  const handleRevoke = async (entityId) => {
    const payload = new FormData();
    payload.append('target_entity_id', entityId);
    const res = await authFetch(endpoints.revoke, { method: 'POST', body: payload });
    if (res && res.ok) {
      fetchPendingRequests();
    }
  };

  // --- 6. Real Fleet Provisioning (Legacy / Admin Override) ---
  const handleProvision = async (e) => {
    e.preventDefault();
    const name = globalStats?._adminProvisionName ?? '';
    const tier = globalStats?._adminProvisionTier ?? 'ENTERPRISE';
    if (!name) return;
    try {
      const res = await authFetch(endpoints.provision, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, tier })
      });
      if (res && res.ok) {
        const data = await res.json();
        setGlobalStats(s => ({ ...s, _adminProvisionResult: data }));
      }
    } catch (err) {
      console.error("PROVISION FAILURE:", err);
    }
  };

  // --- MASTER DASHBOARD ---
  return (
    <div className="min-h-screen bg-[#08080D] font-mono text-slate-300 flex flex-col selection:bg-rose-500/30 h-screen overflow-hidden">
      
      {/* ROOT HEADER */}
      <header className="h-14 border-b border-rose-900/50 bg-[#0D0D14] flex items-center justify-between px-6 sticky top-0 z-50 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-6 h-6 bg-rose-500/10 border border-rose-500/50 rounded flex items-center justify-center">
            <div className="w-2 h-2 bg-rose-500 rounded-sm animate-pulse"></div>
          </div>
          <span className="text-sm font-bold tracking-widest text-white uppercase">Anchor Master Node</span>
          <span className="text-[10px] text-rose-400 bg-rose-500/10 px-2 py-1 rounded border border-rose-500/20 tracking-widest uppercase">PRIVILEGE: ROOT</span>
          <div className="ml-4 flex items-center gap-2 bg-blue-500/5 border border-blue-500/20 px-3 py-1 rounded-full">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(59,130,246,0.8)]"></div>
            <span className="text-[9px] text-blue-400 font-bold uppercase tracking-widest">ZK-State: LOCKED (v5.0)</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {pendingRequests.length > 0 && (
            <button onClick={() => setActiveTab('requests')} className="text-[10px] text-amber-400 bg-amber-500/10 px-3 py-1 border border-amber-500/30 tracking-widest uppercase animate-pulse">
              {pendingRequests.length} Pending Request{pendingRequests.length > 1 ? 's' : ''}
            </button>
          )}
          <span className="text-[10px] text-slate-600 font-mono">{user?.email}</span>
          <button onClick={logout} className="text-xs text-slate-500 hover:text-white transition-colors tracking-widest uppercase border border-[#1E293B] px-3 py-1">
            Terminate Session
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        
        {/* ADMIN SIDEBAR */}
        <aside className="w-64 border-r border-[#1E293B] bg-[#0D0D14] p-4 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
          
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 mt-2 px-3">
            Oversight & Analytics
          </div>
          <button onClick={() => setActiveTab('overview')} className={`flex w-full items-center gap-3 px-3 py-3 rounded text-xs tracking-widest uppercase transition-all ${activeTab === 'overview' ? 'bg-[#121219] text-white border-l-2 border-l-slate-400' : 'text-slate-500 hover:text-slate-300 hover:bg-[#121219]/50 border-l-2 border-l-transparent'}`}>
            Global Telemetry
          </button>
          <button onClick={() => setActiveTab('inspection')} className={`flex w-full items-center gap-3 px-3 py-3 rounded text-xs tracking-widest uppercase transition-all ${activeTab === 'inspection' ? 'bg-[#121219] text-white border-l-2 border-l-blue-400' : 'text-slate-500 hover:text-blue-400/50 hover:bg-[#121219]/50 border-l-2 border-l-transparent'}`}>
            Fleet Inspection
          </button>
          
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 mt-4 px-3">
            Access Control
          </div>
          <button onClick={() => { setActiveTab('requests'); fetchPendingRequests(); }} className={`flex w-full items-center justify-between px-3 py-3 rounded text-xs tracking-widest uppercase transition-all ${activeTab === 'requests' ? 'bg-amber-500/10 text-amber-400 border-l-2 border-l-amber-500' : 'text-slate-500 hover:text-amber-400/50 hover:bg-[#121219]/50 border-l-2 border-l-transparent'}`}>
            <span>Access Requests</span>
            {pendingRequests.length > 0 && (
              <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">{pendingRequests.length}</span>
            )}
          </button>

          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 mt-4 px-3">
            SaaS Control Plane
          </div>
          <button onClick={() => { setActiveTab('orgs'); fetchOrgRegistry(); }} className={`flex w-full items-center justify-between px-3 py-3 rounded text-xs tracking-widest uppercase transition-all ${activeTab === 'orgs' ? 'bg-emerald-500/10 text-emerald-400 border-l-2 border-l-emerald-500' : 'text-slate-500 hover:text-emerald-400/50 hover:bg-[#121219]/50 border-l-2 border-l-transparent'}`}>
            <span>Org Registry</span>
            {orgRegistry.length > 0 && (
              <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">{orgRegistry.length}</span>
            )}
          </button>
          <button onClick={() => setActiveTab('provisioning')} className={`flex w-full items-center gap-3 px-3 py-3 rounded text-xs tracking-widest uppercase transition-all ${activeTab === 'provisioning' ? 'bg-cyan-500/10 text-cyan-400 border-l-2 border-l-cyan-500' : 'text-slate-500 hover:text-cyan-400/50 hover:bg-[#121219]/50 border-l-2 border-l-transparent'}`}>
            Legacy Provisioning
          </button>

          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 mt-4 px-3">
            Cryptographic Engine
          </div>
          <button onClick={() => setActiveTab('resolution')} className={`flex w-full items-center gap-3 px-3 py-3 rounded text-xs tracking-widest uppercase transition-all ${activeTab === 'resolution' ? 'bg-purple-500/10 text-purple-400 border-l-2 border-l-purple-500' : 'text-slate-500 hover:text-purple-400/50 hover:bg-[#121219]/50 border-l-2 border-l-transparent'}`}>
            Identity Resolution
          </button>
          <button onClick={() => setActiveTab('recovery')} className={`flex w-full items-center gap-3 px-3 py-3 rounded text-xs tracking-widest uppercase transition-all ${activeTab === 'recovery' ? 'bg-amber-500/10 text-amber-400 border-l-2 border-l-amber-500' : 'text-slate-500 hover:text-amber-400/50 hover:bg-[#121219]/50 border-l-2 border-l-transparent'}`}>
            Identity Recovery
          </button>
          <button onClick={() => setActiveTab('overrides')} className={`flex w-full items-center gap-3 px-3 py-3 rounded text-xs tracking-widest uppercase transition-all ${activeTab === 'overrides' ? 'bg-rose-500/10 text-rose-400 border-l-2 border-l-rose-500' : 'text-slate-500 hover:text-rose-400/50 hover:bg-[#121219]/50 border-l-2 border-l-transparent'}`}>
            Network Overrides
          </button>
        </aside>

        {/* MAIN WORKSPACE */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-8 pb-20">
            
            {/* --- TAB: GLOBAL TELEMETRY (NOC) --- */}
            {activeTab === 'overview' && (
              <div className="animate-in fade-in duration-300">
                <div className="mb-8 border-b border-[#1E293B] pb-6 flex justify-between items-end">
                  <div>
                    <h2 className="text-2xl font-serif text-white mb-2">Fleet Oversight NOC</h2>
                    <p className="text-xs text-slate-400 tracking-widest uppercase">Real-time cryptographic audit stream.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${fleetStats.status === 'LIVE_OVERSIGHT' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{fleetStats.status}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-6 mb-12">
                  <div className="bg-[#0D0D14]/50 p-6 border border-[#1E293B] backdrop-blur-md">
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Fleet Status</div>
                    <div className={ `text-xl font-bold ${fleetStats.status === 'LIVE_OVERSIGHT' ? 'text-emerald-400' : 'text-rose-500'}` }>
                      {fleetStats.status === 'LIVE_OVERSIGHT' ? 'ACTIVE' : 'OFFLINE'}
                    </div>
                  </div>
                  <div className="bg-[#0D0D14]/50 p-6 border border-[#1E293B] backdrop-blur-md">
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Total Audits</div>
                    <div className="text-3xl font-bold text-white">{fleetStats.totalAudits}</div>
                  </div>
                  <div className="bg-[#0D0D14]/50 p-6 border border-[#1E293B] backdrop-blur-md">
                    <div className="text-[10px] text-rose-500 uppercase tracking-widest mb-2">Detected Violations</div>
                    <div className="text-3xl font-bold text-rose-400">{fleetStats.violationRate}</div>
                  </div>
                  <div className="bg-[#0D0D14]/50 p-6 border border-[#1E293B] backdrop-blur-md">
                    <div className="text-[10px] text-blue-500 uppercase tracking-widest mb-2">Active Entities</div>
                    <div className="text-xl font-bold text-blue-400">{fleetStats.activeFleets}</div>
                  </div>
                </div>

                {/* LIVE ALERT FEED */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-white uppercase tracking-widest">Live Compliance Ticker</h3>
                    <span className="text-[10px] text-slate-600 uppercase tracking-widest">Showing latest {liveAlerts.length} events</span>
                  </div>

                  {liveAlerts.length === 0 ? (
                    <div className="py-20 text-center border border-dashed border-[#1E293B] bg-[#0D0D14]/30 rounded-lg">
                      <p className="text-[10px] text-slate-600 uppercase tracking-widest animate-pulse">Awaiting incoming telemetry from AI fleets...</p>
                      <p className="text-[10px] text-slate-700 mt-2">Violations will appear here in real-time as SDKs stream data.</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                      {liveAlerts.map((alert, idx) => (
                        <div key={alert.entry_id || idx} className="bg-[#0D0D14] border border-rose-500/20 p-4 rounded group hover:border-rose-500/50 transition-all">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-1.5 h-1.5 bg-rose-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.8)]"></div>
                              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Violation Detected</span>
                            </div>
                            <span className="text-[9px] text-slate-600 font-mono">{alert.entry_id}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-6 mb-4">
                            <div>
                              <div className="text-[9px] text-slate-600 uppercase tracking-widest mb-1">Fleet Component</div>
                              <div className="text-xs text-white font-bold">{alert.project}</div>
                            </div>
                            <div>
                              <div className="text-[9px] text-slate-600 uppercase tracking-widest mb-1">Regulatory Hash</div>
                              <div className="text-[10px] text-slate-400 font-mono">{alert.chain_hash?.slice(0, 24)}...</div>
                            </div>
                            <div>
                              <div className="text-[9px] text-slate-600 uppercase tracking-widest mb-1">Timestamp</div>
                              <div className="text-[10px] text-slate-400 font-mono">{new Date(alert.timestamp).toLocaleTimeString()}</div>
                            </div>
                          </div>
                          {alert.violations && (
                            <div className="bg-[#08080D] p-3 rounded border border-[#1E293B]">
                              {alert.violations.map((v, i) => (
                                <div key={i} className="flex items-center gap-2 mb-1 last:mb-0">
                                  <span className="text-[10px] bg-rose-500/10 text-rose-500 px-1.5 py-0.5 rounded border border-rose-500/20 font-bold">{v.rule_id}</span>
                                  <span className="text-[11px] text-rose-300 font-bold">{v.message || v.reason}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* --- TAB: ACCESS REQUESTS (NEW) --- */}
            {activeTab === 'requests' && (
              <div className="animate-in fade-in duration-300">
                <div className="mb-8 border-b border-[#1E293B] pb-6 flex justify-between items-end">
                  <div>
                    <h2 className="text-2xl font-serif text-white mb-2">Access Requests</h2>
                    <p className="text-xs text-amber-400 tracking-widest uppercase">Approve or revoke auditor and enterprise access to the governance mesh.</p>
                  </div>
                  <button onClick={fetchPendingRequests} className="text-[10px] text-slate-400 border border-[#1E293B] px-3 py-1 uppercase tracking-widest hover:text-white transition-colors">
                    Refresh
                  </button>
                </div>

                {requestsLoading ? (
                  <div className="py-20 flex flex-col items-center justify-center border border-dashed border-[#1E293B] bg-[#0D0D14]">
                    <div className="w-8 h-8 border border-amber-500/30 border-t-amber-500 rounded-full animate-spin mb-4"></div>
                    <span className="text-[10px] text-amber-400 uppercase tracking-widest animate-pulse">Loading access queue...</span>
                  </div>
                ) : pendingRequests.length === 0 ? (
                  <div className="py-20 text-center border border-dashed border-[#1E293B] bg-[#0D0D14]/50">
                    <p className="text-[10px] text-slate-600 uppercase tracking-widest">No pending access requests.</p>
                    <p className="text-[10px] text-slate-700 mt-1">All auditor requests have been processed.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingRequests.map((req) => (
                      <div key={req.entity_id} className="bg-[#0D0D14] border border-amber-500/20 p-6 flex justify-between items-center hover:border-amber-500/40 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm font-bold text-white">{req.display_name}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 border uppercase tracking-wider ${
                              req.role === 'regulator' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                            }`}>
                              {req.role}
                            </span>
                            {req.email_verified && (
                              <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 uppercase tracking-wider">
                                Email Verified
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-6 text-[10px] text-slate-500">
                            <span>Entity: <span className="text-slate-400 font-mono">{req.entity_id}</span></span>
                            <span>Email: <span className="text-slate-400">{req.email}</span></span>
                            <span>Requested: {new Date(req.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button 
                            onClick={() => handleApprove(req.entity_id)}
                            className="px-6 py-2 bg-emerald-500/10 border border-emerald-500 text-emerald-400 text-[10px] uppercase tracking-widest font-bold hover:bg-emerald-500 hover:text-white transition-colors"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleRevoke(req.entity_id)}
                            className="px-6 py-2 border border-rose-500/50 text-rose-500 text-[10px] uppercase tracking-widest font-bold hover:bg-rose-500/10 transition-colors"
                          >
                            Deny
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* --- TAB: FLEET INSPECTION --- */}
            {activeTab === 'inspection' && (
              <div className="animate-in fade-in duration-300">
                <div className="mb-8 border-b border-[#1E293B] pb-6 flex justify-between items-end">
                  <div>
                    <h2 className="text-2xl font-serif text-white mb-2">Global Fleet Inspection</h2>
                    <p className="text-xs text-blue-400 tracking-widest uppercase">Master read-access to any registered entity's private cryptographic ledger.</p>
                  </div>
                </div>

                <form onSubmit={handleInspect} className="flex gap-4 mb-8">
                  <input 
                    type="text" 
                    value={inspectionId}
                    onChange={(e) => setInspectionId(e.target.value)}
                    placeholder="Enter Entity ID (e.g., animuslab) to intercept ledger stream..."
                    className="flex-1 bg-[#0D0D14] border border-[#1E293B] px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <button type="submit" className="bg-blue-500/10 border border-blue-500 text-blue-400 px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-colors">
                    Intercept
                  </button>
                </form>

                {isInspecting ? (
                  <div className="py-20 flex flex-col items-center justify-center border border-dashed border-[#1E293B] bg-[#0D0D14]">
                    <div className="w-8 h-8 border border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                    <span className="text-[10px] text-blue-400 uppercase tracking-widest animate-pulse">Querying entity ledger...</span>
                  </div>
                ) : inspectionLedger ? (
                  <div className="bg-[#0D0D14] border border-[#1E293B] p-6">
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#1E293B]">
                      <span className="text-sm font-bold text-white uppercase tracking-widest">Intercepted Ledger: {inspectionId}</span>
                      <span className="text-[10px] text-slate-500 tracking-widest uppercase">{inspectionLedger.length} entries</span>
                    </div>
                    
                    {inspectionLedger.length === 0 ? (
                      <div className="py-12 text-center text-[10px] text-slate-600 uppercase tracking-widest">
                        No ledger entries found for this entity.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {inspectionLedger.map((entry, i) => (
                          <div key={entry.entry_id || i} className="flex gap-4 p-4 border border-[#1E293B] bg-[#08080D]">
                            <div className="w-24 text-right flex-shrink-0">
                              <div className="text-[10px] text-slate-300 font-bold">{entry.timestamp ? new Date(entry.timestamp).toLocaleTimeString() : '—'}</div>
                              <div className="text-[9px] text-slate-500 mt-1">{entry.timestamp ? new Date(entry.timestamp).toLocaleDateString() : ''}</div>
                            </div>
                            <div className={`w-1 rounded ${entry.governance_status?.risk_level === 'CRITICAL' ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-2">
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${entry.governance_status?.risk_level === 'CRITICAL' ? 'text-rose-400' : 'text-slate-300'}`}>
                                  {entry.governance_status?.is_compliant ? 'COMPLIANT' : 'VIOLATION'}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono">{entry.cryptography?.chain_hash?.slice(0, 16)}...</span>
                              </div>
                              <div className="text-sm text-white font-bold mb-1">{entry.execution_context?.project_name || 'N/A'}</div>
                              <div className="text-[10px] text-slate-600 font-mono">ID: {entry.entry_id}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-20 text-center border border-dashed border-[#1E293B] bg-[#0D0D14]/50 text-slate-600 text-[10px] uppercase tracking-widest">
                    Awaiting Target Entity ID
                  </div>
                )}
              </div>
            )}

            {/* --- TAB: IDENTITY RESOLUTION --- */}
            {activeTab === 'resolution' && (
              <div className="animate-in fade-in duration-300">
                <div className="mb-8 border-b border-[#1E293B] pb-6">
                  <h2 className="text-2xl font-serif text-white mb-2">Identity Resolution Engine</h2>
                  <p className="text-xs text-purple-400 tracking-widest uppercase">Reverse-lookup tool: Resolve Entity IDs to Cryptographic Hashes, or vice versa.</p>
                </div>

                <div className="bg-[#0D0D14] border border-purple-500/20 p-8 shadow-[0_0_30px_rgba(168,85,247,0.05)] relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 to-purple-400"></div>
                  
                  <form onSubmit={handleResolve} className="flex gap-4 mb-8">
                    <input 
                      type="text" 
                      value={resolveQuery}
                      onChange={(e) => setResolveQuery(e.target.value)}
                      placeholder="Enter Entity ID or 256-bit Key Hash..."
                      className="flex-1 bg-[#121219] border border-[#1E293B] px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-purple-500 transition-colors"
                    />
                    <button type="submit" className="bg-purple-500/10 border border-purple-500 text-purple-400 px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-purple-500 hover:text-white transition-colors">
                      Query Matrix
                    </button>
                  </form>

                  {isResolving ? (
                    <div className="py-12 flex flex-col items-center justify-center">
                      <div className="w-full max-w-md h-1 bg-[#08080D] overflow-hidden mb-4 border border-[#1E293B]">
                        <div className="h-full bg-purple-500 w-full animate-[barGrow_1s_ease-in-out_infinite]"></div>
                      </div>
                      <span className="text-[10px] text-purple-400 uppercase tracking-widest animate-pulse">Searching global identity shards...</span>
                    </div>
                  ) : resolveResult ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#08080D] border border-[#1E293B] p-4">
                        <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Resolved Entity ID</div>
                        <div className="text-sm font-bold text-white">{resolveResult.entityId}</div>
                      </div>
                      <div className="bg-[#08080D] border border-[#1E293B] p-4">
                        <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Provisioned Date</div>
                        <div className="text-sm text-slate-300">{resolveResult.provisioned ? new Date(resolveResult.provisioned).toLocaleString() : 'N/A'}</div>
                      </div>
                      <div className="col-span-2 bg-[#08080D] border border-purple-500/30 p-4 flex justify-between items-center">
                        <div>
                          <div className="text-[9px] text-purple-400 uppercase tracking-widest mb-1">Status</div>
                          <div className="text-xs font-mono text-white">{resolveResult.status}</div>
                        </div>
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 uppercase tracking-widest font-bold">
                          {resolveResult.status}
                        </span>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            )}

            {/* --- TAB: ORG REGISTRY --- */}
            {activeTab === 'orgs' && (
              <div className="animate-in fade-in duration-300">
                <div className="mb-8 border-b border-[#1E293B] pb-6 flex justify-between items-end">
                  <div>
                    <h2 className="text-2xl font-serif text-white mb-2">Sovereign Org Registry</h2>
                    <p className="text-xs text-emerald-400 tracking-widest uppercase">All organizations registered on the Anchor Governance Mesh.</p>
                  </div>
                  <button onClick={fetchOrgRegistry} className="text-[10px] text-slate-400 border border-[#1E293B] px-3 py-1 uppercase tracking-widest hover:text-white transition-colors">
                    Refresh
                  </button>
                </div>

                {orgsLoading ? (
                  <div className="py-20 flex flex-col items-center justify-center border border-dashed border-[#1E293B] bg-[#0D0D14]">
                    <div className="w-8 h-8 border border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                    <span className="text-[10px] text-emerald-400 uppercase tracking-widest animate-pulse">Scanning mesh registry...</span>
                  </div>
                ) : orgRegistry.length === 0 ? (
                  <div className="py-20 text-center border border-dashed border-[#1E293B] bg-[#0D0D14]/50">
                    <p className="text-[10px] text-slate-600 uppercase tracking-widest">No organizations registered yet.</p>
                  </div>
                ) : (
                  <div className="bg-[#0D0D14] border border-[#1E293B]">
                    <div className="grid grid-cols-6 gap-4 px-6 py-3 border-b border-[#1E293B] text-[9px] text-slate-500 uppercase tracking-widest font-bold">
                      <span className="col-span-2">ORGANIZATION</span>
                      <span>DOMAIN</span>
                      <span>REGION</span>
                      <span className="text-center">PROJECTS</span>
                      <span className="text-right">STATUS</span>
                    </div>
                    <div className="divide-y divide-[#1E293B]">
                      {orgRegistry.map((org) => (
                        <div key={org.id} className="grid grid-cols-6 gap-4 px-6 py-4 hover:bg-[#121219]/50 transition-colors items-center">
                          <div className="col-span-2">
                            <div className="text-sm text-white font-bold">{org.display_name}</div>
                            <div className="text-[9px] text-slate-500 font-mono mt-0.5">{org.entity_prefix}</div>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">{org.domain || '—'}</div>
                          <div>
                            <span className={`text-[9px] px-2 py-1 font-bold uppercase tracking-widest border ${
                              org.server_region === 'IN'
                                ? 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                                : org.server_region === 'EU'
                                ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                                : 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                            }`}>
                              {org.server_region}
                            </span>
                          </div>
                          <div className="text-center">
                            <span className="text-sm text-cyan-400 font-bold">{org.project_count}</span>
                            <span className="text-[9px] text-slate-600 ml-1">repos</span>
                          </div>
                          <div className="text-right">
                            <span className={`text-[9px] px-2 py-1 font-bold uppercase tracking-widest border ${
                              org.status === 'active'
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                            }`}>
                              {org.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="px-6 py-3 border-t border-[#1E293B] text-[9px] text-slate-600 uppercase tracking-widest">
                      {orgRegistry.length} organization{orgRegistry.length !== 1 ? 's' : ''} · {orgRegistry.reduce((a, o) => a + o.project_count, 0)} total projects · {orgRegistry.filter(o => o.status === 'active').length} active
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* --- TAB: FLEET PROVISIONING (Legacy / Admin Override) --- */}
            {activeTab === 'provisioning' && (
              <div className="animate-in fade-in duration-300">
                <div className="mb-8 border-b border-[#1E293B] pb-6">
                  <h2 className="text-2xl font-serif text-white mb-2">Legacy Fleet Provisioning</h2>
                  <p className="text-xs text-cyan-400 tracking-widest uppercase">Admin-override provisioning. Enterprise orgs now self-provision via the Auth Portal.</p>
                </div>

                {/* Notice Banner */}
                <div className="mb-8 p-4 border border-amber-500/20 bg-amber-500/5 text-amber-400 text-[10px] leading-relaxed uppercase tracking-widest">
                  ⚠ This tool is an administrative escape hatch for legacy migration or emergency provisioning.
                  All new organizations should onboard via the <span className="text-white font-bold">Auth Portal → ONBOARD ORG</span> tab and self-provision their own projects.
                </div>

                <div className="bg-[#0D0D14] border border-cyan-500/20 p-8 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-600 to-cyan-400"></div>

                  <div className="grid grid-cols-2 gap-8">
                    <form onSubmit={handleProvision} className="space-y-6">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Corporate Entity Name</label>
                        <input
                          type="text"
                          value={globalStats?._adminProvisionName ?? ''}
                          onChange={(e) => setGlobalStats(s => ({...s, _adminProvisionName: e.target.value}))}
                          placeholder="e.g. Acme Financial AI"
                          className="w-full bg-[#121219] border border-[#1E293B] px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Tier</label>
                        <select
                          value={globalStats?._adminProvisionTier ?? 'ENTERPRISE'}
                          onChange={(e) => setGlobalStats(s => ({...s, _adminProvisionTier: e.target.value}))}
                          className="w-full bg-[#121219] border border-[#1E293B] px-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-cyan-500 appearance-none"
                        >
                          <option value="ENTERPRISE">Enterprise (Unlimited SDK)</option>
                          <option value="CORE">Core (10 Repos)</option>
                        </select>
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-cyan-500/10 border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-white py-4 text-xs font-bold uppercase tracking-widest transition-colors"
                      >
                        Generate Genesis Key
                      </button>
                    </form>

                    <div className="bg-[#08080D] border border-[#1E293B] p-4 flex flex-col justify-between">
                      <div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest border-b border-[#1E293B] pb-2 mb-4">Generated .env Configuration</div>
                        {globalStats?._adminProvisionResult ? (
                          <div className="font-mono text-xs text-cyan-400 space-y-2">
                            <div>ANCHOR_ENTITY_ID="{globalStats._adminProvisionResult.entity_id}"</div>
                            <div className="break-all">ANCHOR_SECRET_KEY="{globalStats._adminProvisionResult.master_key}"</div>
                            <div>ANCHOR_NETWORK_PROXY="{API_BASE}/api"</div>
                          </div>
                        ) : (
                          <div className="font-mono text-xs text-slate-600 space-y-2">
                            <div>ANCHOR_ENTITY_ID="[ AWAITING GENERATION ]"</div>
                            <div>ANCHOR_SECRET_KEY="[ AWAITING GENERATION ]"</div>
                            <div>ANCHOR_NETWORK_PROXY="{API_BASE}/api"</div>
                          </div>
                        )}
                      </div>
                      <button
                        disabled={!globalStats?._adminProvisionResult}
                        onClick={() => {
                          const r = globalStats._adminProvisionResult;
                          const text = `ANCHOR_ENTITY_ID="${r.entity_id}"\nANCHOR_SECRET_KEY="${r.master_key}"\nANCHOR_NETWORK_PROXY="${API_BASE}/api"`;
                          navigator.clipboard.writeText(text);
                        }}
                        className="text-[10px] border border-cyan-500/30 text-cyan-400 px-4 py-2 uppercase tracking-widest hover:bg-cyan-500/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed mt-4"
                      >
                        Copy Payload to Clipboard
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* --- TAB: IDENTITY RECOVERY --- */}
            {activeTab === 'recovery' && (
              <div className="animate-in fade-in duration-300">
                <div className="mb-8 border-b border-[#1E293B] pb-6">
                  <h2 className="text-2xl font-serif text-white mb-2">Cryptographic Key Re-assignment</h2>
                  <p className="text-xs text-amber-500 tracking-widest uppercase leading-relaxed">
                    Execute identity recovery for fleets with lost access tokens. Revokes old token, re-binds historical ledger entries.
                  </p>
                </div>

                <div className="bg-[#0D0D14] border border-amber-500/20 p-8 shadow-[0_0_30px_rgba(245,158,11,0.05)] relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-yellow-300"></div>
                  
                  <form onSubmit={handleRebind} className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Target Entity ID</label>
                      <input 
                        type="text" 
                        value={formData.entityId}
                        onChange={(e) => setFormData({...formData, entityId: e.target.value})}
                        placeholder="e.g. animuslab"
                        className="w-full bg-[#121219] border border-[#1E293B] px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                        disabled={rebindStatus === 'PROCESSING'}
                      />
                    </div>

                    <div className="pt-4 border-t border-[#1E293B]">
                      {rebindStatus === 'IDLE' && (
                        <button type="submit" className="w-full bg-amber-500/10 border border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-[#08080D] py-4 text-xs font-bold uppercase tracking-widest transition-colors">
                          Execute Secret Rotation
                        </button>
                      )}
                      
                      {rebindStatus === 'PROCESSING' && (
                        <div className="w-full bg-[#121219] border border-amber-500/50 py-4 flex flex-col items-center justify-center gap-3">
                          <div className="w-full max-w-xs h-1 bg-[#08080D] overflow-hidden">
                            <div className="h-full bg-amber-500 w-full animate-[barGrow_2s_ease-in-out]"></div>
                          </div>
                          <span className="text-[10px] text-amber-500 uppercase tracking-widest animate-pulse">Re-hashing cryptographic ledger entries...</span>
                        </div>
                      )}

                      {rebindStatus === 'SUCCESS' && (
                        <div className="w-full bg-emerald-500/10 border border-emerald-500/50 py-4 text-center">
                          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Re-bind Successful. Fleet access restored.</span>
                        </div>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* --- TAB: NETWORK OVERRIDES --- */}
            {activeTab === 'overrides' && (
              <div className="animate-in fade-in duration-300">
                <div className="mb-8 border-b border-[#1E293B] pb-6">
                  <h2 className="text-2xl font-serif text-white mb-2">Critical Operations</h2>
                  <p className="text-xs text-rose-500 tracking-widest uppercase">Warning: These actions affect the entire global mesh.</p>
                </div>

                <div className="space-y-4">
                  <div className="bg-[#0D0D14] border border-rose-900/30 p-6 flex justify-between items-center hover:border-rose-500/50 transition-colors">
                    <div>
                      <div className="text-sm font-bold text-rose-400 mb-1">Global Ingress Freeze</div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-widest">Halt all incoming telemetry payloads. Use during DB migrations.</div>
                    </div>
                    <button className="px-6 py-2 border border-rose-500/50 text-rose-500 text-[10px] uppercase tracking-widest font-bold hover:bg-rose-500/10 transition-colors">
                      Engage Lockdown
                    </button>
                  </div>
                  
                  <div className="bg-[#0D0D14] border border-rose-900/30 p-6 flex justify-between items-center hover:border-rose-500/50 transition-colors">
                    <div>
                      <div className="text-sm font-bold text-rose-400 mb-1">Purge Orphaned Ledger Data</div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-widest">Permanently delete entries with unmapped keys (GDPR compliance).</div>
                    </div>
                    <button className="px-6 py-2 border border-rose-500/50 text-rose-500 text-[10px] uppercase tracking-widest font-bold hover:bg-rose-500/10 transition-colors">
                      Execute Purge
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}