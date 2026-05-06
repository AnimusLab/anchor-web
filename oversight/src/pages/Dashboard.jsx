import React, { useState, useEffect, useMemo } from 'react';
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
      else cls = 'text-slate-600';
      return `<span class="${cls}">${m}</span>`;
    }
  );
  return { __html: s };
};

export default function Dashboard() {
  const { user, token, logout } = useAuth();
  const [companies, setCompanies]     = useState([]);
  const [activeCompany, setActiveCompany] = useState(null);
  const [ledger, setLedger]           = useState([]);
  const [loading, setLoading]         = useState(false);
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [dialect, setDialect]         = useState('SEC');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode]   = useState('ALL');
  const [translatedData, setTranslatedData] = useState(null);

  /* ── fetch entity list ── */
  useEffect(() => {
    const run = async () => {
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
    run();
  }, [token]);

  /* ── fetch ledger for selected entity ── */
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

  /* ── translate / inspect a decision ── */
  const handleTranslate = async (entry) => {
    setSelectedAudit(entry);
    setTranslatedData(null);
    try {
      const res = await fetch(
        `${endpoints.baseUrl}/api/audit/${activeCompany.id}/entry/${entry.entry_id}?dialect=${dialect}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setTranslatedData(await res.json());
    } catch (e) { console.error(e); }
  };

  const filteredLedger = useMemo(() =>
    ledger.filter(e => {
      const q = searchQuery.toLowerCase();
      const matchSearch = e.project_name?.toLowerCase().includes(q) || e.entry_id?.toLowerCase().includes(q);
      const matchFilter = filterMode === 'ALL' || (filterMode === 'COMPLIANT' && e.is_compliant) || (filterMode === 'VIOLATIONS' && !e.is_compliant);
      return matchSearch && matchFilter;
    }),
  [ledger, searchQuery, filterMode]);

  const totalAudits     = ledger.length;
  const totalViolations = ledger.filter(l => !l.is_compliant).length;
  const complianceScore = totalAudits > 0 ? Math.round(((totalAudits - totalViolations) / totalAudits) * 100) : 100;

  /* ════════════════════════════════════════════════════════════════════════ */
  return (
    <PortalLayout>
      <div className="flex flex-col gap-8">

        {/* ── Page title ── */}
        <div className="flex justify-between items-end border-b border-white/[0.04] pb-6">
          <div className="flex flex-col gap-3">
            <h2 className="text-2xl font-bold text-white tracking-tight">System Overview</h2>
            <p className="text-[11px] text-slate-500 font-mono">Root-level view across the entire Anchor governance mesh.</p>
          </div>
          <div className="text-[9px] text-slate-600 font-mono tracking-widest uppercase">
            Jurisdiction: {user?.regulator || 'GLOBAL'}
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Audits',       value: totalAudits,       sub: 'Across all nodes',      flag: false },
            { label: 'Provisioned Nodes',  value: companies.length,  sub: 'Active enterprises',    flag: false },
            { label: 'Mesh Integrity',     value: `${complianceScore}%`, sub: 'Governance coverage', high: true },
            { label: 'Open Violations',    value: totalViolations,   sub: 'Require remediation',   warn: totalViolations > 0 },
          ].map((m, i) => (
            <div key={i} className="p-6 border border-white/[0.04] bg-[#080B10] hover:bg-white/[0.02] transition-all relative group">
              <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-4 font-bold font-mono">{m.label}</div>
              <div className={`text-3xl font-bold tracking-tighter mb-2 ${m.high ? 'text-emerald-500' : m.warn ? 'text-amber-500' : 'text-white'}`}>
                {m.value}
              </div>
              <div className="text-[8px] text-slate-600 font-mono tracking-widest uppercase">{m.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Main workspace: Fleet + Ledger ── */}
        <div className="grid grid-cols-2 gap-4 h-[420px]">

          {/* Fleet Matrix */}
          <div className="border border-white/[0.04] bg-[#080B10] flex flex-col overflow-hidden">
            <div className="h-11 px-5 border-b border-white/[0.04] flex items-center justify-between bg-white/[0.01] shrink-0">
              <span className="text-[9px] font-bold text-slate-300 tracking-[0.2em] uppercase font-mono">Fleet Matrix</span>
              <span className="text-[8px] px-2 py-0.5 bg-emerald-500/10 text-emerald-500 font-bold tracking-widest uppercase">Live</span>
            </div>

            {/* Table header */}
            <div className="grid grid-cols-3 px-5 py-3 border-b border-white/[0.04]">
              <span className="text-[8px] text-slate-600 uppercase tracking-widest font-bold font-mono">Entity</span>
              <span className="text-[8px] text-slate-600 uppercase tracking-widest font-bold font-mono text-center">Status</span>
              <span className="text-[8px] text-slate-600 uppercase tracking-widest font-bold font-mono text-right">Audit Cycles</span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {companies.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <span className="text-[9px] text-slate-700 font-mono uppercase tracking-widest">No nodes provisioned yet</span>
                </div>
              ) : companies.map(c => (
                <button
                  key={c.id}
                  onClick={() => setActiveCompany(c)}
                  className={`w-full grid grid-cols-3 px-5 py-3.5 border-b border-white/[0.03] text-left transition-all group/row hover:bg-white/[0.02] ${activeCompany?.id === c.id ? 'bg-white/[0.03]' : ''}`}
                >
                  <span className="text-[11px] text-slate-400 group-hover/row:text-white font-mono uppercase tracking-wide truncate transition-colors">{c.name}</span>
                  <span className="text-center">
                    <span className={`px-2 py-0.5 text-[8px] font-bold tracking-widest uppercase ${c.violations > 0 ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                      {c.violations > 0 ? 'BREACH' : 'COMPLIANT'}
                    </span>
                  </span>
                  <span className="text-[10px] text-slate-600 font-mono text-right italic">{c.entries} PULSES</span>
                </button>
              ))}
            </div>
          </div>

          {/* Global Action Ledger */}
          <div className="border border-white/[0.04] bg-[#080B10] flex flex-col overflow-hidden">
            <div className="h-11 px-5 border-b border-white/[0.04] flex items-center justify-between bg-white/[0.01] shrink-0">
              <span className="text-[9px] font-bold text-slate-300 tracking-[0.2em] uppercase font-mono">Global Action Ledger</span>
              <div className="flex items-center gap-3">
                {/* filter pills */}
                <div className="flex gap-1">
                  {['ALL','COMPLIANT','VIOLATIONS'].map(m => (
                    <button
                      key={m}
                      onClick={() => setFilterMode(m)}
                      className={`px-2 py-0.5 text-[8px] font-bold tracking-widest uppercase transition-all ${filterMode === m ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-600 hover:text-slate-400'}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <span className="text-[8px] px-2 py-0.5 bg-purple-500/10 text-purple-400 font-bold tracking-widest uppercase">Encrypted</span>
              </div>
            </div>

            {/* Search */}
            <div className="px-4 py-3 border-b border-white/[0.04]">
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search model or decision ID..."
                className="w-full bg-black/40 border border-white/5 px-3 py-2 text-[11px] text-white placeholder:text-slate-700 outline-none focus:border-emerald-500/40 transition-all font-mono"
              />
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <span className="text-[9px] text-slate-700 font-mono uppercase tracking-widest animate-pulse">Synchronizing relay...</span>
                </div>
              ) : filteredLedger.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <span className="text-[9px] text-slate-700 font-mono uppercase tracking-widest">No recent activity</span>
                </div>
              ) : filteredLedger.map(entry => (
                <div
                  key={entry.entry_id}
                  className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.03] hover:bg-white/[0.02] transition-all group/entry cursor-pointer"
                  onClick={() => handleTranslate(entry)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${entry.is_compliant ? 'bg-emerald-500' : 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]'}`} />
                    <div className="flex flex-col">
                      <span className="text-[11px] text-slate-400 group-hover/entry:text-white font-mono uppercase tracking-wide transition-colors">{entry.project_name}</span>
                      <span className="text-[9px] text-slate-600 font-mono">Ref: {entry.entry_id}</span>
                    </div>
                  </div>
                  <span className={`text-[8px] px-2 py-0.5 font-bold tracking-widest uppercase ${entry.is_compliant ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                    {entry.is_compliant ? 'COMPLIANT' : 'BREACH'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div>
          <div className="text-[9px] text-slate-600 uppercase tracking-[0.3em] font-bold font-mono mb-4">Quick Actions</div>
          <div className="flex gap-3">
            {[
              { label: 'Provision Auditor',   color: 'bg-purple-600  hover:bg-purple-500' },
              { label: 'Provision Enterprise', color: 'bg-cyan-600    hover:bg-cyan-500' },
              { label: 'View Live NOC',        color: 'bg-amber-600   hover:bg-amber-500' },
              { label: 'Fleet Inspection',     color: 'bg-emerald-600 hover:bg-emerald-500' },
            ].map((btn, i) => (
              <button
                key={i}
                className={`px-5 py-2.5 ${btn.color} text-white text-[11px] font-bold tracking-[0.1em] uppercase transition-all shadow-lg active:scale-95`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* FORENSIC VAULT OVERLAY */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {selectedAudit && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[100] flex items-center justify-center p-10">
          <div className="w-full max-w-6xl h-full bg-[#080B10] border border-white/[0.06] flex flex-col overflow-hidden shadow-2xl">

            {/* Vault header */}
            <div className="h-14 px-8 border-b border-white/[0.06] flex items-center justify-between bg-white/[0.01] shrink-0">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-bold text-slate-300 tracking-[0.3em] uppercase font-mono">
                  Forensic Vault // {selectedAudit.project_name}
                </span>
                <span className="text-[8px] text-slate-600 font-mono">Ref: {selectedAudit.entry_id}</span>
              </div>
              <div className="flex items-center gap-6">
                {/* Dialect selector */}
                <div className="flex gap-1">
                  {['SEC','RBI','EU-AI','NIST'].map(d => (
                    <button
                      key={d}
                      onClick={() => setDialect(d)}
                      className={`px-3 py-1 text-[9px] font-bold tracking-widest uppercase transition-all ${dialect === d ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-600 hover:text-slate-300'}`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => { setSelectedAudit(null); setTranslatedData(null); }}
                  className="text-[9px] text-slate-500 hover:text-rose-500 font-bold tracking-widest uppercase font-mono transition-colors"
                >
                  CLOSE
                </button>
              </div>
            </div>

            {/* Vault body */}
            <div className="flex-1 flex overflow-hidden">

              {/* Left: Regulatory Translation */}
              <div className="flex-1 flex flex-col border-r border-white/[0.04] overflow-hidden">
                <div className="h-9 px-6 border-b border-white/[0.04] flex items-center bg-white/[0.01] shrink-0">
                  <span className="text-[8px] text-slate-600 uppercase tracking-widest font-bold font-mono">
                    Regulatory Translation // {dialect} Dialect
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                  {translatedData ? (
                    <pre className="text-[12px] font-mono text-emerald-400 leading-relaxed whitespace-pre-wrap">
                      {JSON.stringify(translatedData.translation, null, 2)}
                    </pre>
                  ) : (
                    <div className="flex items-center gap-3 animate-pulse py-4">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                      <span className="text-[10px] text-slate-600 font-mono uppercase tracking-widest">De-quantizing AI intent...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Raw Payload */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="h-9 px-6 border-b border-white/[0.04] flex items-center bg-white/[0.01] shrink-0">
                  <span className="text-[8px] text-slate-600 uppercase tracking-widest font-bold font-mono">Raw Decision Payload</span>
                </div>
                <div
                  className="flex-1 overflow-y-auto p-6 custom-scrollbar font-mono text-[11px] leading-relaxed"
                  dangerouslySetInnerHTML={highlight(translatedData?.raw_payload || selectedAudit.raw_payload)}
                />
              </div>
            </div>

            {/* Vault footer */}
            <div className="h-10 px-8 border-t border-white/[0.04] flex items-center justify-between bg-white/[0.01] shrink-0">
              <div className="flex gap-8 text-[8px] text-slate-600 font-mono uppercase tracking-widest">
                <span>Integrity: {selectedAudit.chain_hash?.slice(0,20)}...</span>
                <span>Node: Relay_Alpha</span>
              </div>
              <span className="text-[8px] text-slate-700 font-mono uppercase tracking-widest">Authorized Access Only</span>
            </div>
          </div>
        </div>
      )}

    </PortalLayout>
  );
}
