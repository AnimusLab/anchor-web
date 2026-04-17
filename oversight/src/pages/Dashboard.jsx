import React, { useState, useEffect } from 'react';
import PortalLayout from '../components/PortalLayout';
import { useAuth } from '../contexts/AuthContext';
import { endpoints } from '../lib/api';

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
          if (!map[id]) map[id] = { id, name: e.project_name || id, entries: 0 };
          map[id].entries++;
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

  return (
    <PortalLayout>
      <div className="flex flex-col h-[calc(100vh-140px)] bg-[#0A0C10] overflow-hidden">
        
        {/* --- Forensic Header --- */}
        <div className="flex items-center justify-between px-10 py-6 border-b border-emerald-500/10 bg-emerald-500/[0.02]">
           <div className="flex items-center gap-6">
              <div className="w-4 h-4 border border-emerald-500/30 flex items-center justify-center">
                 <div className="w-1.5 h-1.5 bg-emerald-500 animate-pulse" />
              </div>
              <div className="flex flex-col">
                 <h2 className="text-xs font-bold tracking-[0.4em] uppercase text-emerald-500">Forensic_Lab // {user?.regulator || 'Oversight_Node'}</h2>
                 <span className="text-[10px] text-slate-500 font-mono mt-1">JURISDICTION: {user?.jurisdiction || 'GLOBAL'} // SECURE_AUDIT_MODE</span>
              </div>
           </div>
           <div className="flex gap-8 text-[10px] items-center">
              <div className="flex flex-col items-end">
                 <span className="text-slate-600 uppercase tracking-tighter">Official_ID</span>
                 <span className="text-emerald-400 font-mono">{user?.official_id || 'ID_PENDING'}</span>
              </div>
              <button onClick={logout} className="px-4 py-2 border border-slate-800 text-slate-600 hover:text-rose-500 transition-all uppercase tracking-widest text-[9px]">Terminate_Session</button>
           </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          
          {/* --- Entity Registry --- */}
          <aside className="w-80 border-r border-emerald-500/5 bg-[#0D1016]/50 flex flex-col">
             <div className="p-6 border-b border-emerald-500/5">
                <div className="text-[9px] text-slate-600 uppercase tracking-[0.2em] mb-4 font-bold">Federated_Registry</div>
                <div className="space-y-1">
                   {companies.map(c => (
                     <button 
                       key={c.id} 
                       onClick={() => setActiveCompany(c)}
                       className={`w-full text-left px-4 py-3 text-[11px] font-mono transition-all border ${activeCompany?.id === c.id ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                     >
                       <div className="truncate">{c.name}</div>
                       <div className="text-[8px] opacity-40 mt-1">{c.entries} ARCHIVED_PULSES</div>
                     </button>
                   ))}
                </div>
             </div>
          </aside>

          {/* --- Evidence Timeline --- */}
          <main className="flex-1 flex flex-col overflow-hidden relative">
             <div className="absolute left-[54px] top-0 bottom-0 w-px bg-emerald-500/10" />
             
             <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-8">
                {loading ? (
                  <div className="h-full flex items-center justify-center text-[10px] tracking-[0.5em] text-slate-600 animate-pulse uppercase">Dequantizing_Evidence_Stream...</div>
                ) : ledger.map((entry, i) => (
                  <div key={i} className="flex gap-10 relative">
                     <div className="w-12 text-right pt-2 shrink-0">
                        <span className="text-[10px] font-mono text-slate-600">0{i+1}</span>
                     </div>
                     <div className="w-3 h-3 rounded-full bg-[#0A0C10] border-2 border-emerald-500/30 absolute left-[48px] top-3 z-10 flex items-center justify-center">
                        {!entry.is_compliant && <div className="w-1 h-1 bg-rose-500 animate-pulse" />}
                     </div>
                     <div className={`flex-1 p-6 border transition-all ${!entry.is_compliant ? 'border-rose-500/20 bg-rose-500/[0.01]' : 'border-emerald-500/5 bg-emerald-500/[0.01] hover:border-emerald-500/20'}`}>
                        <div className="flex justify-between items-start mb-4">
                           <div className="flex flex-col gap-1">
                              <span className={`text-[9px] font-bold tracking-widest uppercase ${!entry.is_compliant ? 'text-rose-500' : 'text-emerald-500'}`}>
                                 {entry.is_compliant ? 'PARITY_VERIFIED' : 'CORE_GOVERNANCE_BREACH'}
                              </span>
                              <span className="text-[10px] text-slate-300 font-bold">{entry.project_name}</span>
                           </div>
                           <button 
                             onClick={() => handleTranslate(entry)}
                             className="text-[9px] px-3 py-1.5 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-[#0A0C10] transition-all uppercase tracking-widest"
                           >
                             View_Evidence
                           </button>
                        </div>
                        <div className="flex gap-6 text-[9px] font-mono text-slate-600 border-t border-emerald-500/5 pt-4">
                           <span>HASH: {entry.chain_hash?.slice(0, 16)}...</span>
                           <span>ENTRY: {entry.entry_id}</span>
                        </div>
                     </div>
                  </div>
                ))}
             </div>
          </main>

        </div>

        {/* --- Forensic Vault Modal --- */}
        {selectedAudit && (
          <div className="fixed inset-0 bg-[#030406]/95 z-50 flex items-center justify-center p-12 backdrop-blur-xl">
             <div className="w-full max-w-6xl h-full border border-emerald-500/20 bg-[#0A0F14] flex flex-col shadow-2xl relative overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent absolute top-0 w-full opacity-50" />
                
                <div className="p-8 border-b border-white/5 flex justify-between items-start bg-white/[0.01]">
                   <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-3">
                         <div className="w-2 h-2 bg-emerald-500" />
                         <h3 className="text-sm font-bold tracking-[0.2em] uppercase text-emerald-500 text-center">Forensic_Vault // Evidence_Decryption</h3>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">State_Hash: {selectedAudit.chain_hash}</span>
                   </div>
                   <button onClick={() => setSelectedAudit(null)} className="text-slate-600 hover:text-white text-xl">×</button>
                </div>

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
                   <div className="border-r border-white/5 p-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
                      <div className="flex flex-col gap-4">
                         <div className="flex justify-between items-center bg-emerald-500/5 border border-emerald-500/10 p-4">
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Dialect_Translation</span>
                            <div className="flex gap-2">
                               {['SEC', 'RBI', 'EU-AI'].map(d => (
                                 <button key={d} onClick={() => setDialect(d)} className={`px-2 py-0.5 text-[9px] border ${dialect === d ? 'border-emerald-400 bg-emerald-400 text-black' : 'border-slate-800 text-slate-600'}`}>{d}</button>
                               ))}
                            </div>
                         </div>
                         <pre className="text-[11px] font-mono p-6 bg-black/40 border border-white/5 text-slate-300 whitespace-pre-wrap leading-relaxed">
                            {translatedData ? JSON.stringify(translatedData.translation, null, 2) : 'Translating_Parity_Log...'}
                         </pre>
                      </div>
                   </div>

                   <div className="p-8 bg-[#05070A] overflow-y-auto custom-scrollbar">
                      <div className="text-[10px] text-slate-600 uppercase tracking-widest font-bold mb-4 border-b border-white/5 pb-2">Verified_Raw_Payload</div>
                      <pre className="text-[11px] font-mono leading-relaxed bg-black/20 p-4" dangerouslySetInnerHTML={highlight(translatedData?.raw_payload || selectedAudit.raw_payload)} />
                   </div>
                </div>

                <div className="p-6 border-t border-white/5 bg-white/[0.01] flex justify-between items-center">
                   <div className="text-[10px] font-mono text-slate-600 uppercase">ZK_INTEGRITY_STAMP: <span className="text-emerald-900">VERIFIED_SOURCE_NODE</span></div>
                   <span className="text-[9px] text-slate-700 tracking-[0.3em] font-bold uppercase">Authorized Auditor Clearance Only</span>
                </div>
             </div>
          </div>
        )}

      </div>
    </PortalLayout>
  );
}
