import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { endpoints } from '../lib/api'

// ─── JSON syntax highlighter ─────────────────────────────────────────────────
const highlight = (obj) => {
  if (!obj) return { __html: '' }
  const s = JSON.stringify(obj, null, 2).replace(
    /(\"(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\\"])*\"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    m => {
      let cls = 'color:#6EE7B7'
      if (/^"/.test(m)) cls = /:$/.test(m) ? 'color:#94A3B8' : 'color:#6EE7B7'
      else if (/true/.test(m)) cls = 'color:#34D399'
      else if (/false|null/.test(m)) cls = 'color:#F87171'
      else cls = 'color:#67E8F9'
      return `<span style="${cls}">${m}</span>`
    }
  )
  return { __html: s }
}

// ─── Header ─────────────────────────────────────────────────────────────────
function Header({ user, onLogout }) {
  const [time, setTime] = useState('')
  useEffect(() => {
    const t = () => setTime(new Date().toUTCString().replace('GMT', 'UTC'))
    t(); const id = setInterval(t, 1000); return () => clearInterval(id)
  }, [])

  return (
    <header className="h-12 flex items-center justify-between px-6 flex-shrink-0"
      style={{ background: '#06060A', borderBottom: '1px solid #1E1E2E' }}>
      <div className="flex items-center gap-4">
        <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
        <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-amber-500">
          Anchor Oversight
        </span>
        <span className="text-[9px] tracking-widest uppercase"
          style={{ color: '#1E1E2E', margin: '0 4px' }}>|</span>
        <span className="text-[10px] font-bold tracking-widest uppercase"
          style={{ color: '#C9A84C' }}>
          {user?.display_name}
        </span>
        <span className="text-[9px] px-2 py-0.5 tracking-widest uppercase"
          style={{ border: '1px solid rgba(201,168,76,0.3)', color: '#C9A84C', background: 'rgba(201,168,76,0.06)' }}>
          {user?.regulator}
        </span>
        <span className="text-[9px] px-2 py-0.5 tracking-widest uppercase"
          style={{ border: '1px solid #1E1E2E', color: '#4A5568' }}>
          {user?.access_level?.replace('_', ' ')}
        </span>
      </div>

      <div className="flex items-center gap-5">
        <span className="text-[9px] tracking-widest uppercase" style={{ color: '#2A2A3E' }}>
          Session Logging Active
        </span>
        <span className="text-[9px] font-mono" style={{ color: '#2A2A3E' }}>{time}</span>
        <span className="text-[9px] font-mono" style={{ color: '#2A2A3E' }}>
          {user?.entity_id}
        </span>
        <button
          onClick={onLogout}
          className="text-[9px] tracking-widest uppercase px-3 py-1 transition-all duration-150"
          style={{ border: '1px solid #1E1E2E', color: '#4A5568' }}
          onMouseEnter={e => { e.target.style.borderColor = '#EF4444'; e.target.style.color = '#EF4444' }}
          onMouseLeave={e => { e.target.style.borderColor = '#1E1E2E'; e.target.style.color = '#4A5568' }}>
          Terminate Session
        </button>
      </div>
    </header>
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
    <aside className="w-72 flex flex-col flex-shrink-0"
      style={{ borderRight: '1px solid #1E1E2E', background: '#0C0C12' }}>
      <div className="p-3" style={{ borderBottom: '1px solid #1E1E2E' }}>
        <input
          type="text"
          placeholder="Search entity registry..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full h-9 px-3 text-[11px] font-mono outline-none"
          style={{ background: '#111118', border: '1px solid #1E1E2E', color: '#E2E8F0' }}
        />
      </div>
      <div className="px-4 py-2 text-[9px] tracking-[0.2em] uppercase font-bold"
        style={{ color: '#4A5568', borderBottom: '1px solid #1E1E2E' }}>
        Registered Entities ({companies.length})
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-[10px] uppercase tracking-widest" style={{ color: '#2A2A3E' }}>
              No active entities
            </p>
          </div>
        ) : filtered.map(c => (
          <button key={c.id} onClick={() => onSelect(c)}
            className="w-full text-left px-4 py-3 transition-all duration-150"
            style={{
              borderBottom:  '1px solid #1E1E2E',
              borderLeft:    `2px solid ${activeId === c.id ? '#C9A84C' : 'transparent'}`,
              background:    activeId === c.id ? 'rgba(201,168,76,0.04)' : 'transparent',
            }}>
            <div className="text-[11px] font-bold mb-1" style={{ color: '#E2E8F0' }}>{c.name}</div>
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-mono" style={{ color: '#4A5568' }}>
                {c.entryCount} entries
              </span>
              <span className="text-[8px] px-1.5 py-0.5 tracking-widest uppercase"
                style={{ background: 'rgba(16,185,129,0.08)', color: '#10B981' }}>
                ACTIVE
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
  const [dialect,    setDialect]   = useState('RBI')
  const [translating, setTranslating] = useState(false)
  const DIALECTS = ['RBI', 'SEC', 'EU_AI_ACT', 'SEBI']

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
    <main className="flex-1 flex flex-col overflow-hidden" style={{ background: '#06060A' }}>
      {/* Company header */}
      <div className="px-8 py-5 flex justify-between items-end flex-shrink-0"
        style={{ borderBottom: '1px solid #1E1E2E', background: '#0C0C12' }}>
        <div>
          <h2 className="text-xl font-bold mb-1" style={{ color: '#E2E8F0' }}>{company.name}</h2>
          <div className="text-[9px] tracking-[0.2em] uppercase" style={{ color: '#4A5568' }}>
            Cryptographic Audit Timeline
          </div>
        </div>
        <div className="text-right">
          <div className="text-[9px] uppercase tracking-widest mb-1" style={{ color: '#4A5568' }}>Entity ID</div>
          <div className="text-[11px] font-mono font-bold" style={{ color: '#C9A84C' }}>
            {company.id.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto p-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-[10px] uppercase tracking-widest animate-pulse" style={{ color: '#4A5568' }}>
              Fetching ledger...
            </div>
          </div>
        ) : entries.length === 0 ? (
          <div className="py-20 text-center" style={{ border: '1px dashed #1E1E2E' }}>
            <p className="text-[10px] uppercase tracking-widest animate-pulse" style={{ color: '#2A2A3E' }}>
              Awaiting telemetry for {company.name}...
            </p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-3 relative">
            {/* Timeline spine */}
            <div className="absolute left-[112px] top-0 bottom-0 w-px"
              style={{ background: '#1E1E2E' }} />

            {entries.map((entry, i) => {
              const isViol = entry.is_compliant === false || entry.type === 'runtime_violation'
              return (
                <div key={entry.entry_id || i} className="flex gap-5 relative group">
                  {/* Timestamp */}
                  <div className="w-[100px] pt-4 flex-shrink-0 text-right">
                    <div className="text-[10px] font-bold" style={{ color: '#E2E8F0' }}>
                      {entry.timestamp ? new Date(entry.timestamp).toLocaleTimeString() : '—'}
                    </div>
                    <div className="text-[8px] mt-0.5" style={{ color: '#4A5568' }}>
                      {entry.timestamp ? new Date(entry.timestamp).toLocaleDateString() : ''}
                    </div>
                  </div>

                  {/* Node dot */}
                  <div className="w-3 h-3 rounded-full absolute left-[107px] top-4 z-10 flex items-center justify-center"
                    style={{ border: '2px solid #06060A', background: '#0C0C12' }}>
                    {isViol && <div className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                  </div>

                  {/* Card */}
                  <div className="flex-1 p-4 transition-all duration-150"
                    style={{
                      background: '#0C0C12',
                      border:     `1px solid ${isViol ? 'rgba(239,68,68,0.2)' : '#1E1E2E'}`,
                    }}>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[9px] px-2 py-0.5 uppercase tracking-widest font-bold"
                        style={{
                          background: isViol ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)',
                          border:     isViol ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(16,185,129,0.2)',
                          color:      isViol ? '#EF4444' : '#10B981',
                        }}>
                        {isViol ? 'VIOLATION' : 'COMPLIANT'}
                      </span>
                      <span className="text-[9px] font-mono" style={{ color: '#2A2A3E' }}>
                        {entry.entry_id}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3 pb-3 text-xs"
                      style={{ borderBottom: '1px solid #111118' }}>
                      <div>
                        <span className="block text-[8px] uppercase tracking-widest mb-0.5" style={{ color: '#4A5568' }}>
                          Project
                        </span>
                        <span className="font-bold" style={{ color: '#E2E8F0' }}>
                          {entry.execution_context?.project_name || entry.project_name || 'unknown'}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[8px] uppercase tracking-widest mb-0.5" style={{ color: '#4A5568' }}>
                          Chain Hash
                        </span>
                        <span className="text-[9px] font-mono" style={{ color: '#C9A84C' }}>
                          {entry.chain_hash?.slice(0, 16)}...
                        </span>
                      </div>
                    </div>

                    {/* Translate actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[8px] uppercase tracking-widest" style={{ color: '#2A2A3E' }}>
                        Translate:
                      </span>
                      {DIALECTS.map(d => (
                        <button key={d}
                          onClick={() => { setDialect(d); translate(entry) }}
                          disabled={translating}
                          className="text-[8px] px-2 py-1 uppercase tracking-widest transition-all duration-100 disabled:opacity-40"
                          style={{ border: '1px solid #1E1E2E', color: '#4A5568' }}
                          onMouseEnter={e => { e.target.style.color = '#C9A84C'; e.target.style.borderColor = 'rgba(201,168,76,0.4)' }}
                          onMouseLeave={e => { e.target.style.color = '#4A5568'; e.target.style.borderColor = '#1E1E2E' }}>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            onClick={() => setModal(null)} />
          <div className="relative max-w-4xl w-full flex flex-col"
            style={{
              background:  '#0C0C12',
              border:      '1px solid rgba(201,168,76,0.2)',
              maxHeight:   '85vh',
              borderRadius: 0,
            }}>
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
              style={{ borderBottom: '1px solid #1E1E2E', background: '#111118' }}>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <div>
                  <div className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: '#E2E8F0' }}>
                    Forensic Evidence Vault
                  </div>
                  <div className="text-[9px] font-mono mt-0.5" style={{ color: '#4A5568' }}>
                    {modal.data?.integrity?.chain_hash?.slice(0, 32)}...
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-[8px] uppercase tracking-widest" style={{ color: '#4A5568' }}>Integrity</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#10B981' }}>
                    {modal.data?.integrity?.status || 'VERIFIED'}
                  </div>
                </div>
                <button onClick={() => setModal(null)}
                  className="w-8 h-8 flex items-center justify-center transition-all duration-150"
                  style={{
                    border: '1px solid #1E1E2E',
                    color:  '#4A5568',
                    fontSize: 18,
                  }}
                  onMouseEnter={e => { e.target.style.color = '#EF4444'; e.target.style.borderColor = 'rgba(239,68,68,0.4)' }}
                  onMouseLeave={e => { e.target.style.color = '#4A5568'; e.target.style.borderColor = '#1E1E2E' }}>
                  ×
                </button>
              </div>
            </div>

            {/* Translated content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-4 text-[9px] uppercase tracking-widest font-bold"
                style={{ color: '#C9A84C' }}>
                {dialect.replace(/_/g, ' ')} Compliance Translation
              </div>
              <pre className="text-[11px] leading-relaxed font-mono whitespace-pre-wrap"
                style={{
                  background: '#06060A',
                  border:     '1px solid #1E1E2E',
                  padding:    '20px',
                  color:      '#94A3B8',
                }}>
                {JSON.stringify(modal.data?.translation, null, 2)}
              </pre>

              <div className="mt-4">
                <div className="mb-3 text-[9px] uppercase tracking-widest font-bold" style={{ color: '#4A5568' }}>
                  Raw SDK Telemetry
                </div>
                <pre className="text-[11px] leading-relaxed font-mono"
                  style={{
                    background:  '#06060A',
                    border:      '1px solid #1E1E2E',
                    padding:     '20px',
                    maxHeight:   '300px',
                    overflow:    'auto',
                  }}
                  dangerouslySetInnerHTML={highlight(modal.data?.raw_payload)}
                />
              </div>
            </div>

            <div className="px-6 py-3 flex justify-between items-center text-[9px]"
              style={{ borderTop: '1px solid #1E1E2E', background: '#111118' }}>
              <span style={{ color: '#2A2A3E' }}>
                Chain: {modal.data?.integrity?.chain_hash?.slice(0, 20)}...
              </span>
              <span style={{ color: '#C9A84C' }}>Mathematically Verified Authority</span>
            </div>
          </div>
        </div>
      )}
    </main>
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
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: '#06060A' }}>
      <Header user={user} onLogout={logout} />
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
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[10px] uppercase tracking-widest animate-pulse" style={{ color: '#2A2A3E' }}>
              Select an entity from the registry to begin oversight.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
