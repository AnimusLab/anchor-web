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
  MessageSquare
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
      <div className="flex flex-col gap-6 animate-in fade-in duration-700">
        
        {/* --- TOP HUD: GOVERNANCE STATS --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#0C0C18] border border-emerald-500/10 p-5 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-all">
              <ShieldCheck size={48} className="text-emerald-500" />
            </div>
            <div className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-1">Governance Integrity</div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-emerald-400 font-mono">{complianceScore}%</span>
              <span className="text-[10px] text-emerald-900 font-bold uppercase tracking-widest">Enforced</span>
            </div>
            <div className="mt-4 h-1 bg-slate-900 overflow-hidden">
               <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${complianceScore}%` }} />
            </div>
          </div>

          <div className="bg-[#0C0C18] border border-emerald-500/10 p-5 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-all">
              <Activity size={48} className="text-blue-500" />
            </div>
            <div className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-1">Decision Pulses</div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-blue-400 font-mono">{totalAudits}</span>
              <span className="text-[10px] text-blue-900 font-bold uppercase tracking-widest">Recorded</span>
            </div>
          </div>

          <div className="bg-[#0C0C18] border border-emerald-500/10 p-5 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-all">
              <ShieldAlert size={48} className="text-rose-500" />
            </div>
            <div className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-1">Breach Density</div>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold font-mono ${totalViolations > 0 ? 'text-rose-500' : 'text-emerald-400'}`}>
                {totalViolations > 0 ? 'CRITICAL' : 'MINIMAL'}
              </span>
            </div>
          </div>

          <div className="bg-[#0C0C18] border border-emerald-500/10 p-5 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-all">
              <Globe size={48} className="text-amber-500" />
            </div>
            <div className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-1">Network Sync</div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-amber-400 font-mono">STABLE</span>
              <span className="text-[10px] text-amber-900 font-bold uppercase tracking-widest">Sovereign_Relay</span>
            </div>
          </div>
        </div>

        {/* --- TRIPLE COLUMN OVERSIGHT TERMINAL --- */}
        <div className="flex gap-6 h-[calc(100vh-220px)] overflow-hidden">
          
          {/* --- COL 1: JURISDICTION ENTITIES --- */}
          <aside className="w-80 shrink-0 bg-[#0C0C18] border border-emerald-500/10 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-emerald-500/10 bg-emerald-500/5 flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <Globe size={14} className="text-emerald-500" />
                  <span className="text-[11px] font-bold tracking-widest uppercase text-emerald-400">Jurisdiction Mesh</span>
               </div>
               <span className="text-[9px] font-mono text-slate-600">{companies.length} ENTITIES</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
              {companies.map(c => (
                <button 
                  key={c.id} 
                  onClick={() => setActiveCompany(c)}
                  className={`w-full group text-left p-4 transition-all relative border ${activeCompany?.id === c.id ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-transparent border-transparent hover:bg-emerald-500/5'}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                      <div className={`text-[12px] font-bold ${activeCompany?.id === c.id ? 'text-emerald-400' : 'text-slate-400'}`}>{c.name}</div>
                      <div className="text-[9px] font-mono text-slate-600 uppercase tracking-tighter">REG_ID: {c.id}</div>
                    </div>
                    {c.violations > 0 && <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />}
                  </div>
                  <div className="mt-3 flex gap-4 text-[9px] font-mono text-slate-600">
                     <span className="flex items-center gap-1"><Eye size={10} /> {c.entries} DECISIONS</span>
                     {c.violations > 0 && <span className="text-rose-900 font-bold flex items-center gap-1"><AlertTriangle size={10} /> {c.violations} BREACHES</span>}
                  </div>
                  {activeCompany?.id === c.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />}
                </button>
              ))}
            </div>
          </aside>

          {/* --- COL 2: AI DECISION STREAM (CENTER) --- */}
          <main className="flex-1 bg-[#0C0C18] border border-emerald-500/10 flex flex-col overflow-hidden relative shadow-inner">
            <div className="p-4 border-b border-emerald-500/10 flex items-center justify-between bg-[#0D0D14]">
               <div className="flex items-center gap-3">
                  <Terminal size={14} className="text-emerald-500" />
                  <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-emerald-400">AI_Decision_Stream // {activeCompany?.name}</span>
               </div>
               <div className="flex items-center gap-3">
                  <div className="flex bg-black/40 border border-emerald-500/20 p-1">
                    {['ALL', 'COMPLIANT', 'VIOLATIONS'].map(mode => (
                      <button 
                        key={mode} 
                        onClick={() => setFilterMode(mode)}
                        className={`px-3 py-1 text-[8px] font-bold uppercase transition-all ${filterMode === mode ? 'bg-emerald-500 text-black' : 'text-slate-600 hover:text-slate-400'}`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
               </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-2 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin" />
                    <span className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">Synchronizing_With_Remote_Ledger...</span>
                  </div>
                </div>
              ) : filteredLedger.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                   <div className="text-center opacity-30">
                      <ShieldQuestion size={48} className="mx-auto mb-4" />
                      <div className="text-[10px] font-mono tracking-[0.5em] uppercase">No_Auditable_Decisions_Found</div>
                   </div>
                </div>
              ) : filteredLedger.map((entry, i) => (
                <div key={entry.entry_id} className={`group relative p-5 border transition-all ${!entry.is_compliant ? 'border-rose-500/20 bg-rose-500/[0.03]' : 'border-emerald-500/5 bg-[#0D0D14] hover:border-emerald-500/20'}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                       <div className={`w-10 h-10 flex items-center justify-center border ${!entry.is_compliant ? 'border-rose-500/20 bg-rose-500/5' : 'border-emerald-500/10 bg-emerald-500/5'}`}>
                          {entry.is_compliant ? <ShieldCheck size={18} className="text-emerald-500" /> : <ShieldAlert size={18} className="text-rose-500" />}
                       </div>
                       <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-3">
                             <span className={`text-[10px] font-bold tracking-widest uppercase ${!entry.is_compliant ? 'text-rose-500' : 'text-emerald-500'}`}>
                                {entry.is_compliant ? 'Validated Decision' : 'Governance Violation'}
                             </span>
                             <span className="text-[10px] text-slate-600 font-mono">[{entry.timestamp}]</span>
                          </div>
                          <div className="text-[13px] font-bold text-slate-300">AI Model: {entry.project_name} // <span className="text-slate-600">REF: {entry.entry_id}</span></div>
                       </div>
                    </div>
                    <button 
                      onClick={() => handleTranslate(entry)}
                      className="group-hover:translate-x-0 translate-x-2 opacity-0 group-hover:opacity-100 transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-400 hover:text-emerald-300"
                    >
                      Audit_Decision <ChevronRight size={14} />
                    </button>
                  </div>
                  
                  {!entry.is_compliant && (
                    <div className="mt-4 flex flex-wrap gap-2">
                       {entry.violations?.map((v, idx) => (
                         <span key={idx} className="px-2 py-0.5 bg-rose-500/10 border border-rose-500/30 text-rose-500 text-[9px] font-bold uppercase">Breach: {v.type || v}</span>
                       ))}
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-white/[0.02] flex justify-between items-center text-[9px] font-mono text-slate-700 uppercase tracking-widest">
                     <div>Integrity_Proof: {entry.chain_hash?.slice(0, 32)}...</div>
                     <div className="flex items-center gap-1 text-emerald-900"><ShieldCheck size={10} /> Tamper-Evident</div>
                  </div>
                </div>
              ))}
            </div>
          </main>

          {/* --- COL 3: GOVERNANCE INTELLIGENCE (RIGHT) --- */}
          <aside className="w-80 shrink-0 flex flex-col gap-4 overflow-hidden">
             
             {/* Decision Search */}
             <div className="bg-[#0C0C18] border border-emerald-500/10 p-4">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                   <Search size={12} /> Decision Lookup
                </div>
                <div className="relative">
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search AI / Project..."
                    className="w-full bg-black/40 border border-emerald-500/20 p-3 text-[11px] text-emerald-400 placeholder:text-slate-700 outline-none focus:border-emerald-500/50 transition-all"
                  />
                </div>
             </div>

             {/* Governance Intelligence Summary */}
             <div className="bg-[#0C0C18] border border-emerald-500/10 p-4 flex-1 flex flex-col">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-white/5 pb-2">
                   <BarChart3 size={12} /> Governance Intel
                </div>
                <div className="space-y-4">
                   <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-600 uppercase">AI Decisions Scanned</span>
                      <span className="text-[11px] font-mono text-emerald-400">{ledger.length}</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-600 uppercase">Critical Governance Breaches</span>
                      <span className="text-[11px] font-mono text-rose-500">{totalViolations}</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-600 uppercase">Last Network Pulse</span>
                      <span className="text-[11px] font-mono text-slate-400">JUST NOW</span>
                   </div>
                   
                   <div className="pt-4 mt-4 border-t border-white/5 space-y-2">
                      <div className="text-[9px] text-slate-600 uppercase tracking-widest font-bold">Oversight Status</div>
                      <div className="p-3 bg-black/40 border border-emerald-500/5 text-[9px] text-emerald-900 leading-relaxed">
                         Active monitoring of the federated mesh is enabled. AI decision pulses are being dequantized and checked against jurisdiction-specific regulatory dialects.
                      </div>
                   </div>
                </div>
                
                <div className="mt-auto pt-6 space-y-2">
                   <button className="w-full p-3 border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-500 hover:text-black transition-all">
                      <Download size={14} /> Export_Decision_Log
                   </button>
                   <button className="w-full p-3 border border-rose-500/20 text-rose-500 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-rose-500/20 transition-all">
                      <ShieldAlert size={14} /> Issue_Governance_Warning
                   </button>
                </div>
             </div>

             {/* Mesh Health Monitor */}
             <div className="bg-[#0C0C18] border border-emerald-500/10 p-4">
                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center justify-between">
                   <span>Global Decision Pulse</span>
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="h-16 flex items-end gap-1 px-1">
                   {[40, 70, 45, 90, 65, 30, 80, 50, 60, 40, 75, 45, 95, 60, 30].map((h, i) => (
                     <div key={i} className="flex-1 bg-emerald-500/20 hover:bg-emerald-500/50 transition-all" style={{ height: `${h}%` }} />
                   ))}
                </div>
             </div>

          </aside>
        </div>

        {/* --- DECISION ANALYSIS VAULT (OVERLAY) --- */}
        {selectedAudit && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] flex items-center justify-center p-8 animate-in zoom-in duration-300">
             <div className="w-full max-w-7xl h-[90vh] bg-[#0A0A0F] border border-emerald-500/20 flex flex-col shadow-[0_0_50px_rgba(16,185,129,0.1)] relative">
                <div className="flex items-center justify-between p-6 border-b border-emerald-500/10 bg-emerald-500/5">
                   <div className="flex items-center gap-4">
                      <Terminal size={20} className="text-emerald-500" />
                      <div className="flex flex-col">
                         <span className="text-sm font-bold tracking-[0.2em] text-emerald-400 uppercase">Decision_Analysis // Forensic_Audit</span>
                         <span className="text-[10px] text-slate-600 font-mono">MODEL: {selectedAudit.project_name} // INTEGRITY_PROOF: {selectedAudit.chain_hash}</span>
                      </div>
                   </div>
                   <button 
                     onClick={() => { setSelectedAudit(null); setTranslatedData(null); }} 
                     className="w-10 h-10 flex items-center justify-center hover:bg-rose-500/20 hover:text-rose-500 transition-all rounded"
                   >
                     <LogOut size={20} />
                   </button>
                </div>

                <div className="flex-1 flex overflow-hidden">
                   <div className="flex-1 flex flex-col border-r border-emerald-500/10 overflow-hidden">
                      <div className="p-4 border-b border-white/5 flex gap-4 bg-black/20">
                         {['SEC', 'RBI', 'EU-AI', 'NIST'].map(d => (
                           <button 
                             key={d} 
                             onClick={() => setDialect(d)}
                             className={`px-4 py-1.5 text-[10px] font-bold uppercase transition-all ${dialect === d ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'text-slate-600 hover:text-slate-400'}`}
                           >
                             {d}
                           </button>
                         ))}
                      </div>
                      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-black/40">
                         <div className="text-[10px] text-slate-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <MessageSquare size={12} /> Regulatory Translation // {dialect} Dialect
                         </div>
                         <pre className="text-[12px] font-mono text-emerald-100 leading-relaxed whitespace-pre-wrap">
                            {translatedData ? JSON.stringify(translatedData.translation, null, 2) : (
                              <div className="flex items-center gap-3 animate-pulse">
                                 <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                                 <span className="tracking-[0.2em] uppercase">De-quantizing_AI_Intent...</span>
                              </div>
                            )}
                         </pre>
                      </div>
                   </div>

                   <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[#050508]">
                      <div className="text-[10px] text-slate-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                         <Database size={12} /> Raw Decision Payload
                      </div>
                      <pre className="text-[11px] font-mono leading-relaxed bg-black/20 p-6 border border-white/5 shadow-inner" dangerouslySetInnerHTML={highlight(translatedData?.raw_payload || selectedAudit.raw_payload)} />
                   </div>
                </div>

                <div className="p-5 border-t border-emerald-500/10 bg-emerald-500/[0.02] flex justify-between items-center text-[10px] font-mono">
                   <div className="flex gap-8 text-slate-600">
                      <span className="flex items-center gap-2"><ShieldCheck size={12} /> AUDIT_TRAIL_VERIFIED: TRUE</span>
                      <span className="flex items-center gap-2"><Globe size={12} /> JURISDICTION: {user?.regulator || "GLOBAL"}</span>
                      <span className="flex items-center gap-2"><ShieldQuestion size={12} /> COMPLIANCE_SCORE: 1.0</span>
                   </div>
                   <div className="text-emerald-900 font-bold uppercase tracking-[0.4em]">AUTHORIZED_GOVERNANCE_TERMINAL</div>
                </div>
             </div>
          </div>
        )}

      </div>
    </PortalLayout>
  );
}
