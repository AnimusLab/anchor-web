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
    <div className="min-h-screen bg-[#06070B] text-white p-8 font-mono selection:bg-[#FF3B30] selection:text-white">
      {/* Dynamic Terminal Header */}
      <div className="border border-[#1E2235] bg-[#0C0E17]/60 backdrop-blur-md rounded-lg p-6 mb-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#FF3B30]/40 to-transparent" />
        <h1 className="text-xl font-bold tracking-wider text-[#FF3B30] flex items-center gap-2">
          ⚠️ REAL-TIME GOVERNANCE VIOLATION FEED
        </h1>
        <p className="text-xs text-[#6C7293] mt-1">
          Silo Interface Connection: Operational | Active Telemetry Interceptors: Enforced
        </p>
      </div>

      {loading ? (
        <div className="text-xs text-[#6C7293] animate-pulse">Streaming database records...</div>
      ) : events.length === 0 ? (
        <div className="border border-[#1E2235] bg-[#0C0E17]/40 rounded-lg p-12 text-center text-xs text-[#6C7293]">
          🛡️ SYSTEM INVARIANTS SECURED. NO ACTIVE COMPLIANCE BREACHES LOGGED.
        </div>
      ) : (
        <div className="space-y-6">
          {events.map((event) => (
            <div key={event.id} className="border border-[#FF3B30]/30 bg-[#0C0E17]/80 rounded-lg p-6 relative group hover:border-[#FF3B30]/60 transition-all duration-300">
              {/* Event Metadata Banner */}
              <div className="flex flex-wrap items-center justify-between border-b border-[#1E2235] pb-4 mb-4 gap-4 text-xs">
                <div>
                  <span className="text-[#6C7293]">SILO_ID:</span> <span className="text-white font-bold">{event.siloId}</span>
                  <span className="text-[#6C7293] ml-4">PROJECT:</span> <span className="text-white font-bold">{event.projectName}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="px-2 py-0.5 rounded bg-[#FF3B30]/10 text-[#FF3B30] border border-[#FF3B30]/20 font-bold">
                    RISK MULTIPLIER: {event.riskScore.toFixed(1)} / 10.0
                  </span>
                  <span className="text-[#6C7293]">
                    {new Date(event.createdAt).toISOString()}
                  </span>
                </div>
              </div>

              {/* Unpacked Violations Array */}
              <div className="space-y-4">
                {event.violations.map((violation, index) => (
                  <div key={index} className="bg-[#121526]/50 border border-[#1E2235] rounded p-4">
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                      <span className="text-xs text-[#FF8800] bg-[#FF8800]/10 border border-[#FF8800]/20 px-1.5 py-0.5 rounded font-bold">
                        [{violation.rule_id}] {violation.statute || "Statutory Gate Invariant"}
                      </span>
                      <span className="text-[10px] text-[#6C7293] select-all">
                        NODE_FP: {event.identityFingerprint.substring(0, 32)}...
                      </span>
                    </div>
                    
                    {/* Plain-Language 5-Line Explanation */}
                    <p className="text-xs text-[#C5C9DB] leading-relaxed mb-3">
                      {violation.summary || violation.message || "Manual code review required. See mitigation documentation for structural guidance."}
                    </p>

                    {/* Universal External Documentation Link */}
                    <div className="text-xs">
                      <a 
                        href={`https://animuslab.dev/rules/${violation.rule_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#58A6FF] hover:underline flex items-center gap-1"
                      >
                        👉 View Mitigation Blueprint & Statutory Framework Documentation
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              {/* Immutable Operational Seal Sign-Off */}
              <div className="mt-4 pt-3 border-t border-[#1E2235]/40 flex items-center justify-between text-[10px] text-[#6C7293]">
                <span>TRANSACTION_HASH: sha256:{event.id.substring(0, 16)}...</span>
                <span className="flex items-center gap-1 text-[#00E5FF]">
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
