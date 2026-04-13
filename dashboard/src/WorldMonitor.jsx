import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import GlobeWidget from './GlobeWidget';

export default function WorldMonitor() {
  const [activeTab, setActiveTab] = useState('global');
  const [ledgerData, setLedgerData] = useState([]);
  const [stats, setStats] = useState({ total_audits: 0, active_projects: 0, total_violations: 0, total_suppressed: 0, compliance_rate: 100 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // NEW: State for our transition animation
  const [isTunneling, setIsTunneling] = useState(true);

  // NEW: Effect to kill the transition after 800ms
  useEffect(() => {
    const timer = setTimeout(() => setIsTunneling(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ledgerRes, statsRes] = await Promise.all([
          fetch('https://earthquake-thesaurus-davidson-intensity.trycloudflare.com/api/ledger'),
          fetch('https://earthquake-thesaurus-davidson-intensity.trycloudflare.com/api/stats')
        ]);
        
        if (!ledgerRes.ok || !statsRes.ok) throw new Error("Failed to fetch proxy");
        
        const ledgerJson = await ledgerRes.json();
        const statsJson = await statsRes.json();

        setLedgerData(ledgerJson);
        setStats(statsJson);
        setLoading(false);
        setError(null);
      } catch (err) {
        console.error("Ledger sync error:", err);
        setError("Network Disconnected.");
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0F19] flex font-sans text-slate-300 selection:bg-blue-500/30">
      
      {/* --- THE SECURE TUNNEL TRANSITION OVERLAY --- */}
      <div 
        className={`fixed inset-0 z-[9999] bg-[#0B0F19] flex flex-col items-center justify-center font-mono transition-all duration-500 ease-out ${isTunneling ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'}`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0B0F19] to-[#0B0F19]"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-12 h-12 border border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin mb-6 shadow-[0_0_15px_rgba(34,211,238,0.2)]"></div>
          <h2 className="text-cyan-400 text-sm tracking-[0.3em] font-bold uppercase mb-2 animate-pulse">
            Establishing Secure Mesh Tunnel
          </h2>
          <div className="text-slate-600 text-[10px] tracking-[0.2em]">
            ROUTING &gt;&gt; 0x{Math.random().toString(16).slice(2,10).toUpperCase()} &gt;&gt; GLOBAL_NOC
          </div>
        </div>
      </div>
      {/* ------------------------------------------- */}

      {/* SIDEBAR */}
      <aside className="w-64 border-r border-[#1E293B] bg-[#0B0F19] flex flex-col z-20">
        <div className="h-16 flex items-center px-6 border-b border-[#1E293B]">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center shadow-lg border border-blue-500">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
            </div>
            <h1 className="text-lg font-bold text-white tracking-widest">ANCHOR</h1>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-3">
            Global Network
          </div>
          
          <button 
            onClick={() => setActiveTab('global')}
            className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${activeTab === 'global' ? 'bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20' : 'hover:bg-[#131B2C] text-slate-400 hover:text-white border border-transparent'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            World Monitor
          </button>
          
          <button 
            onClick={() => setActiveTab('ledger')}
            className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${activeTab === 'ledger' ? 'bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20' : 'hover:bg-[#131B2C] text-slate-400 hover:text-white border border-transparent'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
            Global Firehose
          </button>
        </nav>

        <div className="p-4 border-t border-[#1E293B]">
           <Link to="/auth" className="flex justify-center items-center gap-2 px-3 py-3 w-full rounded-lg text-sm font-bold bg-white text-slate-900 hover:bg-slate-200 transition-colors shadow-md">
            Authenticate Fleet
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 relative bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-[#0B0F19] to-[#0B0F19]">
        
        {/* HEADER */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-[#1E293B] bg-[#0B0F19]/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-2 w-2 relative">
              {error ? (
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              ) : (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-60"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
                </>
              )}
            </div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
              {error ? "PROTOCOL DISCONNECTED" : "GLOBAL MESH SECURED"}
            </span>
          </div>
        </header>

        {/* DYNAMIC CONTENT AREA */}
        <div className="p-8 overflow-auto z-10">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* --- TAB 1: WORLD MONITOR --- */}
            {activeTab === 'global' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex justify-between items-end border-b border-[#1E293B] pb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight mb-2">World Monitor</h2>
                    <p className="text-sm text-slate-400">Live telemetry of AI governance across the decentralized Anchor network.</p>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Network Integrity</div>
                    <div className={`text-4xl font-mono font-bold tracking-tighter ${stats.compliance_rate === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {stats.compliance_rate}%
                    </div>
                  </div>
                </div>

                {/* 4 KPIs Array */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                  <div className="bg-[#131B2C] border border-[#1E293B] rounded-xl p-6 shadow-sm">
                    <span className="text-slate-400 text-[10px] font-bold tracking-widest uppercase mb-2 block">Total Audits</span>
                    <span className="text-4xl font-mono font-bold text-white">{stats.total_audits?.toLocaleString() || 0}</span>
                  </div>
                  
                  <div className="bg-[#131B2C] border border-[#1E293B] rounded-xl p-6 shadow-sm">
                    <span className="text-slate-400 text-[10px] font-bold tracking-widest uppercase mb-2 block">Active Repos</span>
                    <span className="text-4xl font-mono font-bold text-blue-400">{stats.active_projects?.toLocaleString() || 0}</span>
                  </div>
                  
                  <div className="bg-[#131B2C] border border-[#1E293B] rounded-xl p-6 shadow-sm">
                    <span className="text-slate-400 text-[10px] font-bold tracking-widest uppercase mb-2 flex items-center gap-2">
                      {stats.total_violations > 0 && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>}
                      Global Violations
                    </span>
                    <span className={`text-4xl font-mono font-bold ${stats.total_violations > 0 ? 'text-rose-400' : 'text-slate-600'}`}>
                      {stats.total_violations?.toLocaleString() || 0}
                    </span>
                  </div>

                  <div className="bg-[#131B2C] border border-[#1E293B] rounded-xl p-6 shadow-sm">
                    <span className="text-slate-400 text-[10px] font-bold tracking-widest uppercase mb-2 block">Authorized / Legal</span>
                    <span className={`text-4xl font-mono font-bold ${stats.total_suppressed > 0 ? 'text-amber-400' : 'text-slate-600'}`}>
                      {stats.total_suppressed?.toLocaleString() || 0}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  
                  {/* Holographic Visual Globe */}
                  <div className="border border-[#1E293B] bg-[#131B2C] rounded-xl p-0 shadow-sm flex flex-col relative overflow-hidden h-[450px]">
                    <div className="absolute top-5 left-5 z-10 pointer-events-none">
                      <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest mb-1">Topology Mesh</h3>
                      <p className="text-[10px] text-blue-400 font-mono">Live geospatial tracking</p>
                    </div>
                    <GlobeWidget recentEvents={stats.recent} />
                  </div>

                  {/* Live Global Ticker */}
                  <div className="xl:col-span-2 border border-[#1E293B] bg-[#131B2C] rounded-xl p-6 shadow-sm h-[450px] flex flex-col">
                    <h3 className="text-[11px] font-bold text-slate-300 uppercase tracking-widest mb-5 flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
                      Live Cryptographic Firehose
                    </h3>
                    <div className="space-y-3 font-mono text-[11px] overflow-y-auto pr-2 custom-scrollbar">
                      {stats.recent && stats.recent.length > 0 ? stats.recent.map((event, idx) => (
                        <div key={idx} className="flex flex-wrap md:flex-nowrap items-center gap-3 text-slate-400 bg-[#0B0F19] px-4 py-3 rounded-lg border border-[#1E293B] shadow-inner">
                          <span className={`px-2.5 py-1 rounded text-[9px] font-bold tracking-widest ${event.status === 'CLEAN' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                            {event.status === 'CLEAN' ? 'VERIFIED' : 'VIOLATION'}
                          </span>
                          <span className="text-white font-semibold min-w-[120px]">{event.project}</span>
                          <span className="text-slate-700 hidden md:inline">→</span>
                          <span className="text-slate-400">commit:{event.commit}</span>
                          <span className="text-slate-700 hidden md:inline">→</span>
                          <span className="text-blue-400/80 truncate flex-1">0x{event.hash}...</span>
                        </div>
                      )) : <div className="text-slate-600 py-6 text-center border border-dashed border-[#1E293B] rounded-lg bg-[#0B0F19]/50">Awaiting network transmissions...</div>}
                    </div>
                  </div>

                </div>

                {/* Violations & Legal Exceptions Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div className="border border-[#1E293B] bg-[#131B2C] rounded-xl p-6 shadow-sm">
                    <h3 className="text-[11px] font-bold text-slate-300 uppercase tracking-widest mb-5 border-b border-[#1E293B] pb-3">Active Violations Map</h3>
                    <div className="space-y-3">
                      {stats.top_threats && stats.top_threats.length > 0 ? stats.top_threats.map((threat, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm bg-[#0B0F19] p-3.5 rounded-lg border border-[#1E293B]">
                          <span className="font-mono text-slate-200 font-medium">{threat.rule}</span>
                          <span className="text-rose-400 font-mono text-xs font-bold bg-rose-500/10 px-2.5 py-1 rounded border border-rose-500/20">{threat.count} hits</span>
                        </div>
                      )) : <div className="text-[11px] text-emerald-500/70 font-mono py-5 text-center border border-dashed border-[#1E293B] rounded-lg">Zero network violations detected.</div>}
                    </div>
                  </div>

                  <div className="border border-[#1E293B] bg-[#131B2C] rounded-xl p-6 shadow-sm">
                    <h3 className="text-[11px] font-bold text-slate-300 uppercase tracking-widest mb-5 border-b border-[#1E293B] pb-3">Authorized Legal Exceptions</h3>
                    <div className="space-y-3">
                       {stats.total_suppressed > 0 ? (
                        <div className="flex justify-between items-center text-sm bg-[#0B0F19] p-3.5 rounded-lg border border-[#1E293B]">
                            <div className="flex flex-col">
                              <span className="font-mono text-slate-200 font-medium">FINOS-014</span>
                              <span className="text-[10px] text-slate-500 mt-1">Authorized by: CISO_OVERRIDE</span>
                            </div>
                            <span className="text-amber-400 font-mono text-xs font-bold bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">SUPPRESSED</span>
                        </div>
                       ) : (
                         <div className="text-[11px] text-slate-500 font-mono py-5 text-center border border-dashed border-[#1E293B] rounded-lg">No suppressed rules logged.</div>
                       )}
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* --- TAB 2: GLOBAL FIREHOSE (LEDGER) --- */}
            {activeTab === 'ledger' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="border-b border-[#1E293B] pb-6">
                  <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Global Data Contract Ledger</h2>
                  <p className="text-sm text-slate-400">Raw, immutable JSON payloads streaming from the global network.</p>
                </div>

                <div className="space-y-5">
                  {loading ? (
                     <div className="text-slate-500 text-sm animate-pulse border border-[#1E293B] bg-[#131B2C] p-6 rounded-xl">Syncing network state...</div>
                  ) : error ? (
                     <div className="text-rose-400 text-sm border border-rose-900/40 bg-rose-500/10 p-6 rounded-xl font-mono shadow-lg">
                       {error} <br/>Backend proxy unreachable.
                     </div>
                  ) : ledgerData.length === 0 ? (
                     <div className="text-slate-500 text-sm border border-[#1E293B] bg-[#131B2C] p-8 rounded-xl font-mono text-center shadow-lg">
                       Network is quiet. No cryptographic entries found.
                     </div>
                  ) : (
                    ledgerData.map((entry) => {
                      const isClean = entry.governance_status.is_compliant;
                      return (
                      <div key={entry.entry_id} className="border border-[#1E293B] bg-[#131B2C] rounded-xl p-6 hover:border-slate-600 transition-all shadow-lg relative overflow-hidden">
                        
                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isClean ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>

                        <div className="flex justify-between items-start mb-6 pl-3">
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg border ${isClean ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
                              <svg className={`w-5 h-5 ${isClean ? 'text-emerald-400' : 'text-rose-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isClean ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />}
                              </svg>
                            </div>
                            <div>
                              <div className="text-white font-bold text-base flex items-center gap-3">
                                {entry.execution_context.project_name} 
                                <span className="text-slate-400 font-mono text-[10px] px-2 py-0.5 bg-[#0B0F19] rounded border border-[#1E293B] uppercase tracking-widest">
                                  {entry.execution_context.environment}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 mt-1 font-mono tracking-wide">{entry.entry_id} • {new Date(entry.timestamp).toLocaleString()}</div>
                            </div>
                          </div>
                          <div className={`text-[10px] px-3 py-1.5 rounded uppercase font-bold tracking-widest border ${isClean ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : 'border-rose-500/30 text-rose-400 bg-rose-500/10'}`}>
                            {entry.governance_status.risk_level}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono bg-[#0B0F19] rounded-lg p-4 border border-[#1E293B] pl-6 ml-3 shadow-inner">
                          <div>
                            <span className="text-slate-500 block mb-1.5 font-sans text-[10px] uppercase font-bold tracking-wider">Input Hash (Source)</span>
                            <span className="text-slate-300 block">{entry.cryptography.input_hash.substring(0, 24)}...</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block mb-1.5 font-sans text-[10px] uppercase font-bold tracking-wider">Output Hash (Result)</span>
                            <span className="text-slate-300 block">{entry.cryptography.output_hash.substring(0, 24)}...</span>
                          </div>
                          <div>
                            <span className="text-blue-400/80 block mb-1.5 font-sans text-[10px] uppercase font-bold tracking-wider">Chain Hash (Merkle)</span>
                            <span className="text-blue-300 block">{entry.cryptography.chain_hash.substring(0, 24)}...</span>
                          </div>
                        </div>

                        {!isClean && entry.violations && entry.violations.length > 0 && (
                          <div className="mt-5 pt-5 border-t border-[#1E293B] space-y-3 pl-3">
                            <h4 className="text-[10px] font-bold text-rose-400/80 uppercase tracking-widest mb-3">Detected Violations</h4>
                            {entry.violations.map((v, idx) => (
                              <div key={idx} className="text-sm flex flex-col gap-2 bg-rose-500/5 border border-rose-500/20 p-4 rounded-lg shadow-sm">
                                <span className="text-rose-400 font-bold tracking-wide">[{v.rule_id}]</span>
                                <span className="text-slate-300 leading-relaxed text-[13px]">{v.description}</span>
                                <div className="text-slate-500 flex items-center gap-3 mt-2 pt-2 border-t border-rose-500/10">
                                  <span className="bg-[#0B0F19] px-2 py-1 rounded border border-[#1E293B] font-mono text-[10px] text-slate-400">
                                    {v.file_path}{v.line_number ? `:${v.line_number}` : ''}
                                  </span> 
                                  <span className="text-rose-400/60 font-mono text-[10px] uppercase tracking-wider font-semibold">Maps To: {v.statute_ref}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}