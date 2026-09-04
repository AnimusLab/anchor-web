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
  Globe,
  UserX,
  Clock,
  Briefcase,
  Shield,
  Key,
  Mail,
  Loader2,
  CheckCircle,
  Copy,
  Check,
  ExternalLink,
  UserCheck
} from "lucide-react";

interface WhitelistedUser {
  id: string;
  whitelistId?: string;
  clearanceId?: string;
  email: string;
  displayName: string;
  role: string;
  status: string;
  department?: string | null;
  region?: string | null;
  source?: string | null;
  createdAt?: string | Date;
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
  const [activeTab, setActiveTab] = useState<"all" | "active" | "pending">("all");

  // Modals state
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
  const [isWhitelistModalOpen, setIsWhitelistModalOpen] = useState(false);
  const [selectedHubForWhitelist, setSelectedHubForWhitelist] = useState<HubNode | null>(null);
  const [inspectedUser, setInspectedUser] = useState<{ user: WhitelistedUser; hub: HubNode } | null>(null);

  // Auto Provisioning Form State
  const [companyName, setCompanyName] = useState("");
  const [domain, setDomain] = useState("");
  const [city, setCity] = useState("");

  // Personnel Whitelist Form State
  const [personnelName, setPersonnelName] = useState("");
  const [personnelEmail, setPersonnelEmail] = useState("");
  const [personnelRole, setPersonnelRole] = useState("DEVELOPER");
  const [personnelDepartment, setPersonnelDepartment] = useState("");

  // Notifications & Action States
  const [submitting, setSubmitting] = useState(false);
  const [approvingEmail, setApprovingEmail] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
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
      const res = await fetch(`/api/v1/hub/list?t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Pragma": "no-cache" },
      });
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

  const handleProvisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/v1/hub/provision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          domain,
          city,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to provision sovereign hub.");

      setSuccessMsg(data.message || `Hub '${data.hub?.displayName}' provisioned successfully.`);
      loadHubs();

      setCompanyName("");
      setDomain("");
      setCity("");
      setTimeout(() => {
        setIsProvisionModalOpen(false);
        setSuccessMsg("");
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred during Hub provisioning.");
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
          department: personnelDepartment,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to whitelist personnel.");

      setSuccessMsg(data.message || `Personnel '${personnelName}' whitelisted successfully.`);
      loadHubs();

      setPersonnelName("");
      setPersonnelEmail("");
      setPersonnelDepartment("");
      setTimeout(() => {
        setIsWhitelistModalOpen(false);
        setSuccessMsg("");
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred while whitelisting personnel.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprovePersonnel = async (user: WhitelistedUser, hubId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setApprovingEmail(user.email);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/v1/whitelist/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          whitelistId: user.whitelistId,
          email: user.email,
          assignedHubId: hubId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Approval failed.");

      setSuccessMsg(`Clearance granted for ${user.displayName} (${data.clearanceId || user.id}). Credentials dispatched.`);
      loadHubs();
      if (inspectedUser?.user.email === user.email) {
        setInspectedUser(null);
      }
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to approve user.");
    } finally {
      setApprovingEmail(null);
    }
  };

  const handleRevokePersonnel = async (email: string, hubId: string) => {
    if (!confirm(`Are you sure you want to revoke whitelist access for ${email}?`)) return;

    try {
      const res = await fetch(`/api/v1/hub/personnel/whitelist?email=${encodeURIComponent(email)}&hubId=${encodeURIComponent(hubId)}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to revoke whitelist status.");

      setSuccessMsg(data.message || `Personnel '${email}' removed from whitelist.`);
      loadHubs();
      if (inspectedUser?.user.email === email) {
        setInspectedUser(null);
      }
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred while revoking whitelist.");
    }
  };

  const openWhitelistModal = (hub: HubNode, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedHubForWhitelist(hub);
    setIsWhitelistModalOpen(true);
    setErrorMsg("");
    setSuccessMsg("");
  };

  const copyToClipboard = (text: string, id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter hubs and calculate pending counts
  const totalPendingCount = hubs.reduce(
    (acc, hub) => acc + (hub.users?.filter((u) => u.status === "PENDING").length || 0),
    0
  );

  const filteredHubs = hubs.filter((h) => {
    const matchesSearch =
      h.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.organization?.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.organization?.domain?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.users?.some(
        (u) =>
          u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.id.toLowerCase().includes(searchQuery.toLowerCase())
      );

    if (!matchesSearch) return false;

    if (activeTab === "pending") {
      return h.users?.some((u) => u.status === "PENDING");
    }
    return true;
  });

  const getRoleBadge = (roleStr: string) => {
    switch (roleStr) {
      case "HUB_MANAGER":
        return {
          label: "HUB MANAGER (L3)",
          color: "bg-emerald-500/20 text-emerald-300 border-emerald-400/40",
          icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />,
        };
      case "PROJECT_LEAD":
        return {
          label: "PROJECT LEAD (L2)",
          color: "bg-indigo-500/20 text-indigo-300 border-indigo-400/40",
          icon: <Sparkles className="w-3.5 h-3.5 text-indigo-400" />,
        };
      case "DEVELOPER":
        return {
          label: "AI DEVELOPER (L1)",
          color: "bg-sky-500/20 text-sky-300 border-sky-400/40",
          icon: <Server className="w-3.5 h-3.5 text-sky-400" />,
        };
      default:
        return {
          label: roleStr.replace(/_/g, " "),
          color: "bg-slate-500/20 text-slate-300 border-slate-400/40",
          icon: <Shield className="w-3.5 h-3.5 text-slate-400" />,
        };
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto relative z-10 font-mono text-xs">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/[0.08] pb-6 gap-4">
        <div>
          <div className="animus-label mb-1 text-sky-400">SAAS CONTROL PLANE</div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight font-sans">Enterprise Nodes &amp; Personnel Matrix</h1>
          <p className="text-sm text-slate-400 mt-1">
            Auto-provision sovereign enterprise Hubs and manage personnel whitelists across multi-tenant mesh.
          </p>
        </div>

        <button
          onClick={() => {
            setIsProvisionModalOpen(true);
            setErrorMsg("");
            setSuccessMsg("");
          }}
          className="glass-badge px-4 py-2.5 text-xs font-bold text-sky-300 hover:bg-sky-500/20 border-sky-400/40 flex items-center space-x-2 transition cursor-pointer shadow-[0_0_20px_rgba(56,189,248,0.25)]"
        >
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span>+ Provision New Sovereign Hub</span>
        </button>
      </div>

      {/* Global Notifications */}
      {successMsg && (
        <div className="glass-card p-4 border border-emerald-500/40 text-emerald-400 font-sans text-xs flex items-center space-x-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="glass-card p-4 border border-rose-500/40 text-rose-300 font-sans text-xs flex items-center space-x-3 animate-fadeIn">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Metrics & Filter Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex space-x-2 bg-[#060913]/80 p-1.5 rounded-2xl border border-white/10">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
              activeTab === "all" ? "bg-sky-500/20 text-sky-300 border border-sky-400/40" : "text-slate-400 hover:text-white"
            }`}
          >
            All Hubs ({hubs.length})
          </button>
          <button
            onClick={() => setActiveTab("active")}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
              activeTab === "active" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40" : "text-slate-400 hover:text-white"
            }`}
          >
            Provisioned Active ({hubs.filter((h) => h.isActive).length})
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === "pending" ? "bg-amber-500/20 text-amber-300 border border-amber-400/40" : "text-slate-400 hover:text-white"
            }`}
          >
            <span>Pending Approvals</span>
            {totalPendingCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-bold text-[9px] flex items-center justify-center">
                {totalPendingCount}
              </span>
            )}
          </button>
        </div>

        {/* Live Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Company, Domain, or Personnel..."
            className="w-full pure-glass-input rounded-xl pl-10 pr-4 py-2 text-white text-xs placeholder:text-slate-500 focus:outline-none font-sans"
          />
        </div>
      </div>

      {/* Hubs & Personnel Cards Matrix */}
      <div className="space-y-6">
        {loading ? (
          <div className="pure-glass-card p-16 text-center space-y-3 rounded-3xl border border-white/15">
            <Building2 className="w-8 h-8 text-sky-400 mx-auto animate-bounce" />
            <div className="text-sky-300 font-bold text-xs uppercase tracking-widest animate-pulse">
              LOADING SOVEREIGN ENTERPRISE MESH &amp; PERSONNEL WHITELISTS...
            </div>
          </div>
        ) : filteredHubs.length === 0 ? (
          <div className="pure-glass-card p-16 text-center space-y-4 rounded-3xl border border-white/10">
            <Building2 className="w-10 h-10 text-slate-600 mx-auto" />
            <div className="text-slate-300 font-sans font-semibold text-base">No Enterprise Hubs Found</div>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {searchQuery
                ? `No hubs matching search query '${searchQuery}'`
                : "Click '+ Provision New Sovereign Hub' above to auto-create enterprise nodes."}
            </p>
          </div>
        ) : (
          filteredHubs.map((hub) => {
            const displayedUsers =
              activeTab === "pending"
                ? hub.users?.filter((u) => u.status === "PENDING") || []
                : hub.users || [];

            return (
              <div
                key={hub.id}
                className="pure-glass-card p-6 md:p-8 rounded-3xl space-y-6 border border-white/15 hover:border-sky-400/40 transition shadow-2xl relative overflow-hidden"
              >
                {/* Hub Header Card Banner */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-5">
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-slate-950 text-sm shadow-[0_0_15px_rgba(56,189,248,0.3)] shrink-0">
                        <Building2 className="w-5 h-5 text-slate-950" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-bold text-white font-sans">{hub.displayName}</h3>
                          <span className="glass-badge px-2 py-0.5 text-sky-300 font-mono text-[10px] font-bold">
                            {hub.id}
                          </span>
                        </div>
                        <div className="text-slate-300 text-xs font-mono flex flex-wrap items-center gap-x-3 gap-y-1 pt-1">
                          <span>Org: <strong className="text-white">{hub.organization?.displayName || "Enterprise Node"}</strong></span>
                          <span>Domain: <strong className="text-sky-300">@{hub.organization?.domain || "citi.com"}</strong></span>
                          <span>Region: <strong className="text-amber-300">{hub.region || "US-EAST-1"}</strong></span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <span className="glass-badge px-3 py-1 text-emerald-400 font-bold text-[10px] flex items-center space-x-1.5 border-emerald-400/30">
                      <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{hub.personnelCount || hub.users?.length || 0} WHITELISTED</span>
                    </span>

                    <button
                      onClick={(e) => openWhitelistModal(hub, e)}
                      className="glass-badge px-3.5 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 border-emerald-400/40 flex items-center space-x-1.5 transition cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
                      <span>+ Whitelist Personnel</span>
                    </button>
                  </div>
                </div>

                {/* Whitelisted Personnel Grid */}
                <div className="space-y-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2 px-1">
                    <Users className="w-3.5 h-3.5 text-sky-400" />
                    <span>WHITELISTED PERSONNEL &amp; CLEARANCE TOKENS FOR {hub.id.toUpperCase()}</span>
                  </div>

                  {displayedUsers.length === 0 ? (
                    <div className="p-6 rounded-2xl bg-black/40 text-slate-500 text-center text-xs font-mono border border-dashed border-white/10">
                      No personnel match this filter for {hub.displayName}. Click '+ Whitelist Personnel' above to provision access.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
                      {displayedUsers.map((user) => {
                        const isPending = user.status === "PENDING";
                        const roleMeta = getRoleBadge(user.role);
                        const initials = user.displayName
                          ? user.displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
                          : "OP";

                        return (
                          <div
                            key={user.id}
                            onClick={() => setInspectedUser({ user, hub })}
                            className={`p-5 rounded-2xl bg-black/50 border transition cursor-pointer hover:scale-[1.01] space-y-3 relative overflow-hidden ${
                              isPending
                                ? "border-amber-400/40 hover:border-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.1)]"
                                : "border-white/10 hover:border-sky-400/50 shadow-[0_0_20px_rgba(56,189,248,0.1)]"
                            }`}
                          >
                            {/* Card Header: Role & Status Badge */}
                            <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                              <div className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${roleMeta.color}`}>
                                {roleMeta.icon}
                                <span>{roleMeta.label}</span>
                              </div>

                              <span
                                className={`glass-badge px-2 py-0.5 text-[9px] font-mono font-bold ${
                                  isPending ? "text-amber-400 border-amber-400/40 animate-pulse" : "text-emerald-400 border-emerald-400/30"
                                }`}
                              >
                                {isPending ? "PENDING APPROVAL" : "APPROVED"}
                              </span>
                            </div>

                            {/* Personnel Profile Row */}
                            <div className="flex items-start space-x-3.5">
                              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 to-emerald-500 flex items-center justify-center font-mono font-bold text-slate-950 text-xs shadow-md shrink-0">
                                {initials}
                              </div>
                              <div className="space-y-0.5 min-w-0 flex-1">
                                <h4 className="text-sm font-bold text-white truncate font-sans">{user.displayName}</h4>
                                <p className="text-slate-300 text-xs font-mono truncate">{user.email}</p>
                                {user.department && (
                                  <p className="text-[11px] text-slate-400 font-mono truncate">
                                    Dept: {user.department}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Clearance ID Box */}
                            <div className="p-2.5 bg-black/60 rounded-xl border border-white/10 flex items-center justify-between gap-2 font-mono text-[11px]">
                              <div className="space-y-0.5">
                                <span className="text-slate-400 text-[9px] block uppercase font-bold">Clearance ID</span>
                                <span className="text-sky-300 font-bold">{user.clearanceId || user.id}</span>
                              </div>

                              <div className="text-right space-y-0.5">
                                <span className="text-slate-400 text-[9px] block uppercase font-bold">Hub Silo</span>
                                <span className="text-slate-300 font-bold text-[10px] bg-white/10 px-2 py-0.5 rounded">
                                  {hub.id}
                                </span>
                              </div>
                            </div>

                            {/* Footer Action */}
                            <div className="flex items-center justify-between pt-1 text-xs">
                              <span className="text-[10px] text-slate-400 font-mono">
                                Click card to view dossier
                              </span>

                              <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                                {isPending ? (
                                  <button
                                    onClick={(e) => handleApprovePersonnel(user, hub.id, e)}
                                    disabled={approvingEmail === user.email}
                                    className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/50 text-emerald-300 font-bold text-[11px] flex items-center space-x-1.5 transition cursor-pointer disabled:opacity-50"
                                  >
                                    <UserCheck className="w-3.5 h-3.5" />
                                    <span>{approvingEmail === user.email ? "Approving..." : "Approve"}</span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => setInspectedUser({ user, hub })}
                                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 font-bold text-[10px] flex items-center space-x-1 transition cursor-pointer"
                                  >
                                    <span>Dossier</span>
                                    <ExternalLink className="w-3 h-3 text-slate-400" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL 1: Personnel Security Dossier Drawer */}
      {inspectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-lg pure-glass-card p-6 md:p-8 rounded-3xl space-y-6 relative border border-sky-400/50 shadow-2xl font-sans">
            <button
              onClick={() => setInspectedUser(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white transition p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="inline-flex items-center space-x-2 bg-sky-500/20 border border-sky-300/40 px-3.5 py-1 rounded-full text-xs font-mono text-sky-200 mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-300" />
                <span>PERSONNEL SECURITY DOSSIER</span>
              </div>
              <h2 className="text-2xl font-black text-white uppercase">{inspectedUser.user.displayName}</h2>
              <p className="text-xs text-slate-300 mt-1 font-mono">{inspectedUser.user.email}</p>
            </div>

            {/* Field Matrix */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 bg-black/40 rounded-2xl border border-white/10 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Clearance Token</span>
                <span className="text-sky-300 font-bold break-all">{inspectedUser.user.clearanceId || inspectedUser.user.id}</span>
              </div>

              <div className="p-3 bg-black/40 rounded-2xl border border-white/10 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Assigned Role</span>
                <span className="text-emerald-400 font-bold">{inspectedUser.user.role.replace(/_/g, " ")}</span>
              </div>

              <div className="p-3 bg-black/40 rounded-2xl border border-white/10 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Assigned Hub Silo</span>
                <span className="text-slate-100 font-bold">{inspectedUser.hub.displayName}</span>
              </div>

              <div className="p-3 bg-black/40 rounded-2xl border border-white/10 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Corporate Domain</span>
                <span className="text-sky-300">@{inspectedUser.hub.organization?.domain || "citi.com"}</span>
              </div>

              <div className="p-3 bg-black/40 rounded-2xl border border-white/10 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Department / Division</span>
                <span className="text-slate-200">{inspectedUser.user.department || "Enterprise Engineering"}</span>
              </div>

              <div className="p-3 bg-black/40 rounded-2xl border border-white/10 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Clearance Status</span>
                <span className={`font-bold ${inspectedUser.user.status === "APPROVED" ? "text-emerald-400" : "text-amber-400"}`}>
                  {inspectedUser.user.status}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setInspectedUser(null)}
                className="w-1/3 bg-white/10 hover:bg-white/20 text-slate-200 py-3 rounded-xl font-bold transition cursor-pointer"
              >
                Close
              </button>

              {inspectedUser.user.status === "PENDING" ? (
                <button
                  type="button"
                  onClick={() => handleApprovePersonnel(inspectedUser.user, inspectedUser.hub.id)}
                  disabled={approvingEmail === inspectedUser.user.email}
                  className="w-2/3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-3 rounded-xl font-bold uppercase tracking-wider transition shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer disabled:opacity-50"
                >
                  {approvingEmail === inspectedUser.user.email ? "APPROVING..." : "APPROVE CLEARANCE →"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => copyToClipboard(inspectedUser.user.clearanceId || inspectedUser.user.id, inspectedUser.user.id)}
                  className="w-2/3 bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-sky-300 py-3 rounded-xl font-bold transition flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {copiedId === inspectedUser.user.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedId === inspectedUser.user.id ? "Token Copied!" : "Copy Clearance Token"}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Provision New Sovereign Hub Modal */}
      {isProvisionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-lg pure-glass-card p-6 md:p-8 rounded-3xl space-y-6 relative border border-sky-400/40 shadow-2xl font-sans">
            <button
              onClick={() => setIsProvisionModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white transition p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="inline-flex items-center space-x-2 bg-sky-500/20 border border-sky-300/40 px-3.5 py-1 rounded-full text-xs font-mono text-sky-200 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-sky-300" />
                <span>SOVEREIGN MESH PROVISIONER</span>
              </div>
              <h2 className="text-2xl font-black text-white uppercase">PROVISION ENTERPRISE HUB</h2>
              <p className="text-xs text-slate-300 mt-1 font-mono">
                Auto-generate an isolated sovereign database silo, P2P relay endpoints, and corporate root keys.
              </p>
            </div>

            <form onSubmit={handleProvisionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-200 uppercase mb-1 font-mono">
                  Enterprise Company Name <span className="text-sky-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Citigroup | JPMorgan Chase | Palantir"
                  className="w-full pure-glass-input rounded-xl px-4 py-2.5 text-white text-xs placeholder:text-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 uppercase mb-1 font-mono">
                  Corporate Email Domain <span className="text-sky-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="e.g. citi.com | jpmorgan.com"
                  className="w-full pure-glass-input rounded-xl px-4 py-2.5 text-white text-xs font-mono placeholder:text-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 uppercase mb-1 font-mono">
                  City / Primary Jurisdiction Region <span className="text-sky-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. London | New York | Mumbai | Singapore"
                  className="w-full pure-glass-input rounded-xl px-4 py-2.5 text-white text-xs placeholder:text-slate-500 focus:outline-none"
                />
              </div>

              {/* Real-Time Preview */}
              <div className="p-4 rounded-2xl bg-black/60 border border-sky-500/30 space-y-2 font-mono text-[11px]">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">AUTOMATIC MESH IDENTIFIER</span>
                <div className="flex justify-between items-center text-sky-300">
                  <span>Canonical Silo ID:</span>
                  <strong className="text-white">{previewHubId}</strong>
                </div>
                <div className="flex justify-between items-center text-sky-300">
                  <span>Display Name:</span>
                  <strong className="text-white truncate max-w-[240px]">{previewDisplayName}</strong>
                </div>
              </div>

              <div className="pt-2 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setIsProvisionModalOpen(false)}
                  className="w-1/3 bg-white/10 hover:bg-white/20 text-slate-200 py-3 rounded-xl font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-2/3 bg-gradient-to-r from-sky-600 via-indigo-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white py-3 rounded-xl font-bold uppercase tracking-wider transition shadow-[0_0_20px_rgba(56,189,248,0.4)] cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "PROVISIONING..." : "PROVISION HUB →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Whitelist Personnel Modal */}
      {isWhitelistModalOpen && selectedHubForWhitelist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-lg pure-glass-card p-6 md:p-8 rounded-3xl space-y-6 relative border border-emerald-400/40 shadow-2xl font-sans">
            <button
              onClick={() => setIsWhitelistModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white transition p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="inline-flex items-center space-x-2 bg-emerald-500/20 border border-emerald-300/40 px-3.5 py-1 rounded-full text-xs font-mono text-emerald-200 mb-2">
                <UserPlus className="w-3.5 h-3.5 text-emerald-300" />
                <span>PERSONNEL WHITELIST PROVISIONER</span>
              </div>
              <h2 className="text-2xl font-black text-white uppercase font-sans">WHITELIST PERSONNEL</h2>
              <p className="text-xs text-slate-300 mt-1 font-mono">
                Provision clearance keys for <strong>{selectedHubForWhitelist.displayName}</strong>.
              </p>
            </div>

            <form onSubmit={handleWhitelistSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-200 uppercase mb-1 font-mono">
                  Corporate Email <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={personnelEmail}
                  onChange={(e) => setPersonnelEmail(e.target.value)}
                  placeholder={`officer@${selectedHubForWhitelist.organization?.domain || "citi.com"}`}
                  className="w-full pure-glass-input rounded-xl px-4 py-2.5 text-white text-xs font-mono placeholder:text-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 uppercase mb-1 font-mono">
                  Full Officer Name <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={personnelName}
                  onChange={(e) => setPersonnelName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins, Lead AI Architect"
                  className="w-full pure-glass-input rounded-xl px-4 py-2.5 text-white text-xs placeholder:text-slate-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-200 uppercase mb-1 font-mono">
                    Assigned Clearance Level
                  </label>
                  <select
                    value={personnelRole}
                    onChange={(e) => setPersonnelRole(e.target.value)}
                    className="w-full pure-glass-input rounded-xl px-4 py-2.5 text-white text-xs bg-[#0A0A10] focus:outline-none cursor-pointer"
                  >
                    <option value="HUB_MANAGER">Hub Manager (Level 3)</option>
                    <option value="PROJECT_LEAD">Project Lead (Level 2)</option>
                    <option value="DEVELOPER">AI Developer (Level 1)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 uppercase mb-1 font-mono">
                    Department / Division
                  </label>
                  <input
                    type="text"
                    value={personnelDepartment}
                    onChange={(e) => setPersonnelDepartment(e.target.value)}
                    placeholder="e.g. Algorithmic Governance"
                    className="w-full pure-glass-input rounded-xl px-4 py-2.5 text-white text-xs placeholder:text-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setIsWhitelistModalOpen(false)}
                  className="w-1/3 bg-white/10 hover:bg-white/20 text-slate-200 py-3 rounded-xl font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-2/3 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white py-3 rounded-xl font-bold uppercase tracking-wider transition shadow-[0_0_20px_rgba(16,185,129,0.4)] cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "PROVISIONING..." : "WHITELIST & ISSUE KEYS →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
