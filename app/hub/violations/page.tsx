"use client";

import React, { useEffect, useState } from 'react';

interface Violation {
  rule_id: string;
  statute?: string;
  severity?: string;
  trace_uri?: string;
  summary?: string;
  message?: string;
}

interface TelemetryEvent {
  id: string;
  siloId: string;
  projectName: string;
  riskScore: number;
  identityFingerprint: string;
  createdAt: string;
  violations: Violation[];
}

export default function HubViolationsPage() {
  const [events, setEvents] = useState<TelemetryEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchViolations = async () => {
    try {
      const response = await fetch('/api/v1/hub/violations');
      const data = await response.json();
      if (data.events) {
        setEvents(data.events);
      }
    } catch (error) {
      console.error("Error streaming compliance matrices:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchViolations();
    // Establish a 5-second polling interval to mimic live P2P stream telemetry
    const interval = setInterval(fetchViolations, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 max-w-6xl mx-auto relative z-10 font-mono text-xs">
      {/* Dynamic Terminal Header */}
      <div className="pure-glass-card rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-white/10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-rose-500 to-transparent" />
        <h1 className="text-xl font-bold tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-2">
          ⚠️ REAL-TIME GOVERNANCE VIOLATION FEED
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Silo Interface Connection: Operational | Active Telemetry Interceptors: Enforced
        </p>
      </div>

      {loading ? (
        <div className="text-xs text-slate-500 dark:text-slate-400 animate-pulse p-4">Streaming database records...</div>
      ) : events.length === 0 ? (
        <div className="pure-glass-card rounded-2xl p-12 text-center text-xs text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10">
          🛡️ SYSTEM INVARIANTS SECURED. NO ACTIVE COMPLIANCE BREACHES LOGGED.
        </div>
      ) : (
        <div className="space-y-6">
          {events.map((event) => (
            <div key={event.id} className="pure-glass-card rounded-2xl p-6 relative group border border-rose-500/30 dark:border-rose-500/40 hover:border-rose-500/60 transition-all duration-300 shadow-sm">
              {/* Event Metadata Banner */}
              <div className="flex flex-wrap items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4 mb-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400">SILO_ID:</span> <span className="text-slate-900 dark:text-white font-bold">{event.siloId}</span>
                  <span className="text-slate-500 dark:text-slate-400 ml-4">PROJECT:</span> <span className="text-slate-900 dark:text-white font-bold">{event.projectName}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 font-bold">
                    RISK MULTIPLIER: {event.riskScore.toFixed(1)} / 10.0
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {new Date(event.createdAt).toISOString()}
                  </span>
                </div>
              </div>

              {/* Unpacked Violations Array */}
              <div className="space-y-4">
                {event.violations.map((violation, index) => (
                  <div key={index} className="bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl p-4">
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                      <span className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-2 py-0.5 rounded-md font-bold">
                        [{violation.rule_id}] {violation.statute || "Statutory Gate Invariant"}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 select-all font-mono">
                        NODE_FP: {event.identityFingerprint.substring(0, 32)}...
                      </span>
                    </div>
                    
                    <p className="text-xs text-slate-800 dark:text-slate-200 mb-2 font-mono">
                      {violation.summary || violation.message || "Deterministic rule violation flagged at runtime."}
                    </p>

                    <div className="text-xs mt-2">
                      <a 
                        href={`https://animuslab.dev/rules/${violation.rule_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 font-medium"
                      >
                        👉 View Mitigation Blueprint & Statutory Framework Documentation
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              {/* Immutable Operational Seal Sign-Off */}
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                <span>TRANSACTION_HASH: sha256:{event.id.substring(0, 16)}...</span>
                <span className="flex items-center gap-1 text-sky-600 dark:text-sky-400 font-semibold">
                  🛡️ Certified & Signed by AnimusLab System Kernel
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
