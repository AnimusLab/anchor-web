import { PrismaClient } from "@prisma/client";
import { getSession } from "@/lib/auth/session";
import { Key, Plus, Shield, Lock } from "lucide-react";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export default async function ApiKeyVaultPage() {
  const session = await getSession();
  const hubId = session?.hubId;
  const role = session?.role || "DEVELOPER";

  const isManager = role === "HUB_MANAGER";
  const isLeadOrManager = isManager || role === "PROJECT_LEAD";

  // Projects (each project has one apiKeyHash — the key associated with that project silo)
  let projects: any[] = [];
  try {
    projects = await prisma.project.findMany({
      where: {
        ...(hubId ? { hubId } : {}),
        // PROJECT_LEAD is scoped to their own project
        ...(session?.projectId && !isManager ? { id: session.projectId } : {}),
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (e) {
    console.error("Key vault fetch error:", e);
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto relative z-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/[0.08] pb-6 gap-4">
        <div>
          <div className="animus-label mb-1 text-emerald-400">CRYPTOGRAPHIC KEY VAULT</div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">API Key Vault</h1>
          <p className="text-sm text-slate-400 font-mono mt-1">Manage project API keys, dual-key signing policies, and rate limits.</p>
        </div>

        {isLeadOrManager ? (
          <button className="glass-badge px-4 py-2 text-xs font-bold text-white hover:bg-white/10 flex items-center space-x-2 transition">
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Generate New API Key</span>
          </button>
        ) : (
          <span className="glass-badge px-3 py-2 text-xs font-bold text-rose-400 flex items-center space-x-2">
            <Lock className="w-3.5 h-3.5" />
            <span>KEY CREATION: DEVELOPER ACCESS DENIED</span>
          </span>
        )}
      </div>

      {/* Clearance Banner */}
      <div className="glass-card p-4 flex items-center space-x-3 font-mono text-xs">
        <Shield className="w-4 h-4 text-emerald-400" />
        <span>
          CURRENT CLEARANCE: <strong className="text-slate-100">{role.replace(/_/g, " ")}</strong>
          {!isManager && session?.projectId && (
            <span className="text-slate-400"> — Scoped to assigned project silo</span>
          )}
        </span>
      </div>

      {/* Keys Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-5 border-b border-white/[0.08] flex justify-between items-center bg-[#070b16]/60 font-mono text-xs">
          <span className="animus-label text-slate-300">ACCESSIBLE PROJECT API KEYS</span>
          <span className="text-slate-400">{projects.length} Keys Visible</span>
        </div>

        <div className="p-5 space-y-4">
          {projects.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Key className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="text-slate-300 font-sans font-semibold">No Keys in Vault</div>
              <p className="text-xs text-slate-500 font-mono">
                No project API keys are accessible under your current clearance level.
              </p>
            </div>
          ) : (
            projects.map((proj) => (
              <div key={proj.id} className="glass-card-inset p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 font-mono text-xs">
                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <Key className="w-4 h-4 text-emerald-400" />
                    <span className="text-slate-100 font-bold text-sm">{proj.slug}-key</span>
                    <span className="text-slate-500">|</span>
                    <span className="text-slate-300">{proj.name}</span>
                  </div>
                  <div className="text-slate-400 text-[11px] pt-1 font-mono">
                    {proj.apiKeyHash
                      ? proj.apiKeyHash.slice(0, 8) + "**********************" + proj.apiKeyHash.slice(-4)
                      : "—"}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="glass-badge px-3 py-1 text-sky-400 font-bold text-[10px]">
                    {isManager ? "FULL_ACCESS" : "INGEST_ONLY"}
                  </span>
                  <span className="text-slate-500 text-[10px]">
                    Created: {new Date(proj.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
