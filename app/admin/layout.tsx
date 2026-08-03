import Link from "next/link";
import { 
  LayoutDashboard, 
  Globe, 
  Server, 
  UserCheck, 
  Building2, 
  ShieldAlert, 
  CreditCard, 
  Key, 
  RotateCcw, 
  Sliders, 
  Activity,
  Shield
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#050505] text-[#e5e5e5] font-mono text-xs overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 animus-border-r bg-[#080808] flex flex-col justify-between flex-shrink-0">
        <div className="overflow-y-auto no-scrollbar">
          {/* Header */}
          <div className="p-4 animus-border-b">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-white" />
              <span className="font-bold text-sm text-white tracking-wider uppercase">Anchor Root</span>
            </div>
            <div className="animus-label text-[10px] mt-1">MASTER OPERATOR ACCESS</div>
          </div>

          <div className="p-3 bg-zinc-950/80 animus-border-b text-[10px]">
            <span className="text-zinc-500 block">PRIVILEGE: ROOT</span>
            <span className="text-emerald-400 font-bold">LEVEL_ROOT_CLEARANCE</span>
          </div>

          {/* Nav Section 1: Oversight & Analytics */}
          <div className="p-4 space-y-2">
            <div className="animus-label text-[9px]">OVERSIGHT & ANALYTICS</div>
            <nav className="space-y-0.5">
              <Link href="/admin" className="flex items-center space-x-2.5 px-2.5 py-1.5 rounded text-white bg-zinc-900 animus-border">
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Overview</span>
              </Link>
              <Link href="/admin/telemetry" className="flex items-center space-x-2.5 px-2.5 py-1.5 text-zinc-400 hover:text-white transition">
                <Globe className="w-3.5 h-3.5" />
                <span>Global Telemetry</span>
              </Link>
              <Link href="/admin/fleet" className="flex items-center space-x-2.5 px-2.5 py-1.5 text-zinc-400 hover:text-white transition">
                <Server className="w-3.5 h-3.5" />
                <span>Fleet Inspection</span>
              </Link>
            </nav>
          </div>

          {/* Nav Section 2: Access Management */}
          <div className="p-4 pt-0 space-y-2">
            <div className="animus-label text-[9px]">ACCESS MANAGEMENT</div>
            <nav className="space-y-0.5">
              <Link href="/admin/pending" className="flex items-center space-x-2.5 px-2.5 py-1.5 text-zinc-400 hover:text-white transition">
                <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Pending Approvals</span>
              </Link>
            </nav>
          </div>

          {/* Nav Section 3: SaaS Control Plane */}
          <div className="p-4 pt-0 space-y-2">
            <div className="animus-label text-[9px]">SAAS CONTROL PLANE</div>
            <nav className="space-y-0.5">
              <Link href="/admin/nodes" className="flex items-center space-x-2.5 px-2.5 py-1.5 text-zinc-400 hover:text-white transition">
                <Building2 className="w-3.5 h-3.5" />
                <span>Enterprise Nodes</span>
              </Link>
              <Link href="/admin/auditors" className="flex items-center space-x-2.5 px-2.5 py-1.5 text-zinc-400 hover:text-white transition">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Regulatory Officials</span>
              </Link>
              <Link href="/admin/billing" className="flex items-center space-x-2.5 px-2.5 py-1.5 text-zinc-400 hover:text-white transition">
                <CreditCard className="w-3.5 h-3.5" />
                <span>Billing & Subscriptions</span>
              </Link>
            </nav>
          </div>

          {/* Nav Section 4: Cryptographic Engine */}
          <div className="p-4 pt-0 space-y-2">
            <div className="animus-label text-[9px]">CRYPTOGRAPHIC ENGINE</div>
            <nav className="space-y-0.5">
              <Link href="/admin/resolution" className="flex items-center space-x-2.5 px-2.5 py-1.5 text-zinc-400 hover:text-white transition">
                <Key className="w-3.5 h-3.5" />
                <span>Identity Resolution</span>
              </Link>
              <Link href="/admin/recovery" className="flex items-center space-x-2.5 px-2.5 py-1.5 text-zinc-400 hover:text-white transition">
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Identity Recovery</span>
              </Link>
              <Link href="/admin/overrides" className="flex items-center space-x-2.5 px-2.5 py-1.5 text-zinc-400 hover:text-white transition">
                <Sliders className="w-3.5 h-3.5" />
                <span>Network Overrides</span>
              </Link>
            </nav>
          </div>

          {/* Nav Section 5: Live Operations */}
          <div className="p-4 pt-0 space-y-2">
            <div className="animus-label text-[9px]">LIVE OPERATIONS</div>
            <nav className="space-y-0.5">
              <Link href="/admin/noc" className="flex items-center space-x-2.5 px-2.5 py-1.5 text-zinc-400 hover:text-white transition">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>Live NOC</span>
              </Link>
            </nav>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 animus-border-t text-[10px] text-zinc-500 flex justify-between items-center">
          <span>Anchor v2.0.0 — Root</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 overflow-y-auto bg-[#050505] p-8">
        {children}
      </main>
    </div>
  );
}
