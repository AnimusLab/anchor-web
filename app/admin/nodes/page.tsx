"use client";

import { useEffect, useState } from "react";
import { 
  Building2, 
  Plus, 
  Server, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Search, 
  UserPlus, 
  Users, 
  Sparkles, 
  ShieldCheck, 
  BadgeCheck, 
  Globe 
} from "lucide-react";

interface WhitelistedUser {
  id: string;
  email: string;
  displayName: string;
  role: string;
  status: string;
}

interface HubNode {
  id: string;
  displayName: string;
  region: string;
  isActive: boolean;
  organization: {
    displayName: string;
    domain: string;
  };
  personnelCount: number;
  users: WhitelistedUser[];
}

export default function EnterpriseNodesPage() {
  const [hubs, setHubs] = useState<HubNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
  const [isWhitelistModalOpen, setIsWhitelistModalOpen] = useState(false);
  const [selectedHubForWhitelist, setSelectedHubForWhitelist] = useState<HubNode | null>(null);

  // Auto Provisioning Form State
  const [companyName, setCompanyName] = useState("");
  const [domain, setDomain] = useState("");
  const [city, setCity] = useState("");

  // Personnel Whitelist Form State
  const [personnelName, setPersonnelName] = useState("");
  const [personnelEmail, setPersonnelEmail] = useState("");
  const [personnelRole, setPersonnelRole] = useState("DEVELOPER");

  // Notifications State
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Auto-calculated Hub ID Preview
  const companySlug = companyName.trim().toLowerCase().replace(/[^a-z0-9]/g, "").substring(0, 8) || "company";
  const citySlug = city.trim().toLowerCase().replace(/[^a-z0-9]/g, "") || "hq";
  const previewHubId = `${companySlug}-${citySlug}-01`;
  const previewDisplayName = `${companyName.trim() || "Company"} — ${(city.trim() || "HQ").toUpperCase()} Silo`;

  const loadHubs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/hub/list");
      if (res.ok) {
        const data = await res.json();
        setHubs(data.hubs || []);
      }
    } catch (err) {
      console.error("Failed to load hubs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHubs();
  }, []);

  // Filter hubs by search query (Company Name, Domain, Hub ID, or City)
  const filteredHubs = hubs.filter((hub) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      hub.id.toLowerCase().includes(q) ||
      hub.displayName.toLowerCase().includes(q) ||
      (hub.organization?.displayName && hub.organization.displayName.toLowerCase().includes(q)) ||
      (hub.organization?.domain && hub.organization.domain.toLowerCase().includes(q))
    );
  });

  const handleProvisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/v1/hub/provision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, domain, city }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to provision Hub node.");

      setSuccessMsg(data.message || `Hub '${data.displayName}' auto-provisioned successfully.`);
      loadHubs();

      setCompanyName("");
      setDomain("");
      setCity("");
      setTimeout(() => {
        setIsProvisionModalOpen(false);
        setSuccessMsg("");
      }, 2500);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred while auto-provisioning Hub.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleWhitelistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHubForWhitelist) return;

    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/v1/hub/personnel/whitelist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hubId: selectedHubForWhitelist.id,
          name: personnelName,
          email: personnelEmail,
          role: personnelRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to whitelist personnel.");

      setSuccessMsg(data.message || `Personnel '${personnelName}' whitelisted successfully.`);
      loadHubs();

      setPersonnelName("");
      setPersonnelEmail("");
      setTimeout(() => {
        setIsWhitelistModalOpen(false);
        setSuccessMsg("");
      }, 2500);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred while whitelisting personnel.");
    } finally {
      setSubmitting(false);
    }
  };

  const openWhitelistModal = (hub: HubNode) => {
    setSelectedHubForWhitelist(hub);
    setIsWhitelistModalOpen(true);
    setErrorMsg("");
    setSuccessMsg("");
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto relative z-10 font-mono text-xs">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/[0.08] pb-6 gap-4">
        <div>
          <div className="animus-label mb-1 text-sky-400">SAAS CONTROL PLANE</div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight font-sans">Enterprise Nodes & Personnel Matrix</h1>
          <p className="text-sm text-slate-400 mt-1">Auto-provision sovereign enterprise Hubs and manage personnel whitelists across multi-tenant mesh.</p>
        </div>

        <button
          onClick={() => {
            setIsProvisionModalOpen(true);
            setErrorMsg("");
            setSuccessMsg("");
          }}
          className="glass-badge px-4 py-2.5 text-xs font-bold text-sky-300 hover:bg-sky-500/20 border-sky-400/40 flex items-center space-x-2 transition cursor-pointer shadow-[0_0_20px_rgba(56,189,248,0.2)]"
        >
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span>+ Provision New Sovereign Hub</span>
        </button>
      </div>

      {/* Global Success Notification */}
      {successMsg && (
        <div className="glass-card p-4 border border-emerald-500/40 text-emerald-400 font-sans text-xs flex items-center space-x-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Live Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between glass-card p-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hubs by Company, Domain (@citi.com), or Hub ID..."
            className="w-full pure-glass-input rounded-xl pl-10 pr-4 py-2 text-white text-xs placeholder:text-slate-500 focus:outline-none"
          />
        </div>

        <div className="text-slate-400 text-[11px] font-mono">
          Showing <span className="text-sky-400 font-bold">{filteredHubs.length}</span> of {hubs.length} Provisioned Hubs
        </div>
      </div>

      {/* Nodes & Whitelist Cards Matrix */}
      <div className="space-y-6">
        {loading ? (
          <div className="glass-card p-10 text-center font-mono text-xs text-sky-400 animate-pulse">
            LOADING SOVEREIGN ENTERPRISE MESH & PERSONNEL WHITELISTS...
          </div>
        ) : filteredHubs.length === 0 ? (
          <div className="glass-card p-10 text-center font-mono text-xs text-slate-500 border border-dashed border-white/10 rounded-2xl">
            {searchQuery
              ? `NO HUBS MATCHING SEARCH '${searchQuery}'`
              : "NO ENTERPRISE HUBS PROVISIONED YET // CLICK '+ PROVISION NEW SOVEREIGN HUB' TO START"}
          </div>
        ) : (
          filteredHubs.map((hub) => (
            <div key={hub.id} className="glass-card p-6 space-y-4 border border-white/15 hover:border-sky-400/40 transition">
              {/* Hub Header */}
              <div className="glass-card-inset p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-black/60 to-sky-950/20">
                <div>
                  <div className="flex items-center space-x-3">
                    <Building2 className="w-5 h-5 text-sky-400" />
                    <h3 className="text-lg font-bold text-slate-100 font-sans">
                      {hub.displayName}
                    </h3>
                    <span className="glass-badge px-2.5 py-0.5 text-sky-300 font-mono text-[10px] font-bold">
                      {hub.id}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mt-1.5 font-mono flex items-center space-x-3">
                    <span>Org: <strong className="text-slate-200">{hub.organization?.displayName || "Enterprise Tenant"}</strong></span>
                    <span>Domain: <strong className="text-sky-300">@{hub.organization?.domain || "citi.com"}</strong></span>
                    <span>Region: <strong className="text-amber-300">{hub.region || "UNCONFIGURED"}</strong></span>
                  </p>
                </div>

                <div className="flex items-center space-x-3 flex-shrink-0">
                  <span className="glass-badge px-3 py-1 text-emerald-400 font-bold text-[10px] flex items-center space-x-1">
                    <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{hub.personnelCount || 0} WHITELISTED</span>
                  </span>

                  <button
                    onClick={() => openWhitelistModal(hub)}
                    className="glass-badge px-3.5 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 border-emerald-400/40 flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
                    <span>+ Whitelist Personnel</span>
                  </button>
                </div>
              </div>

              {/* Whitelisted Personnel Sub-Table */}
              <div className="space-y-2 pt-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2 px-1">
                  <Users className="w-3.5 h-3.5 text-sky-400" />
                  <span>WHITELISTED PERSONNEL & CLEARANCE TOKENS FOR {hub.id.toUpperCase()}</span>
                </div>

                {!hub.users || hub.users.length === 0 ? (
                  <div className="bg-black/30 p-4 rounded-xl text-slate-500 text-center text-[11px] font-mono border border-dashed border-white/10">
                    No personnel whitelisted for this Hub yet. Click '+ Whitelist Personnel' above to add Managers, Leads, Devs, or Auditors.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {hub.users.map((user) => (
                      <div key={user.id} className="bg-black/40 p-3.5 rounded-xl border border-white/10 flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-slate-100 font-bold font-sans text-xs">{user.displayName}</span>
                            <span className="text-[9px] bg-sky-500/20 border border-sky-400/30 text-sky-300 px-2 py-0.5 rounded font-mono font-bold">
                              {user.role}
                            </span>
                          </div>
                          <div className="text-slate-400 text-[10px] mt-0.5 font-mono">
                            Email: {user.email}
                          </div>
                          <div className="text-rose-300 text-[10px] mt-0.5 font-mono font-bold">
                            Clearance ID: {user.id}
                          </div>
                        </div>

                        <span className="glass-badge px-2 py-0.5 text-emerald-400 text-[9px] font-bold">
                          APPROVED
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL 1: Auto Provision Sovereign Hub Modal */}
      {isProvisionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-lg pure-glass-card p-8 rounded-3xl space-y-6 relative border border-sky-400/40 shadow-[0_0_50px_rgba(56,189,248,0.2)]">
            <button
              onClick={() => setIsProvisionModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="inline-flex items-center space-x-2 bg-sky-500/20 border border-sky-300/40 px-3.5 py-1 rounded-full text-xs font-mono text-sky-200 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-sky-300" />
                <span>AUTO-SOVEREIGN HUB GENERATOR</span>
              </div>
              <h2 className="text-2xl font-black text-white uppercase font-sans">PROVISION SOVEREIGN HUB</h2>
              <p className="text-xs text-slate-300 mt-1 font-sans">
                Enter company details. The system will auto-generate the canonical Hub ID, Display Name, and TOTP secret.
              </p>
            </div>

            {errorMsg && (
              <div className="bg-rose-500/20 border border-rose-400/50 text-rose-200 p-3.5 rounded-xl text-xs font-mono flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleProvisionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-200 uppercase mb-1 font-mono">
                  Company / Organization Name <span className="text-sky-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Citigroup | Nexus Systems"
                  className="w-full pure-glass-input rounded-xl px-4 py-3 text-white text-xs font-mono placeholder:text-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 uppercase mb-1 font-mono">
                  Work Email Domain <span className="text-sky-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="e.g. citi.com (without @)"
                  className="w-full pure-glass-input rounded-xl px-4 py-3 text-white text-xs font-mono placeholder:text-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 uppercase mb-1 font-mono">
                  Branch / City Location
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. London | New York | Singapore"
                  className="w-full pure-glass-input rounded-xl px-4 py-3 text-white text-xs font-mono placeholder:text-slate-500 focus:outline-none"
                />
              </div>

              {/* Live Preview Box */}
              {companyName && (
                <div className="bg-sky-950/40 p-4 rounded-xl border border-sky-400/30 font-mono text-xs space-y-1">
                  <div className="text-[10px] text-sky-300 font-bold uppercase">AUTO-GENERATED PREVIEW</div>
                  <div className="text-slate-200">
                    Canonical Hub ID: <strong className="text-emerald-400">{previewHubId}</strong>
                  </div>
                  <div className="text-slate-300">
                    Display Name: <strong className="text-white">{previewDisplayName}</strong>
                  </div>
                </div>
              )}

              <div className="pt-2 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setIsProvisionModalOpen(false)}
                  className="w-1/3 bg-white/10 hover:bg-white/20 text-slate-200 font-mono py-3 rounded-xl font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-2/3 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-mono py-3 rounded-xl font-bold uppercase tracking-wider transition shadow-[0_0_25px_rgba(56,189,248,0.4)]"
                >
                  {submitting ? "PROVISIONING..." : "AUTO-PROVISION HUB →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Whitelist Personnel Modal */}
      {isWhitelistModalOpen && selectedHubForWhitelist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-lg pure-glass-card p-8 rounded-3xl space-y-6 relative border border-emerald-400/40 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
            <button
              onClick={() => setIsWhitelistModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="inline-flex items-center space-x-2 bg-emerald-500/20 border border-emerald-300/40 px-3.5 py-1 rounded-full text-xs font-mono text-emerald-200 mb-2">
                <UserPlus className="w-3.5 h-3.5 text-emerald-300" />
                <span>PERSONNEL WHITELIST ENGINE</span>
              </div>
              <h2 className="text-2xl font-black text-white uppercase font-sans">WHITELIST PERSONNEL</h2>
              <p className="text-xs text-slate-300 mt-1 font-sans">
                Issue a whitelisted Clearance ID credential under <strong className="text-sky-300">{selectedHubForWhitelist.displayName}</strong> ({selectedHubForWhitelist.id}).
              </p>
            </div>

            {errorMsg && (
              <div className="bg-rose-500/20 border border-rose-400/50 text-rose-200 p-3.5 rounded-xl text-xs font-mono flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleWhitelistSubmit} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block font-bold text-slate-200 uppercase mb-1">
                  Target Hub Node
                </label>
                <div className="bg-black/60 p-3 rounded-xl border border-white/20 text-slate-200 font-bold">
                  {selectedHubForWhitelist.displayName} ({selectedHubForWhitelist.id})
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-200 uppercase mb-1">
                  Personnel Full Name <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={personnelName}
                  onChange={(e) => setPersonnelName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full pure-glass-input rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-200 uppercase mb-1">
                  Work Email Address <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={personnelEmail}
                  onChange={(e) => setPersonnelEmail(e.target.value)}
                  placeholder={`john.doe@${selectedHubForWhitelist.organization?.domain || "citi.com"}`}
                  className="w-full pure-glass-input rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-200 uppercase mb-1">
                  Position / Role Tier <span className="text-emerald-400">*</span>
                </label>
                <select
                  value={personnelRole}
                  onChange={(e) => setPersonnelRole(e.target.value)}
                  className="w-full pure-glass-input rounded-xl px-4 py-3 text-white bg-black/80 focus:outline-none"
                >
                  <option value="HUB_MANAGER">HUB_MANAGER (Enterprise Hub Administrator)</option>
                  <option value="PROJECT_LEAD">PROJECT_LEAD (Engineering Lead / Team Lead)</option>
                  <option value="DEVELOPER">DEVELOPER (AI Agent Developer / Engineer)</option>
                  <option value="REGULATORY_AUDITOR">REGULATORY_AUDITOR (Statutory Government Official)</option>
                  <option value="CROSS_HUB_AUDITOR">CROSS_HUB_AUDITOR (Cross-Silo Auditor)</option>
                </select>
              </div>

              <div className="pt-2 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setIsWhitelistModalOpen(false)}
                  className="w-1/3 bg-white/10 hover:bg-white/20 text-slate-200 py-3 rounded-xl font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-2/3 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white py-3 rounded-xl font-bold uppercase tracking-wider transition shadow-[0_0_25px_rgba(16,185,129,0.4)]"
                >
                  {submitting ? "WHITELISTING..." : "ISSUE CLEARANCE TOKEN →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
