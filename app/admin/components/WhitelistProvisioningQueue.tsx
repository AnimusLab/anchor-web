"use client";

import { useState } from "react";
import { UserCheck, CheckCircle, Clock, Building2, Globe, Shield, AlertCircle, Loader2 } from "lucide-react";

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
  const [approvedIds, setApprovedIds] = useState<Record<string, string>>({});
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

  return (
    <div className="space-y-4">
      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-400/50 text-rose-200 text-xs font-mono flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-12 text-slate-500 border border-dashed border-white/10 rounded-2xl font-mono text-xs">
          No pending whitelist registrations awaiting approval.
        </div>
      ) : (
        items.map((item) => {
          const isApproving = approvingId === item.id;
          const approvedClearance = approvedIds[item.id];
          const isAuditor = ["REGULATORY_AUDITOR", "CROSS_HUB_AUDITOR", "STANDARD_AUDITOR"].includes(item.role);

          return (
            <div
              key={item.id}
              className="bg-black/40 p-4 rounded-2xl border border-white/15 hover:border-white/25 transition space-y-3 font-mono text-xs"
            >
              {/* Header: Name, Email & Role Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                <div>
                  <div className="flex items-center space-x-2.5">
                    <span className="text-white font-bold text-sm font-sans">
                      {item.displayName || item.email.split("@")[0]}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${
                        isAuditor
                          ? "bg-amber-500/20 border-amber-400/50 text-amber-300"
                          : "bg-indigo-500/20 border-indigo-400/50 text-indigo-300"
                      }`}
                    >
                      {item.role}
                    </span>
                  </div>
                  <span className="text-slate-400 text-[11px] block mt-0.5">{item.email}</span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">PROPOSED CLEARANCE ID</span>
                  <span className="text-xs font-bold text-rose-300">
                    {approvedClearance || item.previewClearanceId || "AUTO_GENERATE"}
                  </span>
                </div>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-300">
                <div className="flex items-center space-x-1.5 truncate">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">
                    {item.orgName || item.organization?.displayName || "Enterprise"}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5 truncate">
                  <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate text-cyan-300">
                    @{item.orgDomain || item.organization?.domain || item.email.split("@")[1]}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5 truncate">
                  <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Region: {item.region || "GL"}</span>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between pt-1 border-t border-white/5">
                <span className="text-[10px] text-slate-500 flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>Submitted: {new Date(item.createdAt).toLocaleString()}</span>
                </span>

                {approvedClearance ? (
                  <span className="bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1 text-[11px]">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Approved ({approvedClearance})</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleApprove(item)}
                    disabled={isApproving}
                    className="bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/50 text-emerald-300 px-4 py-1.5 rounded-xl font-bold flex items-center space-x-1.5 transition text-[11px] cursor-pointer disabled:opacity-50"
                  >
                    {isApproving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Approving...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Approve &amp; Dispatch Credentials</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
