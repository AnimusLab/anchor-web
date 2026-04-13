import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { API_BASE, endpoints } from './lib/api';

// --- UTILITY: A lightweight RegExp parser to colorize JSON for the Terminal UI ---
const syntaxHighlightJSON = (jsonObj) => {
    if (!jsonObj) return '';
    const jsonStr = JSON.stringify(jsonObj, null, 2);
    
    const highlighted = jsonStr.replace(
        /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
        (match) => {
            let color = 'text-emerald-400'; // Default string value
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    color = 'text-slate-400'; // Key
                }
            } else if (/true|false/.test(match)) {
                color = match === 'true' ? 'text-emerald-500' : 'text-rose-500'; // Booleans
            } else if (/null/.test(match)) {
                color = 'text-rose-400/50'; // Null
            } else {
                color = 'text-cyan-400'; // Numbers
            }
            return `<span class="${color}">${match}</span>`;
        }
    );
    
    return { __html: highlighted };
};

export default function RegulatorPortal() {
  const { user, token, logout } = useAuth();

  // Dashboard State
  const [activeCompany, setActiveCompany] = useState(null);
  const [companies, setCompanies] = useState([]);

  // Ledger Data
  const [ledger, setLedger] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [translationModal, setTranslationModal] = useState({ isOpen: false, data: null, dialect: 'RBI', entryId: null });
  const [isTranslating, setIsTranslating] = useState(false);
  const [modalTab, setModalTab] = useState('compliance');

  // Phase 18: Sovereign Relay State
  const [isRelayFetching, setIsRelayFetching] = useState(false);
  const [relayData, setRelayData] = useState(null);
  const [relayError, setRelayError] = useState(null);

  // --- Fetch the entity registry (all fleets the regulator can inspect) ---
  useEffect(() => {
    const fetchFleets = async () => {
      try {
        // Admin/regulator global stats returns active_projects count;
        // Use the ledger endpoint with no entity filter to find unique entities
        const res = await fetch(endpoints.ledger(), {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.status === 401) { logout(); return; }
        const data = await res.json();
        // Extract unique entity_ids from the ledger
        const entityMap = {};
        data.forEach(entry => {
          const eid = entry.entity_id;
          if (eid && !entityMap[eid]) {
            entityMap[eid] = {
              id: eid,
              name: eid,
              sector: 'Regulated Entity',
              status: 'ACTIVE_OVERSIGHT',
              entryCount: 0
            };
          }
          if (eid) entityMap[eid].entryCount++;
        });
        const fleetList = Object.values(entityMap);
        setCompanies(fleetList);
        if (fleetList.length > 0 && !activeCompany) {
          setActiveCompany(fleetList[0]);
        }
      } catch (err) {
        console.error("FLEET REGISTRY FETCH FAILURE:", err);
      }
    };
    fetchFleets();
  }, [token]);

  // --- Fetch ledger for the selected company ---
  useEffect(() => {
    if (activeCompany) {
      fetchLedger();
    }
  }, [activeCompany]);

  const fetchLedger = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(endpoints.ledger(activeCompany.id), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 401) { logout(); return; }
      const data = await response.json();
      setLedger(data);
    } catch (error) {
      console.error("LEDGER FETCH FAILURE:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const translateEntry = async (entryId, entityId, dialect) => {
    setIsTranslating(true);
    setRelayData(null);
    setRelayError(null);
    try {
      const url = `${API_BASE}/api/audit/${entityId}/entry/${entryId}?dialect=${dialect}`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 401) { logout(); return; }
      const translated = await response.json();
      setModalTab('compliance');
      setTranslationModal({ isOpen: true, data: translated, dialect, entryId });
    } catch (error) {
      console.error("DIALECT TRANSLATION FAILURE:", error);
    } finally {
      setIsTranslating(false);
    }
  };

  // Phase 18: Request raw forensic payload from the Enterprise Spoke via the Hub relay
  const requestForensicRelay = async () => {
    if (!translationModal.entryId || !activeCompany?.id) return;
    setIsRelayFetching(true);
    setRelayData(null);
    setRelayError(null);
    try {
      const response = await fetch(endpoints.forensicRelay, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          entry_id: translationModal.entryId,
          entity_id: activeCompany.id,
        })
      });
      if (response.status === 401) { logout(); return; }
      const result = await response.json();
      if (result.status === 'FORENSIC_RETRIEVED') {
        setRelayData(result.data);
      } else {
        setRelayError('Hub returned an unexpected response.');
      }
    } catch (err) {
      setRelayError(`Relay failed: ${err.message}`);
    } finally {
      setIsRelayFetching(false);
    }
  };

  // --- The Main Regulator Dashboard ---
  return (
    <div className="min-h-screen bg-[#08080D] font-mono text-slate-300 flex flex-col h-screen overflow-hidden">
      
      {/* Official Header */}
      <header className="h-14 border-b border-[#2A2A3A] bg-[#0D0D14] flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-3 h-3 bg-amber-500"></div>
          <span className="text-sm font-bold text-white tracking-widest uppercase">Oversight Ledger</span>
          <span className="text-[10px] text-amber-500 border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 tracking-widest uppercase">
            Authority: {user?.display_name || 'VERIFIED'}
          </span>
          {user?.status === 'pending' && (
            <span className="text-[10px] text-rose-400 border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 tracking-widest uppercase animate-pulse">
              TEMP ACCESS — PENDING ADMIN APPROVAL
            </span>
          )}
        </div>
        <div className="flex items-center gap-6">
          <span className="text-[10px] text-slate-500 tracking-widest uppercase">Session Logging Active</span>
          <span className="text-[10px] text-slate-600 font-mono">{user?.entity_id}</span>
          <button onClick={logout} className="text-[10px] text-slate-400 hover:text-white transition-colors uppercase tracking-widest border border-[#2A2A3A] px-3 py-1">
            Terminate Session
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar: Company Directory */}
        <aside className="w-80 border-r border-[#2A2A3A] bg-[#0D0D14] flex flex-col">
          <div className="p-4 border-b border-[#2A2A3A]">
            <input 
              type="text" 
              placeholder="Search entity registry..." 
              className="w-full bg-[#121219] border border-[#2A2A3A] px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 py-3 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              Registered Entities ({companies.length})
            </div>
            {companies.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-[10px] text-slate-600 uppercase tracking-widest">No fleet telemetry ingested yet.</p>
                <p className="text-[10px] text-slate-700 mt-1">Entities will appear here once they connect the Anchor SDK.</p>
              </div>
            ) : (
              companies.map(company => (
                <button 
                  key={company.id}
                  onClick={() => setActiveCompany(company)}
                  className={`w-full text-left px-4 py-4 border-b border-[#2A2A3A] transition-colors ${activeCompany?.id === company.id ? 'bg-[#121219] border-l-2 border-l-amber-500' : 'hover:bg-[#121219]/50 border-l-2 border-l-transparent'}`}
                >
                  <div className="text-sm font-bold text-slate-200 mb-1">{company.name}</div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-500">{company.entryCount} ledger entries</span>
                    <span className="text-[9px] px-1.5 py-0.5 uppercase tracking-wider bg-emerald-500/10 text-emerald-400">
                      {company.status}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Right Main Area: The Chronological Ledger */}
        <main className="flex-1 bg-[#08080D] flex flex-col relative">
          
          {activeCompany ? (
            <>
              {/* Company Header */}
              <div className="px-8 py-6 border-b border-[#2A2A3A] bg-[#0D0D14] flex justify-between items-end flex-shrink-0">
                <div>
                  <h2 className="text-2xl font-serif text-white mb-2">{activeCompany.name}</h2>
                  <div className="text-xs text-slate-500 font-mono tracking-widest uppercase">Cryptographic Audit Timeline</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Entity ID</div>
                  <div className="text-sm font-mono text-amber-500/70">{activeCompany.id.toUpperCase()}</div>
                </div>
              </div>

              {/* The Timeline Feed */}
              <div className="flex-1 overflow-y-auto p-8 relative">
                
                {isLoading && (
                  <div className="absolute inset-x-0 top-0 h-1 bg-amber-500/20 overflow-hidden">
                    <div className="w-1/2 h-full bg-amber-500 animate-[barGrow_1.5s_infinite_linear]"></div>
                  </div>
                )}

                <div className="max-w-4xl mx-auto space-y-4 relative">
                  {/* Vertical Timeline Line */}
                  <div className="absolute left-[130px] top-0 bottom-0 w-px bg-[#2A2A3A]"></div>

                  {ledger.length === 0 && !isLoading ? (
                    <div className="py-20 text-center border border-dashed border-[#2A2A3A] bg-[#0D0D14]/30 rounded-lg">
                      <p className="text-[10px] text-slate-600 uppercase tracking-widest animate-pulse">Awaiting federated telemetry for {activeCompany.name}...</p>
                    </div>
                  ) : (
                    ledger.map((entry, index) => {
                      const isViolation = entry.type === 'runtime_violation';
                      const isSpokeRelay = entry._spoke_relay === true ||
                        (entry.payload && typeof entry.payload === 'object' && entry.payload._spoke_relay);

                      return (
                        <div key={entry.entry_id || entry.id || index} className="flex gap-6 relative group">

                          {/* Timestamp Col */}
                          <div className="w-[120px] pt-4 flex-shrink-0 text-right">
                            <div className="text-[11px] text-slate-300 font-bold">{entry.timestamp ? new Date(entry.timestamp).toLocaleTimeString() : '—'}</div>
                            <div className="text-[9px] text-slate-500 mt-1">{entry.timestamp ? new Date(entry.timestamp).toLocaleDateString() : ''}</div>
                          </div>

                          {/* Node */}
                          <div className="w-4 h-4 rounded-full border-2 border-[#08080D] absolute left-[122px] top-4 z-10 bg-[#0D0D14] group-hover:border-amber-500 transition-colors flex items-center justify-center">
                             {isViolation && <div className="w-1.5 h-1.5 bg-rose-500 rounded-full"></div>}
                          </div>

                          {/* Content Card */}
                          <div className={`flex-1 p-4 border rounded bg-[#0D0D14] shadow-xl transition-all ${isViolation ? 'border-rose-500/20 hover:border-rose-500/40' : 'border-[#2A2A3A] hover:border-slate-700'}`}>

                            {/* Entry Header */}
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-3">
                                <span className={`text-[10px] px-2 py-0.5 border uppercase tracking-widest font-bold ${isViolation ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-[#121219] border-slate-700 text-slate-400'}`}>
                                  {isViolation ? 'VIOLATION' : 'COMPLIANT'}
                                </span>
                                {/* Phase 18: Spoke Relay Badge */}
                                {isSpokeRelay && (
                                  <span className="text-[9px] px-2 py-0.5 border border-cyan-500/30 bg-cyan-500/5 text-cyan-500/70 uppercase tracking-widest">
                                    SPOKE RELAY
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-600 font-mono">ID: {entry.id || entry.entry_id}</div>
                            </div>

                            {/* Meta Data */}
                            <div className="grid grid-cols-2 gap-4 mb-3 text-xs border-b border-[#2A2A3A] pb-3">
                              <div>
                                <span className="text-[9px] text-slate-500 uppercase tracking-widest block mb-1">Project Context</span>
                                <span className="text-white font-bold">{entry.execution_context?.project_name || 'unknown'}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-500 uppercase tracking-widest block mb-1">Chain Hash</span>
                                <span className="text-amber-500/80 font-mono text-[9px]">{entry.cryptography?.chain_hash?.slice(0, 16)}...</span>
                              </div>
                            </div>

                            {/* Violation Details */}
                            {entry.violations?.length > 0 && (
                              <div className="mb-3 p-2 bg-rose-500/5 border border-rose-500/10 rounded">
                                {entry.violations.map((v, vi) => (
                                  <div key={vi} className="text-[10px] text-rose-400 mb-1">
                                    {v.rule_id || v.rule}: {v.message || v.description}
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Translate Actions */}
                            <div className="flex flex-wrap gap-2 items-center">
                              <span className="text-[9px] text-slate-600 uppercase tracking-widest mr-2">Translate:</span>
                              {['RBI', 'SEC', 'EU_AI_ACT', 'SEBI'].map(dialect => (
                                <button
                                  key={dialect}
                                  onClick={() => translateEntry(entry.id || entry.entry_id, activeCompany.id, dialect)}
                                  disabled={isTranslating}
                                  className="text-[9px] px-2 py-1 bg-[#121219] border border-[#2A2A3A] text-slate-400 hover:text-amber-400 hover:border-amber-500/50 transition-all uppercase tracking-widest disabled:opacity-50"
                                >
                                  {dialect.replace(/_/g, ' ')}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-[10px] text-slate-600 uppercase tracking-widest">Select an entity from the registry to begin oversight.</p>
            </div>
          )}
        </main>
      </div>

      {/* --- ENHANCED FORENSIC EVIDENCE MODAL --- */}
      {translationModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setTranslationModal({ ...translationModal, isOpen: false })}></div>
          <div className="relative max-w-5xl w-full bg-[#0D0D14] border border-amber-500/20 shadow-[0_0_80px_rgba(0,0,0,0.5)] flex flex-col h-[85vh] rounded-lg overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-[#2A2A3A] flex justify-between items-center bg-[#121219]">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full animate-pulse ${translationModal.data?.integrity?.status === 'VERIFIED' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-rose-500'}`}></div>
                <div>
                  <h3 className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Forensic Evidence Vault</h3>
                  <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                    Entry ID: <span className="text-amber-500/70">{translationModal.data?.integrity?.chain_hash?.slice(0, 32)}...</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-[9px] text-slate-500 uppercase tracking-widest">Integrity Status</div>
                  <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                    {translationModal.data?.integrity?.status || 'VERIFYING...'}
                  </div>
                </div>
                <button 
                  onClick={() => setTranslationModal({ ...translationModal, isOpen: false })} 
                  className="w-8 h-8 rounded-full flex items-center justify-center border border-[#2A2A3A] text-slate-500 hover:text-white hover:bg-rose-500/10 hover:border-rose-500/30 transition-all"
                >
                  <span className="text-xl">×</span>
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-[#2A2A3A] bg-[#0D0D14]">
              <button 
                onClick={() => setModalTab('compliance')}
                className={`px-8 py-3 text-[10px] uppercase tracking-[0.15em] font-bold transition-all border-r border-[#2A2A3A] ${modalTab === 'compliance' ? 'bg-[#121219] text-amber-500 border-b-2 border-b-amber-500' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Legal Compliance ({translationModal.dialect})
              </button>
              <button 
                onClick={() => setModalTab('forensic')}
                className={`px-8 py-3 text-[10px] uppercase tracking-[0.15em] font-bold transition-all border-r border-[#2A2A3A] ${modalTab === 'forensic' ? 'bg-[#121219] text-cyan-400 border-b-2 border-b-cyan-500' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Raw SDK Telemetry
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden flex bg-[#08080D]">
              {modalTab === 'compliance' ? (
                <div className="flex-1 p-8 overflow-y-auto">
                  <div className="max-w-2xl mx-auto">
                    <div className="mb-8 border-l-2 border-amber-500 pl-6 py-2">
                      <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Regulatory Interpretation</div>
                      <h4 className="text-lg text-slate-200 font-serif leading-relaxed">
                        Findings aligned with {translationModal.data?.translation?.framework || 'Standard Framework'} protocol.
                      </h4>
                    </div>
                    
                    <div className="space-y-6">
                       <pre className="text-[12px] text-slate-300 font-mono leading-relaxed bg-[#0D0D14] p-6 border border-[#2A2A3A] whitespace-pre-wrap rounded">
                         {JSON.stringify(translationModal.data?.translation, null, 2)}
                       </pre>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 p-8 overflow-y-auto">
                  <div className="max-w-4xl mx-auto bg-[#050508] border border-[#1E293B] shadow-inner">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-[#1E293B] bg-[#0A0A0F]">
                       <span className="text-[9px] text-slate-500 uppercase tracking-widest">Source Telemetry: encrypted_at_rest</span>
                       <span className="text-[9px] text-cyan-500/50 font-mono uppercase">Read-Only Forensic View</span>
                    </div>

                    {/* Phase 18: Three-State Relay UX */}
                    {
                      // State 1: Raw payload already in Hub (pre-Phase 18 entries)
                      translationModal.data?.raw_payload && !translationModal.data?.raw_payload?._spoke_relay ? (
                        <pre
                          className="p-6 text-[11px] leading-relaxed overflow-auto font-mono max-h-[60vh] scrollbar-thin scrollbar-thumb-slate-800"
                          dangerouslySetInnerHTML={syntaxHighlightJSON(translationModal.data?.raw_payload)}
                        />
                      ) : relayData ? (
                        // State 3: Relay completed — show decrypted payload
                        <div>
                          <div className="px-4 py-2 bg-emerald-500/10 border-b border-emerald-500/20 flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                            <span className="text-[9px] text-emerald-400 uppercase tracking-widest font-bold">RELAY COMPLETE — DATA RETRIEVED FROM ENTERPRISE SPOKE</span>
                          </div>
                          <pre
                            className="p-6 text-[11px] leading-relaxed overflow-auto font-mono max-h-[55vh] scrollbar-thin scrollbar-thumb-slate-800"
                            dangerouslySetInnerHTML={syntaxHighlightJSON(relayData)}
                          />
                        </div>
                      ) : isRelayFetching ? (
                        // State 2a: Relay in progress
                        <div className="flex flex-col items-center justify-center py-20 gap-6">
                          <div className="relative">
                            <div className="h-12 w-12 border-t-2 border-cyan-400 rounded-full animate-spin"></div>
                            <div className="h-12 w-12 border-b-2 border-amber-500/40 rounded-full animate-spin absolute inset-0" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
                          </div>
                          <div className="text-center space-y-2">
                            <div className="text-[11px] text-cyan-400 uppercase tracking-[0.25em] font-bold animate-pulse">RELAY FETCH IN PROGRESS...</div>
                            <div className="text-[9px] text-slate-600 uppercase tracking-widest">Hub → Enterprise Spoke → Decrypting with Vault Key</div>
                          </div>
                          <div className="flex gap-2">
                            {['LOCATING SPOKE', 'SENDING PULL REQUEST', 'DECRYPTING PAYLOAD'].map((step, i) => (
                              <span key={i} className="text-[8px] px-2 py-1 border border-cyan-500/20 bg-cyan-500/5 text-cyan-500/60 uppercase tracking-widest animate-pulse" style={{animationDelay: `${i * 0.3}s`}}>
                                {step}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : relayError ? (
                        // State 2b: Relay failed
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                          <div className="text-rose-400 text-[11px] uppercase tracking-widest">{relayError}</div>
                          <button
                            onClick={requestForensicRelay}
                            className="px-4 py-2 text-[10px] border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-colors uppercase tracking-widest"
                          >
                            Retry Relay
                          </button>
                        </div>
                      ) : (
                        // State 0: Spoke relay required — entry lives on Enterprise node
                        <div className="flex flex-col items-center justify-center py-20 gap-6">
                          <div className="w-16 h-16 border border-cyan-500/30 bg-cyan-500/5 flex items-center justify-center">
                            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
                          </div>
                          <div className="text-center space-y-2">
                            <div className="text-[11px] text-slate-300 uppercase tracking-[0.2em] font-bold">Data Sovereign — Stored on Enterprise Spoke</div>
                            <div className="text-[9px] text-slate-500 max-w-sm text-center leading-relaxed">
                              This entry's raw payload resides on the Enterprise's private node.
                              Anchor will broker a secure relay request on your behalf.
                            </div>
                          </div>
                          <button
                            id="request-forensic-relay-btn"
                            onClick={requestForensicRelay}
                            className="px-8 py-3 text-[10px] border border-cyan-500/50 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500 transition-all uppercase tracking-[0.2em] font-bold"
                          >
                            REQUEST FORENSIC DATA FROM SPOKE →
                          </button>
                          <div className="text-[8px] text-slate-600 uppercase tracking-widest">Request will be logged as an official auditor access event</div>
                        </div>
                      )
                    }
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#2A2A3A] bg-[#121219] flex justify-between items-center text-[9px]">
              <div className="flex items-center gap-6">
                <span className="text-slate-600 uppercase tracking-widest">ChainID: 0x4291...af48</span>
                <span className="text-slate-600 uppercase tracking-widest">Node: Primary-Oversight-01</span>
                <span className="text-slate-600 uppercase tracking-widest">Forensic Key: {translationModal.data?.integrity?.signature?.slice(0, 16)}...</span>
              </div>
              <div className="text-amber-500/70 font-bold uppercase tracking-widest">Mathematically Verified Authority</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}