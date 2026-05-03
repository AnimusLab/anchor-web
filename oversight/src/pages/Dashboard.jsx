import React, { useState, useEffect, useMemo } from 'react';
import PortalLayout from '../components/PortalLayout';
import { useAuth } from '../contexts/AuthContext';
import { endpoints } from '../lib/api';
import { 
  ShieldCheck, 
  Activity, 
  AlertTriangle, 
  FileSearch, 
  Globe, 
  Database,
  Terminal,
  LogOut,
  ChevronRight,
  ShieldAlert,
  Zap,
  Search,
  Download,
  Filter,
  BarChart3,
  ExternalLink,
  ShieldQuestion,
  Eye,
  MessageSquare,
  FileText,
  Radio,
  Lock,
  Cpu
} from 'lucide-react';

const highlight = (obj) => {
  if (!obj) return { __html: '' };
  const s = JSON.stringify(obj, null, 2).replace(
    /(\"(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\\"])*\"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    m => {
      let cls = 'text-emerald-400';
      if (/^"/.test(m)) cls = /:$/.test(m) ? 'text-slate-500' : 'text-emerald-400';
      else if (/true/.test(m)) cls = 'text-emerald-500';
      else if (/false|null/.test(m)) cls = 'text-rose-500';
      else cls = 'text-emerald-900';
      return `<span class="${cls}">${m}</span>`;
    }
  );
  return { __html: s };
};

export default function Dashboard() {
  const { user, token, logout } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [activeCompany, setActiveCompany] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [dialect, setDialect] = useState('SEC');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('ALL'); // ALL, COMPLIANT, VIOLATIONS
  const [translatedData, setTranslatedData] = useState(null);

  useEffect(() => {
    const fetchEntities = async () => {
      try {
        const res = await fetch(`${endpoints.baseUrl}/api/ledger`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.status === 401) logout();
        const data = await res.json();
        const map = {};
        data.forEach(e => {
          const id = e.entity_id || 'unknown';
          if (!map[id]) map[id] = { id, name: e.project_name || id, entries: 0, violations: 0 };
          map[id].entries++;
          if (!e.is_compliant) map[id].violations++;
        });
        const list = Object.values(map);
        setCompanies(list);
        if (list.length && !activeCompany) setActiveCompany(list[0]);
      } catch (err) { console.error(err); }
    };
    fetchEntities();
  }, [token]);

  useEffect(() => {
    if (!activeCompany) return;
    setLoading(true);
    fetch(`${endpoints.baseUrl}/api/ledger?entity_id=${activeCompany.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(setLedger)
      .finally(() => setLoading(false));
  }, [activeCompany, token]);

  const handleTranslate = async (entry) => {
    setSelectedAudit(entry);
    setTranslatedData(null);
    try {
      const res = await fetch(`${endpoints.baseUrl}/api/audit/${activeCompany.id}/entry/${entry.entry_id}?dialect=${dialect}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setTranslatedData(data);
    } catch (e) {
      console.error(e);
    }
  };

  const filteredLedger = useMemo(() => {
    return ledger.filter(entry => {
      const matchesSearch = 
        entry.project_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.entry_id?.toLowerCase().includes(searchQuery.toLowerCase());
        
      const matchesFilter = 
        filterMode === 'ALL' || 
        (filterMode === 'COMPLIANT' && entry.is_compliant) || 
        (filterMode === 'VIOLATIONS' && !entry.is_compliant);
        
      return matchesSearch && matchesFilter;
    });
  }, [ledger, searchQuery, filterMode]);

  const totalAudits = ledger.length;
  const totalViolations = ledger.filter(l => !l.is_compliant).length;
  const complianceScore = totalAudits > 0 ? Math.round(((totalAudits - totalViolations) / totalAudits) * 100) : 100;

  return (
    <PortalLayout>
      <div className="flex flex-col gap-12 animate-in fade-in duration-1000">
        
        {/* --- SECTION: SYSTEM OVERVIEW --- */}
        <section className="flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <h2 className="text-4xl font-bold text-white tracking-tight">System Overview</h2>
            <p className="text-slate-500 max-w-3xl leading-relaxed text-[15px] font-medium">
              Root-level view across the federated Anchor governance mesh. Monitor real-time AI decision pulses, audit sovereign ledgers, and enforce jurisdictional compliance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { label: 'Governance Integrity', val: `${complianceScore}%`, sub: 'Enforced', color: 'emerald', icon: <ShieldCheck /> },
              { label: 'Decision Pulses', val: totalAudits, sub: 'Across Nodes', color: 'blue', icon: <Activity /> },
              { label: 'Open Violations', val: totalViolations, sub: 'Action Required', color: totalViolations > 0 ? 'rose' : 'emerald', icon: <ShieldAlert /> },
              { label: 'Provisioned Nodes', val: companies.length, sub: 'Active Orgs', color: 'amber', icon: <Globe /> }
            ].map((stat, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/5 p-8 rounded-[24px] relative overflow-hidden group hover:border-white/10 transition-all shadow-2xl">
                <div className={`absolute top-[-20%] right-[-10%] w-32 h-32 bg-${stat.color}-500/5 blur-[60px] rounded-full`} />
                <div className="flex items-start justify-between mb-6 relative z-10">
                   <div className="text-[11px] text-slate-500 uppercase font-bold tracking-[0.2em]">{stat.label}</div>
                   <div className={`text-${stat.color}-500 opacity-20 group-hover:opacity-100 transition-opacity`}>{React.cloneElement(stat.icon, { size: 20 })}</div>
                </div>
                <div className="flex items-baseline gap-3 relative z-10">
                  <span className={`text-4xl font-bold text-${stat.color}-400 tracking-tighter`}>{stat.val}</span>
                  <span className={`text-[10px] text-${stat.color}-900 font-bold uppercase tracking-widest`}>{stat.sub}</span>
                </div>
                {stat.label === 'Governance Integrity' && (
                  <div className="mt-8 h-2 bg-white/5 rounded-full overflow-hidden relative z-10">
                     <div className="h-full bg-emerald-500 transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${complianceScore}%` }} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* QUICK ACTIONS ROW - PRECISION ALIGNED */}
          <div className="flex flex-col gap-5">
             <div className="flex items-center gap-3">
                <div className="h-px w-6 bg-purple-500/30" />
                <h3 className="text-[11px] font-bold text-white uppercase tracking-[0.4em] opacity-60">Quick Actions</h3>
             </div>
             <div className="flex gap-5">
                {[
                  { label: 'Provision Report', icon: <FileText />, color: 'bg-purple-600', shadow: 'shadow-purple-500/20' },
                  { label: 'View Live NOC', icon: <Radio />, color: 'bg-cyan-600', shadow: 'shadow-cyan-500/20' },
                  { label: 'Threat Inspection', icon: <ShieldAlert />, color: 'bg-amber-600', shadow: 'shadow-amber-500/20' },
                  { label: 'Secure Relay', icon: <Lock />, color: 'bg-emerald-600', shadow: 'shadow-emerald-500/20' }
                ].map((act, i) => (
                  <button key={i} className={`px-8 py-5 ${act.color} rounded-2xl text-white font-bold text-sm ${act.shadow} hover:scale-[1.03] active:scale-95 transition-all flex items-center gap-4 shadow-xl`}>
                    {React.cloneElement(act.icon, { size: 20 })}
                    <span>{act.label}</span>
                  </button>
                ))}
             </div>
          </div>
        </section>

        {/* --- TRIPLE COLUMN TERMINAL - RIGID GRID ALIGNMENT --- */}
        <div className="grid grid-cols-[340px_1fr_400px] gap-10 h-[800px] overflow-hidden pb-10">
          
          {/* --- COL 1: FLEET MATRIX --- */}
          <aside className="flex flex-col overflow-hidden h-full">
            <div className="bg-white/[0.02] border border-white/5 rounded-[28px] flex flex-col overflow-hidden h-full shadow-2xl">
              <div className="h-20 px-8 border-b border-white/5 bg-white/[0.01] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <Globe size={18} className="text-purple-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-[0.2em]">Fleet Matrix</span>
                </div>
                <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1 rounded-full">
                   <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                   <span className="text-emerald-500 text-[9px] font-bold uppercase tracking-widest">Live</span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {companies.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                     <span className="text-[10px] uppercase text-slate-700 tracking-[0.3em] font-bold">No nodes provisioned</span>
                  </div>
                ) : companies.map(c => (
                  <button 
                    key={c.id} 
                    onClick={() => setActiveCompany(c)}
                    className={`w-full group text-left p-6 transition-all rounded-2xl relative border ${activeCompany?.id === c.id ? 'bg-purple-600/10 border-purple-500/20 shadow-lg shadow-purple-500/5' : 'bg-white/[0.01] border-white/5 hover:bg-white/5 border-transparent'}`}
                  >
                    <div className="flex justify-between items-start mb-5">
                      <div className="flex flex-col gap-1.5">
                        <div className={`text-[15px] font-bold leading-tight ${activeCompany?.id === c.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>{c.name}</div>
                        <div className="text-[10px] text-slate-600 uppercase font-mono tracking-tighter">REG_ID: {c.id}</div>
                      </div>
                      {c.violations > 0 && <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_15px_rgba(239,68,68,0.6)] animate-pulse" />}
                    </div>
                    <div className="flex gap-6 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                      <span className="flex items-center gap-2"><Eye size={14} className="opacity-40" /> {c.entries} PULSES</span>
                      {c.violations > 0 && <span className="text-rose-500 flex items-center gap-2"><AlertTriangle size={14} /> {c.violations} BREACH</span>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* --- COL 2: ACTION LEDGER --- */}
          <main className="flex flex-col overflow-hidden h-full">
            <div className="bg-white/[0.02] border border-white/5 rounded-[28px] flex flex-col overflow-hidden h-full relative shadow-2xl">
              <div className="h-20 px-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01] shrink-0">
                <div className="flex items-center gap-4">
                    <Terminal size={18} className="text-emerald-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-[0.2em]">Global Action Ledger</span>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex bg-black/40 border border-white/5 p-1 rounded-xl">
                      {['ALL', 'COMPLIANT', 'VIOLATIONS'].map(mode => (
                        <button 
                          key={mode} 
                          onClick={() => setFilterMode(mode)}
                          className={`px-5 py-2 text-[10px] font-bold uppercase rounded-lg transition-all ${filterMode === mode ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-slate-600 hover:text-slate-300'}`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                    <div className="h-4 w-px bg-white/10" />
                    <div className="text-[10px] text-purple-500 font-bold uppercase tracking-widest bg-purple-500/5 px-3 py-1 rounded-full border border-purple-500/10">Encrypted</div>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-6">
                {loading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="flex flex-col items-center gap-5">
                      <Cpu size={40} className="text-emerald-500 animate-spin opacity-20" />
                      <span className="text-[11px] text-slate-600 uppercase tracking-[0.6em] font-bold">Synchronizing_Relay</span>
                    </div>
                  </div>
                ) : filteredLedger.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                     <span className="text-[11px] uppercase text-slate-700 tracking-[0.4em] font-bold">No recent governance events</span>
                  </div>
                ) : filteredLedger.map((entry, i) => (
                  <div key={entry.entry_id} className={`group relative p-8 rounded-[24px] border transition-all ${!entry.is_compliant ? 'border-rose-500/20 bg-rose-500/[0.04] shadow-2xl shadow-rose-500/5' : 'border-white/5 bg-white/[0.01] hover:border-emerald-500/20'}`}>
                    <div className="flex justify-between items-center">
                      <div className="flex gap-6 items-center">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-inner transition-all ${!entry.is_compliant ? 'border-rose-500/20 bg-rose-500/10' : 'border-emerald-500/10 bg-emerald-500/10 group-hover:bg-emerald-500/20'}`}>
                            {entry.is_compliant ? <ShieldCheck size={28} className="text-emerald-500" /> : <ShieldAlert size={28} className="text-rose-500" />}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-4">
                              <span className={`text-[11px] font-bold uppercase tracking-[0.2em] ${!entry.is_compliant ? 'text-rose-500' : 'text-emerald-500'}`}>
                                  {entry.is_compliant ? 'Verified Decision' : 'Governance Violation'}
                              </span>
                              <div className="w-1 h-1 rounded-full bg-slate-800" />
                              <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">[{entry.timestamp}]</span>
                            </div>
                            <div className="text-lg font-bold text-white tracking-tight leading-tight">AI Model: {entry.project_name} <span className="mx-2 text-slate-800 opacity-30">/</span> <span className="text-slate-600 font-mono text-xs font-medium uppercase">REF: {entry.entry_id}</span></div>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleTranslate(entry)}
                        className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-2xl text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all shadow-xl border border-white/5 group-hover:scale-110 active:scale-90"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                    
                    {!entry.is_compliant && (
                      <div className="mt-6 flex flex-wrap gap-3">
                        {entry.violations?.map((v, idx) => (
                          <span key={idx} className="px-4 py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-bold uppercase rounded-xl">Breach: {v.type || v}</span>
                        ))}
                      </div>
                    )}

                    <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center text-[11px] font-bold text-slate-700 uppercase tracking-[0.3em]">
                      <div className="flex items-center gap-3">
                         <span className="opacity-40">Integrity_Proof:</span>
                         <span className="text-slate-500">{entry.chain_hash?.slice(0, 32)}...</span>
                      </div>
                      <div className="flex items-center gap-2 bg-emerald-500/5 px-3 py-1 rounded-lg text-emerald-900 border border-emerald-500/10">
                        <Lock size={12} /> SECURE
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>

          {/* --- COL 3: INTELLIGENCE SUITE --- */}
          <aside className="flex flex-col gap-10 overflow-hidden h-full">
             
             {/* Decision Search */}
             <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[28px] shadow-2xl">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-4">
                   <Search size={16} className="text-purple-500" /> Decision Lookup
                </div>
                <div className="relative">
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Model or Ref ID..."
                    className="w-full bg-black/40 border border-white/10 p-5 rounded-2xl text-sm text-white placeholder:text-slate-700 outline-none focus:border-purple-500/50 transition-all font-bold shadow-inner"
                  />
                </div>
             </div>

             {/* Intelligence Summary */}
             <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[28px] flex-1 flex flex-col shadow-2xl relative overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-40 h-40 bg-cyan-500/5 blur-[80px] rounded-full" />
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-4 border-b border-white/5 pb-6 relative z-10">
                   <BarChart3 size={16} className="text-cyan-400" /> Intelligence Suite
                </div>
                <div className="space-y-6 relative z-10">
                   <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">AI Pulses Scanned</span>
                      <span className="text-base font-bold text-emerald-400 font-mono tracking-tighter">{ledger.length}</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">Breach Density</span>
                      <span className="text-base font-bold text-rose-500 font-mono tracking-tighter">{totalViolations}</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">Network Pulse</span>
                      <div className="flex items-center gap-3">
                         <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                         <span className="text-sm font-bold text-white font-mono uppercase tracking-tighter">Active</span>
                      </div>
                   </div>
                   
                   <div className="pt-8 mt-8 border-t border-white/5 space-y-4">
                      <div className="text-[11px] text-slate-600 uppercase tracking-[0.2em] font-bold">Oversight Status</div>
                      <div className="p-5 bg-black/40 border border-white/5 rounded-2xl text-[12px] text-slate-400 leading-relaxed font-bold shadow-inner">
                         Secure telemetry is being de-quantized across all provisioned nodes. Sovereign Relay Alpha is currently maintaining jurisdictional parity.
                      </div>
                   </div>
                </div>
                
                <div className="mt-auto pt-10 space-y-4 relative z-10">
                   <button className="w-full py-5 bg-purple-600/10 border border-purple-500/30 rounded-2xl text-purple-400 text-xs font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-purple-600 hover:text-white transition-all shadow-xl shadow-purple-500/5">
                      <Download size={20} /> Export Audit Log
                   </button>
                   <button className="w-full py-5 bg-rose-600/10 border border-rose-500/30 rounded-2xl text-rose-500 text-xs font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-rose-600 hover:text-white transition-all shadow-xl shadow-rose-500/5">
                      <ShieldAlert size={20} /> Issue Enforcement
                   </button>
                </div>
             </div>

          </aside>
        </div>

        {/* --- DECISION ANALYSIS VAULT (OVERLAY) --- */}
        {selectedAudit && (
          <div className="fixed inset-0 bg-black/98 backdrop-blur-3xl z-[100] flex items-center justify-center p-16 animate-in zoom-in duration-500">
             <div className="w-full max-w-[1600px] h-full bg-[#0A0A0F] border border-white/10 rounded-[40px] flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.8)] relative overflow-hidden">
                <div className="flex items-center justify-between p-10 border-b border-white/5 bg-white/[0.02]">
                   <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-emerald-500/10 rounded-[20px] flex items-center justify-center border border-emerald-500/20 shadow-inner">
                         <Terminal size={32} className="text-emerald-500" />
                      </div>
                      <div className="flex flex-col">
                         <span className="text-2xl font-bold text-white tracking-tight uppercase">Decision Analysis // Forensic Vault</span>
                         <span className="text-[11px] text-slate-600 font-mono uppercase tracking-[0.3em] mt-1 font-bold">Model: {selectedAudit.project_name} // Proof: {selectedAudit.chain_hash}</span>
                      </div>
                   </div>
                   <button 
                     onClick={() => { setSelectedAudit(null); setTranslatedData(null); }} 
                     className="w-14 h-14 flex items-center justify-center bg-white/5 hover:bg-rose-500/20 hover:text-rose-500 transition-all rounded-[20px] border border-white/10 shadow-xl"
                   >
                     <LogOut size={28} />
                   </button>
                </div>

                <div className="flex-1 flex overflow-hidden p-10 gap-10">
                   <div className="flex-1 flex flex-col bg-black/40 border border-white/5 rounded-[32px] overflow-hidden shadow-inner">
                      <div className="h-16 px-6 border-b border-white/5 flex gap-4 bg-white/[0.01] items-center">
                         {['SEC', 'RBI', 'EU-AI', 'NIST'].map(d => (
                           <button 
                             key={d} 
                             onClick={() => setDialect(d)}
                             className={`px-8 py-2.5 rounded-xl text-xs font-bold uppercase transition-all ${dialect === d ? 'bg-purple-600 text-white shadow-2xl shadow-purple-500/40' : 'text-slate-600 hover:text-white hover:bg-white/5'}`}
                           >
                             {d}
                           </button>
                         ))}
                      </div>
                      <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                         <div className="text-[11px] text-slate-600 uppercase tracking-[0.3em] mb-8 flex items-center gap-4 font-bold">
                            <MessageSquare size={16} className="text-purple-500" /> Regulatory Translation // {dialect} Dialect
                         </div>
                         <pre className="text-[14px] font-mono text-white leading-relaxed whitespace-pre-wrap font-bold bg-white/[0.01] p-8 rounded-[24px] border border-white/5 shadow-inner">
                            {translatedData ? JSON.stringify(translatedData.translation, null, 2) : (
                              <div className="flex items-center gap-5 animate-pulse py-10">
                                 <div className="w-3 h-3 bg-purple-500 rounded-full" />
                                 <span className="tracking-[0.4em] uppercase text-purple-400 font-bold">De-quantizing AI Intent...</span>
                              </div>
                            )}
                         </pre>
                      </div>
                   </div>

                   <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-black/60 rounded-[32px] border border-white/5 shadow-2xl">
                      <div className="text-[11px] text-slate-600 uppercase tracking-[0.3em] mb-8 flex items-center gap-4 font-bold">
                         <Database size={16} className="text-emerald-400" /> Raw Decision Payload
                      </div>
                      <pre className="text-[13px] font-mono leading-relaxed bg-black/40 p-10 rounded-[24px] border border-white/5 shadow-inner" dangerouslySetInnerHTML={highlight(translatedData?.raw_payload || selectedAudit.raw_payload)} />
                   </div>
                </div>

                <div className="p-8 border-t border-white/5 bg-white/[0.02] flex justify-between items-center px-12">
                   <div className="flex gap-12 text-[11px] text-slate-600 font-bold uppercase tracking-[0.3em]">
                      <span className="flex items-center gap-3"><ShieldCheck size={16} className="text-emerald-500" /> Audit Trail Verified</span>
                      <span className="flex items-center gap-3"><Globe size={16} className="text-blue-500" /> Secure Node: Relay_Alpha_In</span>
                   </div>
                   <div className="text-purple-900 font-bold uppercase tracking-[0.5em] text-xs">Authorized Master Access Only</div>
                </div>
             </div>
          </div>
        )}

      </div>
    </PortalLayout>
  );
}
