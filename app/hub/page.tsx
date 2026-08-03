import { ShieldCheck, AlertTriangle, Layers, Activity } from "lucide-react";

export default function HubOverviewPage() {
  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">Hub Overview</h1>
        <p className="text-sm text-slate-400">Enterprise AI governance summary for J.P. Morgan (IN-MUM01)</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Compliance Rate</span>
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-100">99.4%</div>
          <div className="text-xs text-slate-500 mt-1">Across 4 active projects</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Projects</span>
            <Layers className="w-5 h-5 text-blue-400" />
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-100">4 / 15</div>
          <div className="text-xs text-slate-500 mt-1">Growth Tier Package</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Flagged Violations</span>
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-100">3</div>
          <div className="text-xs text-slate-500 mt-1">2 Remediated, 1 Pending</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Telemetry Stream</span>
            <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-100">P2P Active</div>
          <div className="text-xs text-slate-500 mt-1">Raw evidence on premises</div>
        </div>
      </div>

      {/* Telemetry Preview Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-semibold text-sm text-slate-200">Recent Audit Records</h3>
          <span className="text-xs text-slate-500 font-mono">Live Stream</span>
        </div>
        <div className="divide-y divide-slate-800/60 text-sm">
          <div className="px-6 py-3 flex items-center justify-between">
            <div>
              <span className="font-mono text-xs text-slate-400">dec_9901a</span>
              <span className="ml-3 font-medium text-slate-200">payments-service</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-xs font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded">RBI Dialect</span>
              <span className="text-xs text-emerald-400 font-semibold">COMPLIANT</span>
            </div>
          </div>
          <div className="px-6 py-3 flex items-center justify-between">
            <div>
              <span className="font-mono text-xs text-slate-400">dec_9902b</span>
              <span className="ml-3 font-medium text-slate-200">wealth-advisor-agent</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-xs font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded">EU AI Act</span>
              <span className="text-xs text-amber-400 font-semibold">VIOLATION</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
