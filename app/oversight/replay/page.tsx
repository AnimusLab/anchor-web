"use client";

import React, { useState, useEffect } from 'react';

interface SanitizedViolation {
  rule_id: string;
  statute: string;
  severity: string;
  summary: string;
  docs_url: string;
}

interface SanitizedReplay {
  id: string;
  siloId: string;
  projectName: string;
  riskScore: number;
  identityFingerprint: string;
  createdAt: string;
  timeline: SanitizedViolation[];
}

export default function OversightReplayPage() {
  const [targetId, setTargetId] = useState('');
  const [replayData, setReplayData] = useState<SanitizedReplay | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeStep, setActiveStep] = useState(0);

  const triggerForensicAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetId) return;

    setLoading(true);
    setError('');
    setReplayData(null);
    setActiveStep(0);

    try {
      const response = await fetch(`/api/v1/oversight/replay?eventId=${encodeURIComponent(targetId)}`);
      const data = await response.json();
      
      if (response.ok && data.replay) {
        setReplayData(data.replay);
      } else {
        setError(data.error || "Failed to locate matching cryptographic audit entry.");
      }
    } catch (err) {
      setError("Forensic connection handshake failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06070B] text-white p-8 font-mono selection:bg-[#00E5FF] selection:text-black">
      {/* Dashboard Top Navigation Header */}
      <div className="border border-[#1E2235] bg-[#0C0E17]/60 backdrop-blur-md rounded-lg p-6 mb-8 shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00E5FF]/40 to-transparent" />
        <h1 className="text-xl font-bold tracking-wider text-[#00E5FF] flex items-center gap-2">
          🛡️ GATED MISSION REPLAY MODULE — JURISDICTION OVERSIGHT
        </h1>
        <p className="text-xs text-[#6C7293] mt-1">
          Security Classification: Zero-Knowledge Verification Portal | Active Clearance: Full Auditor Access
        </p>
      </div>

      {/* Target Transaction Node Selection Bar */}
      <form onSubmit={triggerForensicAudit} className="flex gap-4 mb-8">
        <input 
          type="text"
          value={targetId}
          onChange={(e) => setTargetId(e.target.value)}
          placeholder="Enter Target Audit Transaction Node ID (e.g., event UUID)..."
          className="flex-1 bg-[#0C0E17] border border-[#1E2235] rounded px-4 py-2 text-xs focus:outline-none focus:border-[#00E5FF] text-[#00E5FF] tracking-widest font-mono"
        />
        <button 
          type="submit"
          className="bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] hover:bg-[#00E5FF]/20 px-6 py-2 rounded text-xs font-bold tracking-wider transition-all duration-200"
        >
          {loading ? "FETCHING..." : "LOAD AUDIT TIMELINE"}
        </button>
      </form>

      {error && <div className="text-xs text-[#FF3B30] mb-6">❌ ERROR: {error}</div>}

      {/* Main Forensic Replay Dock View */}
      {replayData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Cryptographic Node Summary Cards */}
          <div className="space-y-6">
            <div className="border border-[#1E2235] bg-[#0C0E17]/40 rounded-lg p-6 space-y-4">
              <h2 className="text-xs font-bold text-[#6C7293] border-b border-[#1E2235] pb-2 tracking-widest">
                NODE PROVENANCE PROFILE
              </h2>
              <div className="text-xs space-y-2">
                <div><span className="text-[#6C7293]">SILO_ID:</span> <span className="text-white font-bold">{replayData.siloId}</span></div>
                <div><span className="text-[#6C7293]">WORKSPACE:</span> <span className="text-white font-bold">{replayData.projectName}</span></div>
                <div><span className="text-[#6C7293]">RISK INDEX:</span> <span className="text-[#FF3B30] font-bold">{replayData.riskScore.toFixed(1)} / 10.0</span></div>
                <div className="pt-2 border-t border-[#1E2235]/40 text-[10px]">
                  <span className="text-[#6C7293] block mb-1">REGISTRY PUBLIC KEY FP:</span>
                  <span className="text-white font-bold break-all select-all block bg-[#121526] p-2 border border-[#1E2235] rounded font-mono">{replayData.identityFingerprint}</span>
                </div>
              </div>
            </div>

            {/* Trajectory Step Navigator Tree */}
            <div className="border border-[#1E2235] bg-[#0C0E17]/40 rounded-lg p-6">
              <h2 className="text-xs font-bold text-[#6C7293] mb-4 tracking-widest">INTERCEPTED ACTION PATH</h2>
              <div className="space-y-2">
                {replayData.timeline.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveStep(idx)}
                    className={`w-full text-left p-3 rounded border text-xs flex items-center justify-between transition-all duration-200 ${
                      activeStep === idx 
                        ? 'bg-[#00E5FF]/10 border-[#00E5FF]/40 text-[#00E5FF]' 
                        : 'bg-[#121526]/40 border-[#1E2235] hover:border-[#6C7293] text-[#C5C9DB]'
                    }`}
                  >
                    <span>STEP 0{idx + 1}: {item.rule_id}</span>
                    <span className="text-[10px] text-[#FF8800] bg-[#FF8800]/10 px-1 rounded font-bold">{item.severity}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Step Detail State Inspector Window (Zero-Knowledge View) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="border border-[#1E2235] bg-[#0C0E17]/80 backdrop-blur-md rounded-lg p-6 relative min-h-[300px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[#1E2235] pb-4 mb-4">
                  <h3 className="text-sm font-bold text-[#00E5FF] tracking-wider">
                    🔍 INSPECTOR DETAILS: TRAJECTORY STEP 0{activeStep + 1}
                  </h3>
                  <span className="text-xs text-[#6C7293]">
                    {new Date(replayData.createdAt).toISOString()}
                  </span>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <span className="text-[#6C7293] block mb-1">GOVERNED LEGAL STATUTES:</span>
                    <span className="text-[#FF8800] font-bold bg-[#FF8800]/5 border border-[#FF8800]/20 px-2 py-1 rounded block">
                      {replayData.timeline[activeStep]?.statute}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#6C7293] block mb-1">COMPLIANCE RISK INVARIANT DESCRIPTION:</span>
                    <p className="text-[#C5C9DB] leading-relaxed bg-[#121526] border border-[#1E2235] p-4 rounded">
                      {replayData.timeline[activeStep]?.summary}
                    </p>
                  </div>

                  <div className="pt-2">
                    <a 
                      href={replayData.timeline[activeStep]?.docs_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#58A6FF] hover:underline"
                    >
                      👉 View Global Framework Guidelines & Mitigation Architecture Blueprints
                    </a>
                  </div>
                </div>
              </div>

              {/* Secure Zero-Knowledge Footer Notification */}
              <div className="mt-8 pt-4 border-t border-[#1E2235]/40 text-[10px] text-[#6C7293] flex flex-wrap items-center justify-between gap-4">
                <span className="text-[#00FF66] bg-[#00FF66]/5 px-2 py-0.5 rounded border border-[#00FF66]/20 font-bold">
                  🛡️ ARTICLE VII SANITIZED ENVIRONMENT TRACE SECURED
                </span>
                <span>AUDIT_NODE_HASH: sha256:{replayData.id.substring(0, 16)}...</span>
              </div>
            </div>

            {/* Official Institutional Certification Sign-Off Certificate */}
            <div className="border border-[#1E2235] bg-[#0C0E17]/90 rounded-lg p-6 text-center shadow-inner relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#00E5FF]/5 rounded-full blur-2xl pointer-events-none" />
              <p className="text-xs text-[#C5C9DB] max-w-xl mx-auto leading-relaxed mb-4">
                This compliance evaluation report and its constituent step-by-step state verifications 
                have been parsed, cross-checked, and authenticated by the central AnimusLab System Kernel 
                under strict mathematical policy boundaries.
              </p>
              <div className="text-xs font-bold text-[#00E5FF] tracking-widest select-none">
                Certified & Signed by: 🛡️ AnimusLab & Team [Institutional Governance Registry Node]
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
