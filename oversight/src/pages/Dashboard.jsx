import React, { useState, useEffect, useMemo } from 'react';
import PortalLayout from '../components/PortalLayout';
import { useAuth } from '../contexts/AuthContext';
import { endpoints } from '../lib/api';
import { 
  ShieldCheck, 
  Activity, 
  AlertTriangle, 
  Globe, 
  Terminal,
  LogOut,
  ChevronRight,
  ShieldAlert,
  Search,
  Download,
  Workflow,
  RefreshCcw,
  Database,
  MessageSquare,
  Radio,
  FileText,
  Lock
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
  const [filterMode, setFilterMode] = useState('ALL');
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
    } catch (e) { console.error(e); }
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
      <div className="flex flex-col gap-8 animate-in fade-in duration-500 max-w-[1400px]">
        
        {/* --- HEADER BLOCK --- */}
        <div className="mb-4">
          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">System Overview</h2>
          <p className="text-xs text-slate-500 font-medium">Root-level view across the entire Anchor governance mesh.</p>
        </div>

        {/* --- ROW 1: STATS (4-COL) --- */}
        <div className="grid grid-cols-4 gap-6">
          {[
            { label: 'Total Audits', val: totalAudits, sub: 'Across all nodes', color: 'blue' },
            { label: 'Provisioned Nodes', val: companies.length, sub: 'Active enterprises', color: 'purple' },
            { label: 'Mesh Integrity', val: `${complianceScore}%`, sub: 'Governance coverage', color: 'emerald' },
            { label: 'Open Violations', val: totalViolations, sub: 'Require remediation', color: totalViolations > 0 ? 'rose' : 'emerald' }
          ].map((s, i) => (
            <div key={i} className="bg-[#0A0A0F] border border-white/[0.03] p-8 rounded-xl shadow-xl group hover:border-white/10 transition-all">
              <div className="text-[9px] text-slate-600 uppercase font-bold tracking-[0.2em] mb-6">{s.label}</div>
              <div className="text-4xl font-bold text-white mb-2 tracking-tighter">{s.val}</div>
              <div className={`text-[10px] text-${s.color}-900 font-bold uppercase tracking-widest`}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* --- ROW 2: COMMAND BLOCKS (SIDE-BY-SIDE) --- */}
        <div className="grid grid-cols-2 gap-6 h-[480px]">
          
          {/* Fleet Matrix Block */}
          <div className="bg-[#0A0A0F] border border-white/[0.03] rounded-xl flex flex-col overflow-hidden shadow-xl">
             <div className="h-14 px-6 border-b border-white/[0.03] flex items-center justify-between shrink-0 bg-white/[0.01]">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Fleet Matrix</span>
                <div className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[8px] font-bold uppercase rounded">Live</div>
             </div>
             <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {companies.map(c => (
                  <button 
                    key={c.id} 
                    onClick={() => setActiveCompany(c)}
                    className={`w-full text-left p-4 rounded-lg transition-all border ${activeCompany?.id === c.id ? 'bg-purple-600/10 border-purple-500/20' : 'bg-transparent border-transparent hover:bg-white/[0.02]'}`}
                  >
                    <div className="flex justify-between items-center">
                       <span className="text-xs font-bold text-white tracking-tight">{c.name}</span>
                       <span className="text-[10px] text-slate-600 font-mono">ID: {c.id}</span>
                    </div>
                  </button>
                ))}
                {companies.length === 0 && (
                  <div className="h-full flex items-center justify-center opacity-20 text-[9px] uppercase tracking-[0.4em] font-bold">No Nodes Provisioned</div>
                )}
             </div>
          </div>

          {/* Action Ledger Block */}
          <div className="bg-[#0A0A0F] border border-white/[0.03] rounded-xl flex flex-col overflow-hidden shadow-xl">
             <div className="h-14 px-6 border-b border-white/[0.03] flex items-center justify-between shrink-0 bg-white/[0.01]">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Global Action Ledger</span>
                <div className="px-2 py-0.5 bg-purple-500/10 text-purple-500 text-[8px] font-bold uppercase rounded">Encrypted</div>
             </div>
             <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {filteredLedger.slice(0, 10).map(entry => (
                  <div key={entry.entry_id} className="flex items-center justify-between border-b border-white/[0.02] pb-4 group">
                     <div className="flex items-center gap-4">
                        <div className={`w-2 h-2 rounded-full ${entry.is_compliant ? 'bg-emerald-500' : 'bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
                        <div className="flex flex-col">
                           <span className="text-[11px] font-bold text-white tracking-tight leading-none">{entry.project_name}</span>
                           <span className="text-[9px] text-slate-600 font-mono mt-1 uppercase">Ref: {entry.entry_id}</span>
                        </div>
                     </div>
                     <button onClick={() => handleTranslate(entry)} className="p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight size={14} className="text-slate-500" />
                     </button>
                  </div>
                ))}
                {filteredLedger.length === 0 && (
                  <div className="h-full flex items-center justify-center opacity-20 text-[9px] uppercase tracking-[0.4em] font-bold">No Recent Activity</div>
                )}
             </div>
          </div>
        </div>

        {/* --- ROW 3: QUICK ACTIONS (BOTTOM) --- */}
        <div className="mt-4">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6 px-2">Quick Actions</div>
          <div className="flex gap-4">
             {[
               { label: 'Provision Auditor', color: 'bg-indigo-600' },
               { label: 'Provision Enterprise', color: 'bg-cyan-600' },
               { label: 'View Live NOC', color: 'bg-amber-600' },
               { label: 'Fleet Inspection', color: 'bg-emerald-600' }
             ].map((btn, i) => (
               <button key={i} className={`px-6 py-3 ${btn.color} rounded-lg text-white font-bold text-[13px] shadow-xl hover:translate-y-[-2px] transition-all`}>
                  {btn.label}
               </button>
             ))}
          </div>
        </div>

        {/* --- FORENSIC OVERLAY (UNCHANGED LOGIC) --- */}
        {selectedAudit && (
          <div className="fixed inset-0 bg-black/98 backdrop-blur-3xl z-[100] flex items-center justify-center p-20 animate-in zoom-in duration-300">
             <div className="w-full max-w-6xl h-full bg-[#0A0A0F] border border-white/10 rounded-[32px] flex flex-col shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between p-10 border-b border-white/5">
                   <div className="flex flex-col">
                      <span className="text-xl font-bold text-white tracking-tight uppercase">Forensic Analysis // Vault</span>
                      <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1">Transaction_{selectedAudit.entry_id}</span>
                   </div>
                   <button onClick={() => { setSelectedAudit(null); setTranslatedData(null); }} className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-rose-500 transition-all rounded-xl border border-white/10 text-white">
                     <LogOut size={20} />
                   </button>
                </div>
                <div className="flex-1 flex overflow-hidden p-10 gap-10">
                   <div className="flex-1 bg-black/40 border border-white/5 rounded-2xl p-8 font-mono text-xs text-indigo-400 overflow-y-auto custom-scrollbar">
                      {translatedData ? JSON.stringify(translatedData.translation, null, 2) : "Decrypting AI Intent..."}
                   </div>
                   <div className="flex-1 bg-black/60 rounded-2xl p-8 border border-white/5 font-mono text-[11px] text-slate-500 overflow-y-auto custom-scrollbar" dangerouslySetInnerHTML={highlight(translatedData?.raw_payload || selectedAudit.raw_payload)} />
                </div>
             </div>
          </div>
        )}

      </div>
    </PortalLayout>
  );
},Description:
