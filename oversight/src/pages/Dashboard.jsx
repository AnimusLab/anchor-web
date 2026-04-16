import PortalLayout from '../components/PortalLayout';

// ─── JSON syntax highlighter ─────────────────────────────────────────────────
const highlight = (obj) => {
  if (!obj) return { __html: '' }
  const s = JSON.stringify(obj, null, 2).replace(
    /(\"(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\\"])*\"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    m => {
      let cls = 'text-emerald-400'
      if (/^"/.test(m)) cls = /:$/.test(m) ? 'text-slate-500' : 'text-emerald-400'
      else if (/true/.test(m)) cls = 'text-emerald-500'
      else if (/false|null/.test(m)) cls = 'text-rose-500'
      else cls = 'text-cyan-400'
      return `<span class="${cls}">${m}</span>`
    }
  )
  return { __html: s }
}

// ─── Header ─────────────────────────────────────────────────────────────────
function HeaderSub({ user }) {
  return (
    <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#1E1E2E]">
      <div className="flex items-center gap-4">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-emerald-pulse" />
        <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-emerald-500">
          Node Status: Operational
        </span>
        <div className="h-4 w-[1px] bg-[#1E1E2E]" />
        <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 uppercase">Operator:</span>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">{user?.display_name}</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
          <span className="text-[9px] px-2 py-0.5 border border-emerald-500/30 bg-emerald-500/5 text-emerald-400 tracking-widest uppercase">
            {user?.regulator || 'GLOBAL'}
          </span>
          <span className="text-[9px] px-2 py-0.5 border border-[#1E1E2E] text-slate-600 tracking-widest uppercase">
            {user?.access_level?.replace('_', ' ')}
          </span>
      </div>
    </div>
  )
}

// ─── Entity Sidebar ──────────────────────────────────────────────────────────
function Sidebar({ companies, activeId, onSelect }) {
  const [search, setSearch] = useState('')
  const filtered = companies.filter(c =>
    c.id.toLowerCase().includes(search.toLowerCase()) ||
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <aside className="w-80 flex flex-col flex-shrink-0 border-r border-[#1E1E2E] bg-[#0C0C12]/50">
      <div className="p-4 border-b border-[#1E1E2E]">
        <input
          type="text"
          placeholder="Search entity registry..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full h-10 px-4 text-[11px] font-mono outline-none bg-[#111118] border border-[#1E1E2E] text-slate-300 focus:border-emerald-500/40 transition-all shadow-inner"
        />
      </div>
      <div className="px-5 py-3 text-[9px] tracking-[0.2em] uppercase font-bold text-slate-600 border-b border-[#1E1E2E]">
        Registry: Federated Entities ({companies.length})
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filtered.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-[10px] uppercase tracking-widest text-[#2A2A3E]">
              Registry Empty
            </p>
          </div>
        ) : filtered.map(c => (
          <button key={c.id} onClick={() => onSelect(c)}
            className={`w-full text-left px-5 py-5 transition-all duration-200 border-b border-[#1E1E2E] relative group ${
                activeId === c.id ? 'bg-emerald-500/[0.03]' : 'hover:bg-white/[0.01]'
            }`}>
            {activeId === c.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />}
            <div className={`text-[11px] font-bold mb-1 transition-colors ${activeId === c.id ? 'text-emerald-400' : 'text-slate-300'}`}>
                {c.name}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-mono text-slate-600">
                {c.entryCount} ARCHIVED_ENTRIES
              </span>
              <span className="text-[8px] px-1.5 py-0.5 tracking-widest uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                VERIFIED
              </span>
            </div>
          </button>
        ))}
      </div>
    </aside>
  )
}

// ─── Ledger Timeline ─────────────────────────────────────────────────────────
function LedgerFeed({ entries, loading, company, token, onLogout }) {
  const [modal,      setModal]     = useState(null)
  const [dialect,    setDialect]   = useState('SEC')
  const [translating, setTranslating] = useState(false)
  const DIALECTS = ['SEC', 'RBI', 'EU_AI_ACT', 'SEBI']

  const translate = async (entry) => {
    setTranslating(true)
    try {
      const res = await fetch(endpoints.entry(company.id, entry.entry_id, dialect), {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.status === 401) { onLogout(); return }
      const data = await res.json()
      setModal({ entry, data })
    } catch { /* silence */ } finally { setTranslating(false) }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#06060A]">
      {/* Company header */}
      <div className="px-10 py-8 flex justify-between items-end flex-shrink-0 border-b border-[#1E1E2E] bg-[#0C0C12]/30">
        <div>
          <h2 className="text-2xl font-bold mb-2 text-slate-200 tracking-tight">{company.name}</h2>
          <div className="text-[10px] tracking-[0.3em] uppercase text-slate-600">
            Authoritative Forensic Timeline // Node_Link: Established
          </div>
        </div>
        <div className="text-right">
          <div className="text-[9px] uppercase tracking-widest mb-1 text-slate-600 font-bold">Registry Identity</div>
          <div className="text-[12px] font-mono font-bold text-emerald-500 tracking-[0.1em]">
            {company.id.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-[10px] uppercase tracking-[0.3em] animate-pulse text-slate-600">
              Fetching ledger chain...
            </div>
          </div>
        ) : entries.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-[#1E1E2E]">
            <p className="text-[10px] uppercase tracking-widest animate-pulse text-[#2A2A3E]">
              Awaiting encrypted stream for {company.name}...
            </p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6 relative">
            <div className="absolute left-[112px] top-0 bottom-0 w-px bg-[#1E1E2E]" />

            {entries.map((entry, i) => {
              const isViol = entry.is_compliant === false || entry.type === 'runtime_violation'
              return (
                <div key={entry.entry_id || i} className="flex gap-8 relative group">
                  {/* Timestamp */}
                  <div className="w-[100px] pt-5 flex-shrink-0 text-right">
                    <div className="text-[11px] font-bold text-slate-300">
                      {entry.timestamp ? new Date(entry.timestamp).toLocaleTimeString() : '—'}
                    </div>
                    <div className="text-[9px] mt-1 text-slate-600">
                      {entry.timestamp ? new Date(entry.timestamp).toLocaleDateString() : ''}
                    </div>
                  </div>

                  {/* Node dot */}
                  <div className="w-3 h-3 rounded-full absolute left-[107px] top-5 z-10 flex items-center justify-center border-2 border-[#06060A] bg-[#0C0C12]">
                    {isViol && <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />}
                  </div>

                  {/* Card */}
                  <div className={`flex-1 p-6 transition-all duration-300 bg-[#0C0C12] border ${
                      isViol ? 'border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.05)]' : 'border-[#1E1E2E] hover:border-emerald-500/20'
                  }`}>
                    <div className="flex justify-between items-start mb-4">
                      <span className={`text-[9px] px-2.5 py-1 uppercase tracking-widest font-bold border ${
                          isViol ? 'bg-rose-500/5 border-rose-500/30 text-rose-500' : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500'
                      }`}>
                        {isViol ? 'VIOLATION_DETECTED' : 'COMPLIANCE_VERIFIED'}
                      </span>
                      <span className="text-[9px] font-mono text-[#2A2A3E]">
                        ID: {entry.entry_id}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-5 pb-5 border-b border-[#111118]">
                      <div>
                        <span className="block text-[8px] uppercase tracking-[0.2em] mb-1 text-slate-600 font-bold">
                          Origin Project
                        </span>
                        <span className="text-[11px] font-bold text-slate-200">
                          {entry.execution_context?.project_name || entry.project_name || 'unknown'}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[8px] uppercase tracking-[0.2em] mb-1 text-slate-600 font-bold">
                          Block Chain Hash
                        </span>
                        <span className="text-[10px] font-mono text-emerald-500 truncate block">
                          {entry.chain_hash}
                        </span>
                      </div>
                    </div>

                    {/* Translate actions */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-[9px] uppercase tracking-widest text-[#2A2A3E] font-bold">
                        Regulatory Audit:
                      </span>
                      {DIALECTS.map(d => (
                        <button key={d}
                          onClick={() => { setDialect(d); translate(entry) }}
                          disabled={translating}
                          className={`text-[9px] px-3 py-1.5 uppercase tracking-widest transition-all duration-200 border ${
                              dialect === d ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'border-[#1E1E2E] text-slate-500 hover:text-emerald-400'
                          }`}>
                          {d.replace(/_/g, ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Forensic Modal ── */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-12">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md"
            onClick={() => setModal(null)} />
          <div className="relative max-w-5xl w-full flex flex-col bg-[#0C0C12] border border-emerald-500/20 overflow-hidden shadow-2xl"
            style={{ maxHeight: '85vh' }}>
            {/* Modal header */}
            <div className="flex items-center justify-between px-8 py-6 flex-shrink-0 border-b border-[#1E1E2E] bg-[#111118]">
              <div className="flex items-center gap-4">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-emerald-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                <div>
                  <div className="text-[12px] font-bold tracking-[0.3em] uppercase text-emerald-400">
                    Forensic Evidence Vault
                  </div>
                  <div className="text-[10px] font-mono mt-1 text-slate-600">
                    CHAIN_INTEGRITY: SECURE // HASH: {modal.data?.integrity?.chain_hash?.slice(0, 32)}...
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-[9px] uppercase tracking-widest text-slate-600 font-bold mb-1">Status</div>
                  <div className="text-[11px] font-bold uppercase tracking-widest text-emerald-500">
                    {modal.data?.integrity?.status || 'VERIFIED'}
                  </div>
                </div>
                <button onClick={() => setModal(null)}
                  className="w-10 h-10 flex items-center justify-center border border-[#1E1E2E] text-slate-600 hover:text-rose-500 transition-all text-2xl">
                  ×
                </button>
              </div>
            </div>

            {/* Translated content */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="mb-6 flex items-center gap-3">
                  <div className="h-4 w-1 bg-emerald-500" />
                  <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-emerald-400">
                    {dialect.replace(/_/g, ' ')} Translation
                  </div>
              </div>
              <pre className="text-[12px] leading-relaxed font-mono whitespace-pre-wrap bg-[#06060A] border border-[#1E1E2E] p-6 text-slate-400 mb-8 overflow-hidden">
                {JSON.stringify(modal.data?.translation, null, 2)}
              </pre>

              <div className="mb-4 flex items-center gap-3">
                  <div className="h-4 w-1 bg-slate-700" />
                  <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-600">
                    Raw SDK Forensic Packet
                  </div>
              </div>
              <pre className="text-[12px] leading-relaxed font-mono bg-[#06060A] border border-[#1E1E2E] p-6 max-h-[400px] overflow-auto custom-scrollbar"
                dangerouslySetInnerHTML={highlight(modal.data?.raw_payload)}
              />
            </div>

            <div className="px-8 py-4 flex justify-between items-center text-[10px] font-bold border-t border-[#1E1E2E] bg-[#111118]">
              <span className="text-slate-700 tracking-widest">
                AUTH_CHAIN: {modal.data?.integrity?.chain_hash?.slice(0, 48)}...
              </span>
              <span className="text-emerald-500 tracking-[0.2em] uppercase">Jurisdiction Authority Confirmed</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Dashboard Page ──────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, token, logout } = useAuth()
  const [companies,    setCompanies]    = useState([])
  const [activeCompany, setActiveCompany] = useState(null)
  const [ledger,       setLedger]       = useState([])
  const [loading,      setLoading]      = useState(false)

  // Load entity list
  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res  = await fetch(endpoints.ledger(), { headers: { Authorization: `Bearer ${token}` } })
        if (res.status === 401) { logout(); return }
        const data = await res.json()
        const map  = {}
        data.forEach(e => {
          const id = e.entity_id || e.execution_context?.project_name || 'unknown'
          if (!map[id]) map[id] = { id, name: id, entryCount: 0 }
          map[id].entryCount++
        })
        const list = Object.values(map)
        setCompanies(list)
        if (list.length && !activeCompany) setActiveCompany(list[0])
      } catch (err) { console.error(err) }
    }
    fetch_()
  }, [token])

  // Load ledger for active company
  useEffect(() => {
    if (!activeCompany) return
    setLoading(true)
    fetch(endpoints.ledger(activeCompany.id), { headers: { Authorization: `Bearer ${token}` } })
      .then(r => { if (r.status === 401) { logout(); return [] } return r.json() })
      .then(data => { if (data) setLedger(data) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [activeCompany, token])

  return (
    <PortalLayout>
      <div className="flex flex-col h-[calc(100vh-140px)] overflow-hidden">
        <HeaderSub user={user} />
        <div className="flex flex-1 overflow-hidden">
            <Sidebar
                companies={companies}
                activeId={activeCompany?.id}
                onSelect={setActiveCompany}
            />
            {activeCompany ? (
                <LedgerFeed
                    entries={ledger}
                    loading={loading}
                    company={activeCompany}
                    token={token}
                    onLogout={logout}
                />
            ) : (
                <div className="flex-1 flex items-center justify-center bg-[#06060A]">
                    <p className="text-[11px] uppercase tracking-[0.4em] animate-pulse text-[#2A2A3E]">
                        Select jurisdiction registry entry to begin forensic oversight
                    </p>
                </div>
            )}
        </div>
      </div>
    </PortalLayout>
  )
}
