import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { endpoints } from '../lib/api';

export default function LiveNOC() {
  const { token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState('OFFLINE');
  const scrollRef = useRef(null);
  const ws = useRef(null);

  useEffect(() => {
    const connect = () => {
      setStatus('CONNECTING...');
      // Reusing the GLOBAL_SYSTEM listener for the Root Admin
      const url = endpoints.wsFleet('GLOBAL_SYSTEM', token);
      ws.current = new WebSocket(url);

      ws.current.onopen = () => setStatus('ONLINE');
      ws.current.onclose = () => {
        setStatus('OFFLINE');
        setTimeout(connect, 5000); // Reconnect loop
      };
      ws.current.onmessage = (e) => {
        const msg = JSON.parse(e.data);
        setLogs(prev => [msg, ...prev].slice(0, 50));
      };
    };

    connect();
    return () => ws.current?.close();
  }, [token]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [logs]);

  return (
    <div className="h-full flex flex-col bg-[#030305] p-10 gap-10">
      
      {/* --- NOC Header --- */}
      <div className="flex items-center justify-between border-b border-[#161B22] pb-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className={`w-3 h-3 rounded-full ${status === 'ONLINE' ? 'bg-cyan-400' : 'bg-red-500'} animate-pulse`} />
            <div className={`absolute inset-0 w-3 h-3 rounded-full ${status === 'ONLINE' ? 'bg-cyan-400/30' : 'bg-red-500/30'} animate-ping`} />
          </div>
          <div className="flex flex-col">
            <h2 className="text-xs font-bold tracking-[0.5em] uppercase text-[#F0F6FC]">Matrix_Telemetry // GLOBAL_GRID</h2>
            <span className="text-[10px] font-mono text-cyan-400/50 mt-1">STATUS: {status} // AUTH: MASTER_ADMIN</span>
          </div>
        </div>
        <div className="flex gap-10">
          <div className="flex flex-col items-end">
            <span className="text-[8px] text-[#484F58] uppercase tracking-[0.2em]">Active Nodes</span>
            <span className="text-sm font-bold text-white tracking-widest">43/43</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[8px] text-[#484F58] uppercase tracking-[0.2em]">Threat Level</span>
            <span className="text-sm font-bold text-amber-500 tracking-widest">ELEVATED</span>
          </div>
        </div>
      </div>

      {/* --- Main Operational Stream --- */}
      <div className="flex-1 border border-[#161B22] bg-[#08090C] flex flex-col overflow-hidden relative group">
        
        {/* Decorative HUD Elements */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-400/40" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-400/40" />
        
        <div className="h-10 px-6 border-b border-[#161B22] bg-[#0E1015] flex items-center">
          <span className="text-[9px] font-mono text-[#484F58] tracking-[0.3em] uppercase">SECURE TELEMETRY FEED // ENCRYPTED_CHANNEL_AES-256</span>
        </div>

        <div className="flex-1 overflow-y-auto p-6 font-mono space-y-4" ref={scrollRef}>
          {logs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-20">
              <div className="text-[10px] text-cyan-400 tracking-[0.5em] uppercase animate-pulse">Scanning Mesh Frequency...</div>
              <div className="text-[9px] text-[#484F58] max-w-xs text-center">Awaiting initial handshake pulses from the regional enterprise spokes.</div>
            </div>
          ) : logs.map((log, i) => (
            <div key={i} className="flex gap-6 text-[11px] animate-slide-up p-5 bg-[#0D1117]/50 border-l-2 border-cyan-400 hover:bg-cyan-400/[0.03] transition-colors">
              <span className="text-cyan-900 shrink-0 font-bold">({new Date(log.timestamp).toLocaleTimeString()})</span>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <span className={`font-bold uppercase tracking-[0.2em] ${log.type === 'VIOLATION_ALERT' ? 'text-red-500' : 'text-cyan-400'}`}>
                    {log.type}
                  </span>
                  <span className="text-[#484F58] text-[9px] font-mono">NODE_HASH: {log.chain_hash?.slice(2, 10)}</span>
                </div>
                <div className="text-[#8B949E] text-[10px] mb-3 leading-relaxed">
                  ENTITY_SIGNATURE: <span className="text-white">{log.project}</span> 
                  <span className="mx-3 opacity-20">|</span> 
                  LAYER: <span className="text-white">RUNTIME_GOVERNANCE</span>
                </div>
                {log.violations && log.violations.length > 0 && (
                  <div className="bg-red-500/5 border border-red-500/20 p-3 mt-2">
                    {log.violations.map((v, j) => (
                      <div key={j} className="text-red-400 text-[10px] flex gap-2 font-bold">
                        <span className="opacity-50">!</span> 
                        <span>BREACH_DETECTED: {v.message}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Visual Seed Logs for Aesthetic Baseline */}
          {logs.length > 0 && (
            <div className="text-[#2A2A3E] text-[9px] opacity-40 pt-10 border-t border-[#161B22] mt-10 italic">
              --- GLOBAL SYSTEM LOG TAIL ---<br/>
              [BOOT] ANCHOR V5.0 MASTER NODE ONLINE // CLEARANCE: ROOT<br/>
              [AUTH] SECURE CHANNEL ESTABLISHED WITH CLOUD-GATEWAY-1<br/>
              [GRID] MAPPING REGULATORY STATUTES TO ACTIVE TELEMETRY STREAMS
            </div>
          )}
        </div>
      </div>

      {/* --- NOC Status Footer --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Global Compliance', value: '98.4%', color: 'text-green-500' },
          { label: 'Active Remediations', value: '12', color: 'text-amber-500' },
          { label: 'Auditor Sessions', value: '06', color: 'text-cyan-400' },
          { label: 'Grid Latency', value: '14ms', color: 'text-cyan-900' }
        ].map((stat, i) => (
          <div key={i} className="border border-[#161B22] bg-[#0E1015] p-5 flex flex-col gap-1">
            <span className="text-[8px] text-[#484F58] uppercase tracking-[0.3em] font-bold">{stat.label}</span>
            <span className={`text-sm font-bold tracking-widest ${stat.color}`}>{stat.value}</span>
          </div>
        ))}
      </div>

    </div>
  );
}
