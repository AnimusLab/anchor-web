export default function AdminPage() {
  return (
    <div className="space-y-6 font-mono text-xs">
      <div className="p-4 bg-zinc-950 animus-border flex justify-between items-center">
        <div>
          <div className="animus-label mb-1">SYSTEM CONTROL TERMINAL</div>
          <div className="text-white font-bold text-sm">AnimusLab Platform Administration</div>
        </div>
        <div className="flex space-x-3">
          <button className="border border-zinc-700 hover:border-white text-white px-3 py-1.5 transition">
            + Provision New Hub
          </button>
          <button className="border border-zinc-700 hover:border-white text-white px-3 py-1.5 transition">
            Manage Whitelist
          </button>
        </div>
      </div>

      {/* KPI Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-zinc-950 animus-border space-y-1">
          <div className="animus-label">ACTIVE HUBS</div>
          <div className="text-2xl font-bold text-white">12 Provisioned</div>
          <div className="text-zinc-500">2 Starter / 7 Base / 3 Growth</div>
        </div>

        <div className="p-4 bg-zinc-950 animus-border space-y-1">
          <div className="animus-label">PENDING WHITELIST</div>
          <div className="text-2xl font-bold text-amber-400">3 Users Awaiting</div>
          <div className="text-zinc-500">Domain check required</div>
        </div>

        <div className="p-4 bg-zinc-950 animus-border space-y-1">
          <div className="animus-label">GOV RELAY REQUESTS</div>
          <div className="text-2xl font-bold text-emerald-400">1 Awaiting Hub Action</div>
          <div className="text-zinc-500">Gov Auditor → Hub Manager</div>
        </div>
      </div>

      {/* Whitelist Table */}
      <div className="bg-zinc-950 animus-border">
        <div className="p-3 animus-border-b flex justify-between items-center text-zinc-400">
          <span>WHITELIST_PROVISIONING_QUEUE</span>
          <span>Auto-Check Active</span>
        </div>

        <div className="divide-y divide-zinc-900">
          <div className="p-4 flex items-center justify-between">
            <div>
              <span className="text-white font-bold">rbi_auditor_09@rbi.org.in</span>
              <span className="text-zinc-600 mx-2">→</span>
              <span className="text-zinc-300">GOVERNMENT_AUDITOR</span>
              <div className="text-zinc-500 mt-1">Org: Reserve Bank of India | Domain Verified: YES</div>
            </div>
            <div className="flex space-x-2">
              <button className="border border-emerald-800 text-emerald-400 hover:bg-emerald-950/40 px-3 py-1 transition">
                Approve & Provision
              </button>
              <button className="border border-rose-900 text-rose-400 hover:bg-rose-950/40 px-3 py-1 transition">
                Reject
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
