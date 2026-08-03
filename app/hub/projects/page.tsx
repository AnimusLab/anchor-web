import { Key, Plus } from "lucide-react";

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Projects & API Keys</h1>
          <p className="text-sm text-slate-400">Manage Hub Keys and Project-scoped ingestion keys</p>
        </div>
        <button className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-medium px-4 py-2 rounded-lg text-sm flex items-center space-x-2 transition">
          <Plus className="w-4 h-4" />
          <span>New Project Key</span>
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4">
        <div className="flex items-center space-x-3 text-emerald-400">
          <Key className="w-5 h-5" />
          <h3 className="font-semibold text-slate-200">Hub Master Ingestion Key</h3>
        </div>
        <p className="text-sm text-slate-400">
          Used by Hub Managers across all projects. Keys are stored as bcrypt hashes and shown once upon generation.
        </p>
        <div className="bg-slate-950 p-3 rounded border border-slate-800 font-mono text-xs text-slate-400 flex justify-between items-center">
          <span>ak_live_********************************</span>
          <span className="text-emerald-400 text-xs font-semibold">Active</span>
        </div>
      </div>
    </div>
  );
}
