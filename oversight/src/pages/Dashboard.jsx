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
      <div className="flex flex-col gap-10 animate-in fade-in duration-700">
        
        {/* --- SECTION: SYSTEM OVERVIEW --- */}
        <section>
          <div className="flex flex-col gap-2 mb-8">
            <h2 className="text-3xl font-bold text-white tracking-tight">System Overview</h2>
            <p className="text-slate-500 max-w-2xl leading-relaxed">
              Regulatory-level view across the federated Anchor governance mesh. Monitor real-time AI decision pulses and enforce jurisdictional compliance protocols.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl relative overflow-hidden group hover:border-emerald-500/20 transition-all shadow-xl">
              <div className="absolute top-[-20%] right-[-10%] w-24 h-24 bg-emerald-500/5 blur-3xl rounded-full" />
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-4">Governance Integrity</div>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-emerald-400 font-sans tracking-tighter">{complianceScore}%</span>
                <span className="text-[10px] text-emerald-900 font-bold uppercase tracking-widest">Enforced</span>
              </div>
              <div className="mt-6 h-1.5 bg-white/5 rounded-full overflow-hidden">
                 <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${complianceScore}%` }} />
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl relative overflow-hidden group hover:border-blue-500/20 transition-all shadow-xl">
              <div className="absolute top-[-20%] right-[-10%] w-24 h-24 bg-blue-500/5 blur-3xl rounded-full" />
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-4">Decision Pulses</div>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-blue-400 font-sans tracking-tighter">{totalAudits}</span>
                <span className="text-[10px] text-blue-900 font-bold uppercase tracking-widest">Across Nodes</span>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl relative overflow-hidden group hover:border-rose-500/20 transition-all shadow-xl">
              <div className="absolute top-[-20%] right-[-10%] w-24 h-24 bg-rose-500/5 blur-3xl rounded-full" />
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-4">Open Violations</div>
              <div className="flex items-baseline gap-3">
                <span className={`text-4xl font-bold font-sans tracking-tighter ${totalViolations > 0 ? 'text-rose-500' : 'text-emerald-400'}`}>
                  {totalViolations}
                </span>
                <span className="text-[10px] text-rose-900 font-bold uppercase tracking-widest">Requires Action</span>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl relative overflow-hidden group hover:border-amber-500/20 transition-all shadow-xl">
              <div className="absolute top-[-20%] right-[-10%] w-24 h-24 bg-amber-500/5 blur-3xl rounded-full" />
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-4">Provisioned Nodes</div>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-amber-400 font-sans tracking-tighter">{companies.length}</span>
                <span className="text-[10px] text-amber-900 font-bold uppercase tracking-widest">Active Orgs</span>
              </div>
            </div>
          </div>

          {/* QUICK ACTIONS ROW */}
          <div className="flex flex-col gap-6">
             <h3 className="text-xs font-bold text-white uppercase tracking-[0.2em]">Quick Actions</h3>
             <div className="flex gap-4">
                <button className="px-6 py-4 bg-purple-600 rounded-xl text-white font-bold text-sm shadow-lg shadow-purple-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3">
                   <FileText size={18} /> Provision Report
                </button>
                <button className="px-6 py-4 bg-cyan-600 rounded-xl text-white font-bold text-sm shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3">
                   <Radio size={18} /> View Live NOC
                </button>
                <button className="px-6 py-4 bg-amber-600 rounded-xl text-white font-bold text-sm shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3">
                   <ShieldAlert size={18} /> Threat Inspection
                </button>
                <button className="px-6 py-4 bg-emerald-600 rounded-xl text-white font-bold text-sm shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3">
                   <Lock size={18} /> Secure Relay
                </button>
             </div>
          </div>
        </section>

        {/* --- TRIPLE COLUMN OVERSIGHT TERMINAL --- */}
        <div className="flex gap-8 h-[700px] overflow-hidden">
          
          {/* --- COL 1: JURISDICTION ENTITIES --- */}
          <aside className="w-80 shrink-0 flex flex-col overflow-hidden">
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col overflow-hidden h-full">
              <div className="p-5 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Globe size={16} className="text-purple-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Fleet Matrix</span>
                </div>
                <div className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[8px] font-bold uppercase rounded">Live</div>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                {companies.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-[10px] uppercase text-slate-700 tracking-widest">No nodes provisioned yet</div>
                ) : companies.map(c => (
                  <button 
                    key={c.id} 
                    onClick={() => setActiveCompany(c)}
                    className={`w-full group text-left p-5 transition-all rounded-xl relative border ${activeCompany?.id === c.id ? 'bg-purple-600/10 border-purple-500/20' : 'bg-white/[0.01] border-white/5 hover:bg-white/5'}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex flex-col gap-1">
                        <div className={`text-[13px] font-bold ${activeCompany?.id === c.id ? 'text-white' : 'text-slate-400'}`}>{c.name}</div>
                        <div className="text-[10px] text-slate-600 uppercase font-mono tracking-tighter">REG_ID: {c.id}</div>
                      </div>
                      {c.violations > 0 && <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />}
                    </div>
                    <div className="flex gap-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                      <span className="flex items-center gap-1.5"><Eye size={12} /> {c.entries}</span>
                      {c.violations > 0 && <span className="text-rose-500 flex items-center gap-1.5"><AlertTriangle size={12} /> {c.violations}</span>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* --- COL 2: AI DECISION STREAM (CENTER) --- */}
          <main className="flex-1 flex flex-col overflow-hidden">
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col overflow-hidden h-full relative">
              <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                <div className="flex items-center gap-3">
                    <Terminal size={16} className="text-emerald-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Global Action Ledger</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-black/40 border border-white/5 p-1 rounded-lg">
                      {['ALL', 'COMPLIANT', 'VIOLATIONS'].map(mode => (
                        <button 
                          key={mode} 
                          onClick={() => setFilterMode(mode)}
                          className={`px-3 py-1.5 text-[9px] font-bold uppercase rounded-md transition-all ${filterMode === mode ? 'bg-emerald-500 text-black' : 'text-slate-600 hover:text-slate-300'}`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                    <div className="px-2 py-0.5 bg-purple-500/10 text-purple-500 text-[8px] font-bold uppercase rounded">Encrypted</div>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
                {loading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4 animate-pulse">
                      <Cpu size={32} className="text-emerald-500/20" />
                      <span className="text-[10px] text-slate-600 uppercase tracking-[0.5em]">Synchronizing_Mesh...</span>
                    </div>
                  </div>
                ) : filteredLedger.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-[11px] uppercase text-slate-700 tracking-[0.3em]">No recent activity</div>
                ) : filteredLedger.map((entry, i) => (
                  <div key={entry.entry_id} className={`group relative p-6 rounded-2xl border transition-all ${!entry.is_compliant ? 'border-rose-500/20 bg-rose-500/[0.03]' : 'border-white/5 bg-white/[0.01] hover:border-emerald-500/20'}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex gap-5">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-inner ${!entry.is_compliant ? 'border-rose-500/20 bg-rose-500/5' : 'border-emerald-500/10 bg-emerald-500/5'}`}>
                            {entry.is_compliant ? <ShieldCheck size={22} className="text-emerald-500" /> : <ShieldAlert size={22} className="text-rose-500" />}
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-3">
                              <span className={`text-[10px] font-bold uppercase tracking-widest ${!entry.is_compliant ? 'text-rose-500' : 'text-emerald-500'}`}>
                                  {entry.is_compliant ? 'Validated Decision' : 'Governance Violation'}
                              </span>
                              <div className="w-1 h-1 rounded-full bg-slate-800" />
                              <span className="text-[10px] text-slate-600 font-bold uppercase">[{entry.timestamp}]</span>
                            </div>
                            <div className="text-base font-bold text-white tracking-tight">Model: {entry.project_name} // <span className="text-slate-600 font-mono text-sm uppercase">ID: {entry.entry_id}</span></div>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleTranslate(entry)}
                        className="p-3 bg-white/5 rounded-xl text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all shadow-lg border border-white/5"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                    
                    {!entry.is_compliant && (
                      <div className="mt-5 flex flex-wrap gap-2">
                        {entry.violations?.map((v, idx) => (
                          <span key={idx} className="px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[9px] font-bold uppercase rounded-lg">Breach: {v.type || v}</span>
                        ))}
                      </div>
                    )}

                    <div className="mt-5 pt-5 border-t border-white/5 flex justify-between items-center text-[10px] font-bold text-slate-700 uppercase tracking-[0.2em]">
                      <div>Integrity: {entry.chain_hash?.slice(0, 32)}...</div>
                      <div className="flex items-center gap-2 bg-emerald-500/5 px-2 py-0.5 rounded text-emerald-900 border border-emerald-500/10">
                        <Lock size={10} /> SECURE
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>

          {/* --- COL 3: GOVERNANCE INTELLIGENCE (RIGHT) --- */}
          <aside className="w-96 shrink-0 flex flex-col gap-6 overflow-hidden">
             
             {/* Decision Search */}
             <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl shadow-xl">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-3">
                   <Search size={14} className="text-purple-400" /> Decision Lookup
                </div>
                <div className="relative">
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Model / Decision ID..."
                    className="w-full bg-black/40 border border-white/10 p-4 rounded-xl text-sm text-white placeholder:text-slate-700 outline-none focus:border-purple-500/50 transition-all font-bold"
                  />
                </div>
             </div>

             {/* Governance Intelligence Summary */}
             <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl flex-1 flex flex-col shadow-xl">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-3 border-b border-white/5 pb-4">
                   <BarChart3 size={14} className="text-cyan-400" /> Intelligence Suite
                </div>
                <div className="space-y-5">
                   <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">AI Scanned</span>
                      <span className="text-sm font-bold text-emerald-400 font-mono tracking-tighter">{ledger.length}</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Breach Density</span>
                      <span className="text-sm font-bold text-rose-500 font-mono tracking-tighter">{totalViolations}</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Network Pulse</span>
                      <div className="flex items-center gap-2">
                         <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                         <span className="text-sm font-bold text-white font-mono uppercase tracking-tighter">Active</span>
                      </div>
                   </div>
                   
                   <div className="pt-6 mt-6 border-t border-white/5 space-y-3">
                      <div className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">Oversight Status</div>
                      <div className="p-4 bg-black/40 border border-white/5 rounded-xl text-[11px] text-slate-400 leading-relaxed font-bold">
                         Secure telemetry is being de-quantized across all provisioned spoke nodes. Jurisdictional dialects are synchronized at the edge.
                      </div>
                   </div>
                </div>
                
                <div className="mt-auto pt-8 space-y-3">
                   <button className="w-full py-4 bg-purple-600/10 border border-purple-500/30 rounded-xl text-purple-400 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-purple-600 hover:text-white transition-all shadow-lg shadow-purple-500/5">
                      <Download size={16} /> Export Decision Log
                   </button>
                   <button className="w-full py-4 bg-rose-600/10 border border-rose-500/30 rounded-xl text-rose-500 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-rose-600 hover:text-white transition-all shadow-lg shadow-rose-500/5">
                      <ShieldAlert size={16} /> Issue Enforcement
                   </button>
                </div>
             </div>

          </aside>
        </div>

        {/* --- DECISION ANALYSIS VAULT (OVERLAY) --- */}
        {selectedAudit && (
          <div className="fixed inset-0 bg-black/98 backdrop-blur-2xl z-[100] flex items-center justify-center p-12 animate-in zoom-in duration-300">
             <div className="w-full max-w-7xl h-full bg-[#0A0A0F] border border-white/10 rounded-[32px] flex flex-col shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between p-8 border-b border-white/5 bg-white/[0.02]">
                   <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                         <Terminal size={24} className="text-emerald-500" />
                      </div>
                      <div className="flex flex-col">
                         <span className="text-xl font-bold text-white tracking-tight uppercase">Decision Analysis // Forensic Vault</span>
                         <span className="text-xs text-slate-600 font-mono uppercase tracking-widest">Model: {selectedAudit.project_name} // Integrity: {selectedAudit.chain_hash}</span>
                      </div>
                   </div>
                   <button 
                     onClick={() => { setSelectedAudit(null); setTranslatedData(null); }} 
                     className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-rose-500/20 hover:text-rose-500 transition-all rounded-2xl border border-white/10"
                   >
                     <LogOut size={24} />
                   </button>
                </div>

                <div className="flex-1 flex overflow-hidden p-8 gap-8">
                   <div className="flex-1 flex flex-col bg-black/40 border border-white/5 rounded-3xl overflow-hidden shadow-inner">
                      <div className="p-4 border-b border-white/5 flex gap-3 bg-white/[0.01]">
                         {['SEC', 'RBI', 'EU-AI', 'NIST'].map(d => (
                           <button 
                             key={d} 
                             onClick={() => setDialect(d)}
                             className={`px-6 py-2 rounded-xl text-[11px] font-bold uppercase transition-all ${dialect === d ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' : 'text-slate-600 hover:text-white hover:bg-white/5'}`}
                           >
                             {d}
                           </button>
                         ))}
                      </div>
                      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                         <div className="text-[10px] text-slate-600 uppercase tracking-widest mb-6 flex items-center gap-3 font-bold">
                            <MessageSquare size={14} className="text-purple-400" /> Regulatory Translation // {dialect} Dialect
                         </div>
                         <pre className="text-[13px] font-mono text-white leading-relaxed whitespace-pre-wrap font-bold bg-white/[0.01] p-6 rounded-2xl border border-white/5">
                            {translatedData ? JSON.stringify(translatedData.translation, null, 2) : (
                              <div className="flex items-center gap-4 animate-pulse">
                                 <div className="w-2 h-2 bg-purple-500 rounded-full" />
                                 <span className="tracking-[0.2em] uppercase text-purple-400">De-quantizing AI Intent...</span>
                              </div>
                            )}
                         </pre>
                      </div>
                   </div>

                   <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-black/60 rounded-3xl border border-white/5 shadow-2xl">
                      <div className="text-[10px] text-slate-600 uppercase tracking-widest mb-6 flex items-center gap-3 font-bold">
                         <Database size={14} className="text-emerald-400" /> Raw Decision Payload
                      </div>
                      <pre className="text-[12px] font-mono leading-relaxed bg-black/40 p-8 rounded-2xl border border-white/5 shadow-inner" dangerouslySetInnerHTML={highlight(translatedData?.raw_payload || selectedAudit.raw_payload)} />
                   </div>
                </div>

                <div className="p-6 border-t border-white/5 bg-white/[0.02] flex justify-between items-center px-10">
                   <div className="flex gap-10 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                      <span className="flex items-center gap-2"><ShieldCheck size={14} className="text-emerald-500" /> Audit Trail Verified</span>
                      <span className="flex items-center gap-2"><Globe size={14} className="text-blue-500" /> Node: India Relay Alpha</span>
                   </div>
                   <div className="text-purple-900 font-bold uppercase tracking-[0.4em] text-xs">Authorized Master Access Only</div>
                </div>
             </div>
          </div>
        )}

      </div>
    </PortalLayout>
  );
}
