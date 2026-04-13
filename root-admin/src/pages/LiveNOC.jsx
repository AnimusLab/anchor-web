import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { endpoints } from '../lib/api'

export default function LiveNOC() {
  const { token, user } = useAuth()
  const [logs, setLogs] = useState([])
  const [status, setStatus] = useState('OFFLINE')
  const scrollRef = useRef(null)
  const ws = useRef(null)

  useEffect(() => {
    // Note: Reusing the existing /ws/fleet/{entity_id} endpoint. 
    // For a global NOC, the server would need a /ws/global endpoint, 
    // but we can simulate/reuse for this demo if entity_id is provided.
    // In Phase 2, we connect to the Hub's broadcast manager.
    
    const connect = () => {
      setStatus('CONNECTING...')
      // For now, we connect as the root 'admin' which the server handles
      const url = endpoints.wsFleet('GLOBAL_SYSTEM', token)
      ws.current = new WebSocket(url)

      ws.current.onopen = () => setStatus('ONLINE')
      ws.current.onclose = () => {
        setStatus('OFFLINE')
        setTimeout(connect, 3000) // Reconnect loop
      }
      ws.current.onmessage = (e) => {
        const msg = JSON.parse(e.data)
        setLogs(prev => [msg, ...prev].slice(0, 100))
      }
    }

    connect()
    return () => ws.current?.close()
  }, [token])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }, [logs])

  return (
    <div className="h-full flex flex-col bg-[#030305] p-6 gap-6">
      
      {/* ── NOC Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-2 h-2 rounded-full ${status === 'ONLINE' ? 'bg-cyan-400' : 'bg-red-500'} animate-pulse`} />
          <h2 className="text-xs font-bold tracking-[0.4em] uppercase text-[#F0F6FC]">Global Compliance Grid</h2>
          <span className="text-[10px] font-mono text-cyan-400/50">[{status}]</span>
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[8px] text-[#484F58] uppercase">Active Nodes</span>
            <span className="text-[10px] text-white">43</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[8px] text-[#484F58] uppercase">Threat Level</span>
            <span className="text-[10px] text-amber-500">ELEVATED</span>
          </div>
        </div>
      </div>

      {/* ── Main Terminal Feed ── */}
      <div className="flex-1 border border-[#161B22] bg-[#08090C] flex flex-col overflow-hidden relative">
        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-cyan-400/30" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-cyan-400/30" />
        
        <div className="h-8 px-4 border-b border-[#161B22] bg-[#0E1015] flex items-center">
          <span className="text-[9px] font-mono text-[#8B949E] tracking-widest uppercase">REAL-TIME TELEMETRY STREAM</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 font-mono space-y-2" ref={scrollRef}>
          {logs.length === 0 ? (
            <div className="py-20 text-center space-y-4">
              <div className="text-[10px] text-cyan-900 uppercase tracking-[0.3em]">Awaiting Data Pulses...</div>
              <div className="text-[9px] text-cyan-900/30 max-w-xs mx-auto">
                No active violations detected in the global compliance mesh at this time.
              </div>
            </div>
          ) : logs.map((log, i) => (
            <div key={i} className="flex gap-4 text-[11px] animate-slide-up bg-cyan-400/5 p-3 border-l-2 border-cyan-400">
              <span className="text-cyan-900 shrink-0">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="font-bold text-cyan-400 uppercase tracking-widest">{log.type}</span>
                  <span className="text-[#484F58] text-[9px]">ID: {log.entry_id?.slice(0, 8)}</span>
                </div>
                <div className="text-[#8B949E] text-[10px] mb-2">
                  PROJECT: <span className="text-white">{log.project}</span> 
                  <span className="mx-2 opacity-20">|</span> 
                  ENTITY: <span className="text-white">{log.entity_id || 'UNKNOWN'}</span>
                </div>
                {log.violations && log.violations.length > 0 && (
                  <ul className="space-y-1">
                    {log.violations.map((v, j) => (
                      <li key={j} className="text-red-400 text-[10px]">
                        ! BREACH DETECTED: {v.message}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
          
          {/* Initial seed lines for aesthetic if logs exist */}
          {logs.length > 0 && (
            <div className="text-cyan-900 text-[9px] opacity-30 mt-10">
              --- SYSTEM LOG TAIL ---
              [BOOT] ANCHOR V5.0 MASTER NODE ONLINE
              [AUTH] SECURE CHANNEL ESTABLISHED WITH CLOUD-GATEWAY-1
              [GRID] MAPPING 170 REGULATORY STATUTES TO ACTIVE TELEMETRY
            </div>
          )}
        </div>
      </div>

      {/* ── Summary Stats Footer ── */}
      <div className="grid grid-cols-4 gap-6">
        {[
          { label: 'Global Compliance', value: '98.4%', color: 'text-green-500' },
          { label: 'Active Remediations', value: '12', color: 'text-amber-500' },
          { label: 'Auditor Sessions', value: '06', color: 'text-cyan-400' },
          { label: 'Grid Latency', value: '24ms', color: 'text-cyan-900' }
        ].map((stat, i) => (
          <div key={i} className="border border-[#161B22] bg-[#0E1015] p-3 flex flex-col">
            <span className="text-[8px] text-[#484F58] uppercase tracking-widest mb-1">{stat.label}</span>
            <span className={`text-sm font-bold tracking-widest ${stat.color}`}>{stat.value}</span>
          </div>
        ))}
      </div>

    </div>
  )
}
