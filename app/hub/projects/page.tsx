import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { Layers, Plus, Cpu, Key } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProjectInventoryPage() {
  const session = await getSession();
  const hubId = session?.hubId;

  let projects: any[] = [];
  try {
    projects = await prisma.project.findMany({
      where: hubId ? { hubId } : {},
      orderBy: { createdAt: "desc" },
    });
  } catch (e) {
    console.error("Project fetch error:", e);
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto relative z-10 font-sans">
      <div className="flex justify-between items-end border-b border-slate-200 dark:border-white/[0.08] pb-6">
        <div>
          <div className="animus-label mb-1 text-sky-600 dark:text-sky-400 font-bold uppercase text-[10px] tracking-widest font-mono">ISOLATED ENCLAVE INVENTORY</div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Project Inventory</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-mono mt-1">Manage project silos, AI agent bindings, and cryptographic isolation boundaries.</p>
        </div>
        <button className="pure-glass-badge px-4 py-2.5 text-xs font-bold text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 flex items-center space-x-2 transition rounded-xl shadow-sm">
          <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Provision New Project</span>
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="pure-glass-card rounded-2xl p-16 text-center space-y-4 shadow-sm border border-slate-200 dark:border-white/10">
          <Layers className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto" />
          <div className="text-slate-900 dark:text-slate-200 font-sans font-semibold text-base">No Projects Registered</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono max-w-sm mx-auto">
            Run <code className="text-emerald-600 dark:text-emerald-400 font-bold">anchor init</code> in your repository to provision your first governed project silo.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((proj) => (
            <div key={proj.id} className="pure-glass-card rounded-2xl p-6 space-y-4 shadow-sm border border-slate-200 dark:border-white/10">
              <div className="flex justify-between items-start border-b border-slate-200 dark:border-white/10 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 font-mono">{proj.name}</h3>
                    <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                      ACTIVE
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Silo: {proj.hubId}</span>
                </div>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">{proj.slug}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 font-mono text-xs bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <Cpu className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[10px]">BOUND AGENTS</span>
                    <span className="text-slate-900 dark:text-slate-100 font-bold">—</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Key className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[10px]">API KEY</span>
                    <span className="text-slate-900 dark:text-slate-100 font-bold text-[11px] font-mono">
                      {proj.apiKeyHash ? proj.apiKeyHash.slice(0, 10) + "…" : "—"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs font-mono pt-2">
                <span className="text-slate-500 dark:text-slate-400">Created: {new Date(proj.createdAt).toLocaleDateString()}</span>
                <button className="text-sky-600 dark:text-sky-400 hover:underline font-semibold">Manage Silo Settings →</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
