"use client";

import { useState } from "react";
import { UserCheck, CheckCircle, Clock, Building2, Globe, Shield, AlertCircle, Loader2, XCircle, UserX } from "lucide-react";

interface WhitelistItem {
  id: string;
  email: string;
  displayName: string | null;
  orgName: string | null;
  orgDomain: string | null;
  department: string | null;
  region: string | null;
  previewClearanceId: string | null;
  role: string;
  status: string;
  createdAt: string | Date;
  organization?: {
    id: string;
    displayName: string;
    domain: string;
    orgType: string;
  } | null;
}

export default function WhitelistProvisioningQueue({ initialItems }: { initialItems: WhitelistItem[] }) {
  const [items, setItems] = useState<WhitelistItem[]>(initialItems);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [denyingId, setDenyingId] = useState<string | null>(null);
  const [approvedIds, setApprovedIds] = useState<Record<string, string>>({});
  const [deniedIds, setDeniedIds] = useState<Record<string, boolean>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleApprove = async (item: WhitelistItem) => {
    setApprovingId(item.id);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/v1/whitelist/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          whitelistId: item.id,
          email: item.email,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to approve whitelist request.");

      setApprovedIds((prev) => ({
        ...prev,
        [item.id]: data.clearanceId || item.previewClearanceId || "APPROVED",
      }));

      // Remove from list after a brief delay
      setTimeout(() => {
        setItems((prev) => prev.filter((i) => i.id !== item.id));
      }, 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Approval error.");
    } finally {
      setApprovingId(null);
    }
  };

  const handleDeny = async (item: WhitelistItem) => {
    setDenyingId(item.id);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/v1/whitelist/deny", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          whitelistId: item.id,
          email: item.email,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to decline registration.");

      setDeniedIds((prev) => ({
        ...prev,
        [item.id]: true,
      }));

      // Remove from list after a brief delay
      setTimeout(() => {
        setItems((prev) => prev.filter((i) => i.id !== item.id));
      }, 2500);
    } catch (err: any) {
      setErrorMsg(err.message || "Decline error.");
    } finally {
      setDenyingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/20 border border-rose-200 dark:border-rose-400/50 text-rose-700 dark:text-rose-200 text-xs font-mono flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-12 text-slate-500 border border-dashed border-slate-300 dark:border-white/10 rounded-2xl font-mono text-xs">
          No pending whitelist registrations awaiting approval.
        </div>
      ) : (
        items.map((item) => {
          const isApproving = approvingId === item.id;
          const isDenying = denyingId === item.id;
          const approvedClearance = approvedIds[item.id];
          const isDenied = deniedIds[item.id];
          const isAuditor = ["REGULATORY_AUDITOR", "CROSS_HUB_AUDITOR", "STANDARD_AUDITOR"].includes(item.role);

          return (
            <div
              key={item.id}
              className="bg-slate-50 dark:bg-black/40 p-4 rounded-2xl border border-slate-200 dark:border-white/15 hover:border-slate-300 dark:hover:border-white/25 transition space-y-3 font-mono text-xs shadow-sm"
            >
              {/* Header: Name, Email & Role Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-white/10 pb-2.5">
                <div>
                  <div className="flex items-center space-x-2.5">
                    <span className="text-slate-900 dark:text-white font-bold text-sm font-sans">
                      {item.displayName || item.email.split("@")[0]}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${
                        isAuditor
                          ? "bg-amber-50 dark:bg-amber-500/20 border-amber-200 dark:border-amber-400/50 text-amber-700 dark:text-amber-300"
                          : "bg-indigo-50 dark:bg-indigo-500/20 border-indigo-200 dark:border-indigo-400/50 text-indigo-700 dark:text-indigo-300"
                      }`}
                    >
                      {item.role}
                    </span>
                  </div>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] block mt-0.5">{item.email}</span>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-bold">PROPOSED CLEARANCE ID</span>
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-300">
                    {approvedClearance || item.previewClearanceId || "AUTO_GENERATE"}
                  </span>
                </div>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-700 dark:text-slate-300">
                <div className="flex items-center space-x-1.5 truncate">
                  <Building2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
                  <span className="truncate">
                    {item.orgName || item.organization?.displayName || "Enterprise"}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5 truncate">
                  <Globe className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
                  <span className="truncate text-cyan-700 dark:text-cyan-300">
                    @{item.orgDomain || item.organization?.domain || item.email.split("@")[1]}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5 truncate">
                  <Shield className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
                  <span>Region: {item.region || "GL"}</span>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-200 dark:border-white/5">
                <span className="text-[10px] text-slate-500 flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>Submitted: {new Date(item.createdAt).toLocaleString()}</span>
                </span>

                <div className="flex items-center space-x-2">
                  {approvedClearance ? (
                    <span className="bg-emerald-50 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-400/50 text-emerald-700 dark:text-emerald-300 px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1 text-[11px]">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Approved ({approvedClearance})</span>
                    </span>
                  ) : isDenied ? (
                    <span className="bg-rose-50 dark:bg-rose-500/20 border border-rose-200 dark:border-rose-400/50 text-rose-700 dark:text-rose-300 px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1 text-[11px]">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Declined / Revoked</span>
                    </span>
                  ) : (
                    <>
                      {/* Decline / Deny Button */}
                      <button
                        type="button"
                        onClick={() => handleDeny(item)}
                        disabled={isApproving || isDenying}
                        className="bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/20 dark:hover:bg-rose-500/30 border border-rose-300 dark:border-rose-400/50 text-rose-700 dark:text-rose-300 px-3.5 py-1.5 rounded-xl font-bold flex items-center space-x-1.5 transition text-[11px] cursor-pointer disabled:opacity-50 shadow-sm"
                      >
                        {isDenying ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Declining...</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Decline</span>
                          </>
                        )}
                      </button>

                      {/* Approve Button */}
                      <button
                        type="button"
                        onClick={() => handleApprove(item)}
                        disabled={isApproving || isDenying}
                        className="bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30 border border-emerald-300 dark:border-emerald-400/50 text-emerald-700 dark:text-emerald-300 px-4 py-1.5 rounded-xl font-bold flex items-center space-x-1.5 transition text-[11px] cursor-pointer disabled:opacity-50 shadow-sm"
                      >
                        {isApproving ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Approving...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Approve &amp; Dispatch</span>
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
