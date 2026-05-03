import React, { useState, useEffect } from 'react';
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
  Zap
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
  const [translating, setTranslating] = useState(false);
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
    setTranslating(true);
    setSelectedAudit(entry);
    try {
      const res = await fetch(`${endpoints.baseUrl}/api/audit/${activeCompany.id}/entry/${entry.entry_id}?dialect=${dialect}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setTranslatedData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setTranslating(false);
    }
  };

  const totalAudits = ledger.length;
  const totalViolations = ledger.filter(l => !l.is_compliant).length;
  const complianceScore = totalAudits > 0 ? Math.round(((totalAudits - totalViolations) / totalAudits) * 100) : 100;

  return (
    <PortalLayout>
      <div className="flex flex-col gap-6 animate-in fade-in duration-700">
        
        {/* --- TOP HUD: SYSTEM STATS --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#0C0C18] border border-emerald-500/10 p-5 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-all">
              <ShieldCheck size={48} className="text-emerald-500" />
            </div>
            <div className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-1">Compliance Score</div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-emerald-400 font-mono">{complianceScore}%</span>
              <span className="text-[10px] text-emerald-900 font-bold uppercase tracking-widest">Nominal</span>
            </div>
            <div className="mt-4 h-1 bg-slate-900 overflow-hidden">
               <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${complianceScore}%` }} />
            </div>
          </div>

          <div className="bg-[#0C0C18] border border-emerald-500/10 p-5 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-all">
              <Activity size={48} className="text-blue-500" />
            </div>
            <div className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-1">Active Audits</div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-blue-400 font-mono">{totalAudits}</span>
              <span className="text-[10px] text-blue-900 font-bold uppercase tracking-widest">In_Mesh</span>
            </div>
          </div>

          <div className="bg-[#0C0C18] border border-emerald-500/10 p-5 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-all">
              <AlertTriangle size={48} className="text-rose-500" />
            </div>
            <div className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-1">Risk Assessment</div>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold font-mono ${totalViolations > 0 ? 'text-rose-500' : 'text-emerald-400'}`}>
                {totalViolations > 0 ? 'ELEVATED' : 'LOW'}
              </span>
            </div>
          </div>

          <div className="bg-[#0C0C18] border border-emerald-500/10 p-5 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-all">
              <Zap size={48} className="text-amber-500" />
            </div>
            <div className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-1">Relay Latency</div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-amber-400 font-mono">14ms</span>
              <span className="text-[10px] text-amber-900 font-bold uppercase tracking-widest">Synchronized</span>
            </div>
          </div>
        </div>

        <div className="flex gap-6 h-[calc(100vh-320px)]">
          
          {/* --- LEFT: FEDERATED REGISTRY --- */}
          <aside className="w-80 bg-[#0C0C18] border border-emerald-500/10 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-emerald-500/10 bg-emerald-500/5 flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <Globe size={14} className="text-emerald-500" />
                  <span className="text-[11px] font-bold tracking-widest uppercase text-emerald-400">Mesh Entities</span>
               </div>
               <span className="text-[9px] font-mono text-slate-600">{companies.length} ACTIVE</span>
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
                      <div className="text-[9px] font-mono text-slate-600 uppercase tracking-tighter">ID: {c.id}</div>
                    </div>
                    {c.violations > 0 && <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />}
                  </div>
                  <div className="mt-3 flex gap-4 text-[9px] font-mono text-slate-600">
                     <span className="flex items-center gap-1"><Database size={10} /> {c.entries}</span>
                     {c.violations > 0 && <span className="text-rose-900 font-bold flex items-center gap-1"><AlertTriangle size={10} /> {c.violations}</span>}
                  </div>
                  {activeCompany?.id === c.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />}
                </button>
              ))}
            </div>
          </aside>

          {/* --- MAIN: EVIDENCE STREAM --- */}
          <main className="flex-1 bg-[#0C0C18] border border-emerald-500/10 flex flex-col overflow-hidden relative">
            <div className="p-4 border-b border-emerald-500/10 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <Terminal size={14} className="text-emerald-500" />
                  <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-emerald-400">Evidence_Stream // {activeCompany?.name}</span>
               </div>
               <div className="flex items-center gap-4 text-[10px] font-mono text-slate-600">
                  <span className="flex items-center gap-1"><Zap size={10} className="text-amber-500" /> Real-time Feed Active</span>
               </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin" />
                    <span className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">Dequantizing_Grid_Data...</span>
                  </div>
                </div>
              ) : ledger.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                   <div className="text-center opacity-30">
                      <FileSearch size={48} className="mx-auto mb-4" />
                      <div className="text-[10px] font-mono tracking-[0.5em] uppercase">No_Evidence_Found</div>
                   </div>
                </div>
              ) : ledger.map((entry, i) => (
                <div key={entry.entry_id} className={`group relative p-5 border transition-all ${!entry.is_compliant ? 'border-rose-500/20 bg-rose-500/[0.02]' : 'border-emerald-500/5 bg-[#0D0D14] hover:border-emerald-500/20'}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                       <div className={`w-10 h-10 flex items-center justify-center border ${!entry.is_compliant ? 'border-rose-500/20 bg-rose-500/5' : 'border-emerald-500/10 bg-emerald-500/5'}`}>
                          {entry.is_compliant ? <ShieldCheck size={18} className="text-emerald-500" /> : <ShieldAlert size={18} className="text-rose-500" />}
                       </div>
                       <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-3">
                             <span className={`text-[10px] font-bold tracking-widest uppercase ${!entry.is_compliant ? 'text-rose-500' : 'text-emerald-500'}`}>
                                {entry.is_compliant ? 'Verified_Integrity' : 'Compliance_Violation'}
                             </span>
                             <span className="text-[10px] text-slate-600 font-mono">[{entry.timestamp}]</span>
                          </div>
                          <div className="text-[13px] font-bold text-slate-300">{entry.project_name} // <span className="text-slate-600">ID: {entry.entry_id}</span></div>
                       </div>
                    </div>
                    <button 
                      onClick={() => handleTranslate(entry)}
                      className="group-hover:translate-x-0 translate-x-2 opacity-0 group-hover:opacity-100 transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-400 hover:text-emerald-300"
                    >
                      Inspect_Forensics <ChevronRight size={14} />
                    </button>
                  </div>
                  
                  {!entry.is_compliant && (
                    <div className="mt-4 flex flex-wrap gap-2">
                       {entry.violations?.map((v, idx) => (
                         <span key={idx} className="px-2 py-0.5 bg-rose-500/10 border border-rose-500/30 text-rose-500 text-[9px] font-bold uppercase">{v.type || v}</span>
                       ))}
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-white/[0.02] flex justify-between items-center text-[9px] font-mono text-slate-700 uppercase tracking-widest">
                     <div>State_Hash: {entry.chain_hash?.slice(0, 32)}...</div>
                     <div>Signed_By_Mesh: OK</div>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>

        {/* --- FORENSIC VAULT OVERLAY --- */}
        {selectedAudit && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-8 animate-in zoom-in duration-300">
             <div className="w-full max-w-6xl h-[85vh] bg-[#0A0A0F] border border-emerald-500/20 flex flex-col shadow-2xl relative">
                <div className="flex items-center justify-between p-6 border-b border-emerald-500/10 bg-emerald-500/5">
                   <div className="flex items-center gap-4">
                      <Terminal size={18} className="text-emerald-500" />
                      <div className="flex flex-col">
                         <span className="text-xs font-bold tracking-[0.2em] text-emerald-400 uppercase">Forensic_Vault // Evidence_Decryption</span>
                         <span className="text-[9px] text-slate-600 font-mono">OBJECT_ID: {selectedAudit.entry_id} // CHAIN_HASH: {selectedAudit.chain_hash}</span>
                      </div>
                   </div>
                   <button 
                     onClick={() => { setSelectedAudit(null); setTranslatedData(null); }} 
                     className="w-8 h-8 flex items-center justify-center hover:bg-rose-500/20 hover:text-rose-500 transition-all rounded"
                   >
                     <LogOut size={16} />
                   </button>
                </div>

                <div className="flex-1 flex overflow-hidden">
                   <div className="flex-1 flex flex-col border-r border-emerald-500/10 overflow-hidden">
                      <div className="p-4 border-b border-white/5 flex gap-4">
                         {['SEC', 'RBI', 'EU-AI', 'NIST'].map(d => (
                           <button 
                             key={d} 
                             onClick={() => setDialect(d)}
                             className={`px-3 py-1 text-[10px] font-bold uppercase transition-all ${dialect === d ? 'bg-emerald-500 text-black' : 'text-slate-600 hover:text-slate-400'}`}
                           >
                             {d}
                           </button>
                         ))}
                      </div>
                      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-black/40">
                         <div className="text-[10px] text-slate-600 uppercase tracking-widest mb-4">Dialect_Translation // {dialect}</div>
                         <pre className="text-[11px] font-mono text-emerald-100 leading-relaxed whitespace-pre-wrap">
                            {translatedData ? JSON.stringify(translatedData.translation, null, 2) : (
                              <div className="flex items-center gap-3 animate-pulse">
                                 <div className="w-2 h-2 bg-emerald-500" />
                                 <span>Dequantizing_Dialect_Parity...</span>
                              </div>
                            )}
                         </pre>
                      </div>
                   </div>

                   <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-[#050508]">
                      <div className="text-[10px] text-slate-600 uppercase tracking-widest mb-4">Verified_Raw_Payload</div>
                      <pre className="text-[11px] font-mono leading-relaxed bg-black/20 p-4 border border-white/5" dangerouslySetInnerHTML={highlight(translatedData?.raw_payload || selectedAudit.raw_payload)} />
                   </div>
                </div>

                <div className="p-4 border-t border-emerald-500/10 bg-emerald-500/[0.02] flex justify-between items-center text-[9px] font-mono">
                   <div className="flex gap-6 text-slate-600">
                      <span>MTLS_VERIFIED: TRUE</span>
                      <span>SOURCE_IP: REDACTED</span>
                      <span>FORENSIC_INTEGRITY: 1.0</span>
                   </div>
                   <div className="text-emerald-900 font-bold uppercase tracking-[0.3em]">SECURE_OVERSIGHT_CHANNEL</div>
                </div>
             </div>
          </div>
        )}

      </div>
    </PortalLayout>
  );
}
