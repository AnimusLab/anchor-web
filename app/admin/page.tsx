export default function AdminPage() {
  return (
    <div className="space-y-6 font-mono text-xs">
      <div className="neo-card p-5 flex justify-between items-center">
        <div>
          <div className="animus-label mb-1 text-sky-400">SYS://OPERATIONS_CONTROL</div>
          <div className="text-white font-bold text-base">AnimusLab Platform Administration</div>
        </div>
        <div className="flex space-x-3">
          <button className="skeuo-badge px-4 py-2 font-bold text-white hover:bg-slate-800 transition">
            + Provision New Hub
          </button>
          <button className="skeuo-badge px-4 py-2 font-bold text-slate-300 hover:text-white transition">
            Manage Whitelist
          </button>
        </div>
      </div>

      {/* KPI Neomorphic Blocks (Matching screenshot) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="neo-card p-5 space-y-2">
          <div className="animus-label">ACTIVE HUBS</div>
          <div className="text-2xl font-bold text-slate-100">12 Provisioned</div>
          <div className="text-slate-400 text-xs">2 Starter / 7 Base / 3 Growth</div>
        </div>

        <div className="neo-card p-5 space-y-2">
          <div className="animus-label tracking-wider">PENDING WHITELIST</div>
          <div className="text-3xl font-bold text-amber-400">3 Users Awaiting</div>
          <div className="text-slate-400 text-xs">Domain check required</div>
        </div>

        <div className="neo-card p-5 space-y-2">
          <div className="animus-label">GOV RELAY REQUESTS</div>
          <div className="text-2xl font-bold text-emerald-400">1 Awaiting Hub Action</div>
          <div className="text-slate-400 text-xs">Gov Auditor → Hub Manager</div>
        </div>
      </div>

      {/* Whitelist Queue Table */}
      <div className="neo-card overflow-hidden">
        <div className="p-4 border-b border-white/[0.06] flex justify-between items-center bg-slate-900/50">
          <span className="font-bold text-slate-200">WHITELIST_PROVISIONING_QUEUE</span>
          <span className="text-slate-400 font-semibold">Auto-Check Active</span>
        </div>

        <div className="divide-y divide-white/[0.06]">
          <div className="p-5 flex items-center justify-between hover:bg-white/[0.02] transition">
            <div>
              <span className="text-sky-400 font-bold text-sm">rbi_auditor_09@rbi.org.in</span>
              <span className="text-slate-500 mx-3">→</span>
              <span className="text-slate-200 font-semibold">GOVERNMENT_AUDITOR</span>
              <div className="text-slate-400 mt-1">Org: Reserve Bank of India | Domain Verified: YES</div>
            </div>
            <div className="flex space-x-3">
              <button className="skeuo-badge text-emerald-400 px-4 py-2 font-bold hover:bg-emerald-950/40 transition">
                Approve & Provision
              </button>
              <button className="skeuo-badge text-rose-400 px-4 py-2 font-bold hover:bg-rose-950/40 transition">
                Reject
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
