"use client";

import { useState } from "react";
import { UserCheck, CheckCircle2, XCircle, Plus, Mail, Key, Shield, Building2, Send, Check } from "lucide-react";

interface WhitelistItem {
  id: string;
  email: string;
  role: string;
  orgName: string;
  domainVerified: boolean;
  status: "PENDING" | "PROVISIONED" | "REJECTED";
}

const MOCK_WHITELIST: WhitelistItem[] = [
  { id: "wl_01", email: "rbi_auditor_09@rbi.org.in", role: "GOVERNMENT_AUDITOR", orgName: "Reserve Bank of India", domainVerified: true, status: "PENDING" },
  { id: "wl_02", email: "alex.c@jpmc.com", role: "PROJECT_LEAD", orgName: "JP Morgan Chase", domainVerified: true, status: "PROVISIONED" },
  { id: "wl_03", email: "sarah.j@jpmc.com", role: "DEVELOPER", orgName: "JP Morgan Chase", domainVerified: true, status: "PROVISIONED" }
];

export default function PendingApprovalsPage() {
  const [showIngestModal, setShowIngestModal] = useState(false);
  const [showAccessGeneratorModal, setShowAccessGeneratorModal] = useState(false);
  const [invitedSuccessMsg, setInvitedSuccessMsg] = useState("");

  // Hub Access Generator Form
  const [hubName, setHubName] = useState("ICICI Bank Bengaluru Hub");
  const [siloId, setSiloId] = useState("ICICI-IN-BLR01");
  const [managerEmail, setManagerEmail] = useState("manager@icicibank.com");
  const [totpSetupKey, setTotpSetupKey] = useState("JBSWY3DPEHPK3PXP");

  const handleGenerateHubAccess = (e: React.FormEvent) => {
    e.preventDefault();
    setInvitedSuccessMsg(`Hub ${siloId} Provisioned! Onboarding email with TOTP Setup Key (${totpSetupKey}) dispatched to ${managerEmail}.`);
    setShowAccessGeneratorModal(false);
    setTimeout(() => setInvitedSuccessMsg(""), 6000);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto relative z-10 font-mono text-xs">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/[0.08] pb-6 gap-4">
        <div>
          <div className="animus-label mb-1 text-amber-400">ACCESS CONTROL & WHITELIST INGESTION</div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight font-sans">Pending Approvals & Access Generator</h1>
          <p className="text-sm text-slate-400 mt-1">Ingest whitelisted email domains, provision enterprise hub access, and dispatch initial manager 2FA TOTP setup keys.</p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => setShowAccessGeneratorModal(true)}
            className="glass-badge px-4 py-2.5 text-xs font-bold text-emerald-400 hover:bg-emerald-950/40 flex items-center space-x-2 transition"
          >
            <Building2 className="w-4 h-4" />
            <span>Generate Hub & Assign Manager</span>
          </button>
          <button
            onClick={() => setShowIngestModal(true)}
            className="glass-badge px-4 py-2.5 text-xs font-bold text-sky-400 hover:bg-sky-950/40 flex items-center space-x-2 transition"
          >
            <Plus className="w-4 h-4 text-sky-400" />
            <span>Ingest Email to Whitelist</span>
          </button>
        </div>
      </div>

      {/* Success Dispatch Alert */}
      {invitedSuccessMsg && (
        <div className="glass-card p-4 border border-emerald-500/40 text-emerald-400 font-sans text-xs flex items-center space-x-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          <span>{invitedSuccessMsg}</span>
        </div>
      )}

      {/* Zero Signup Policy Notice */}
      <div className="glass-card p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Shield className="w-4 h-4 text-amber-400" />
          <span>POLICY: Zero Public Signup. Only email addresses ingested into this whitelist can authenticate via `/login`.</span>
        </div>
        <span className="glass-badge px-3 py-1 text-amber-400 font-bold text-[10px]">ENFORCED</span>
      </div>

      {/* Whitelist Queue */}
      <div className="glass-card overflow-hidden">
        <div className="p-5 border-b border-white/[0.08] flex justify-between items-center bg-[#070b16]/60">
          <span className="animus-label text-slate-300">WHITELISTED CREDENTIALS & INGESTION QUEUE</span>
          <span className="text-slate-400">Domain Check Auto-Active</span>
        </div>

        <div className="p-5 space-y-4">
          {MOCK_WHITELIST.map((item) => (
            <div key={item.id} className="glass-card-inset p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center space-x-3">
                  <span className="text-sky-400 font-bold text-base">{item.email}</span>
                  <span className="glass-badge px-2.5 py-0.5 text-amber-400 font-bold text-[10px]">{item.role}</span>
                </div>
                <div className="text-slate-400 text-xs mt-1">
                  Org: {item.orgName} · Domain Auto-Check: <span className="text-emerald-400 font-bold">VERIFIED</span>
                </div>
              </div>

              <div className="flex space-x-3">
                {item.status === "PENDING" ? (
                  <>
                    <button className="glass-badge text-emerald-400 px-4 py-2 font-bold text-xs hover:bg-emerald-950/40 flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve & Provision</span>
                    </button>
                    <button className="glass-badge text-rose-400 px-4 py-2 font-bold text-xs hover:bg-rose-950/40 flex items-center space-x-2">
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </>
                ) : (
                  <span className="glass-badge px-3 py-1 text-emerald-400 font-bold text-[10px]">
                    PROVISIONED & WHITELISTED
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hub Access Generator Modal */}
      {showAccessGeneratorModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 font-sans text-xs">
          <div className="glass-card w-full max-w-lg p-6 space-y-5 border border-white/20">
            <div className="flex justify-between items-start border-b border-white/10 pb-4">
              <div>
                <div className="animus-label text-emerald-400 mb-1">ENTERPRISE HUB ACCESS GENERATOR</div>
                <h3 className="text-xl font-bold text-slate-100">Provision Hub & Assign Manager</h3>
              </div>
              <button onClick={() => setShowAccessGeneratorModal(false)} className="glass-badge px-3 py-1 text-xs text-slate-400 font-mono">
                Close
              </button>
            </div>

            <form onSubmit={handleGenerateHubAccess} className="space-y-4 font-mono text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-sans font-bold">ENTERPRISE HUB NAME</label>
                <input
                  type="text"
                  required
                  value={hubName}
                  onChange={(e) => setHubName(e.target.value)}
                  className="w-full bg-[#040711] border border-white/10 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-sans font-bold">SILO IDENTIFIER</label>
                <input
                  type="text"
                  required
                  value={siloId}
                  onChange={(e) => setSiloId(e.target.value)}
                  className="w-full bg-[#040711] border border-white/10 rounded-xl px-4 py-2.5 text-sky-400 font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-sans font-bold">INITIAL HUB MANAGER EMAIL</label>
                <input
                  type="email"
                  required
                  value={managerEmail}
                  onChange={(e) => setManagerEmail(e.target.value)}
                  className="w-full bg-[#040711] border border-white/10 rounded-xl px-4 py-2.5 text-emerald-400 font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-sans font-bold flex justify-between">
                  <span>2FA AUTHENTICATOR MANUAL SETUP SECRET KEY</span>
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                </label>
                <input
                  type="text"
                  readOnly
                  value={totpSetupKey}
                  className="w-full bg-[#040711] border border-white/10 rounded-xl px-4 py-2.5 text-amber-400 font-bold focus:outline-none"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  This TOTP secret key will be dispatched in the onboarding email for 2FA setup.
                </span>
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowAccessGeneratorModal(false)} className="glass-badge px-4 py-2 text-xs text-slate-400">
                  Cancel
                </button>
                <button type="submit" className="glass-badge px-5 py-2.5 text-xs font-bold text-emerald-400 hover:bg-emerald-950/40 flex items-center space-x-2">
                  <Send className="w-4 h-4" />
                  <span>Dispatch Access Email & Provision</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
