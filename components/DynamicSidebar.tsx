"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Activity, 
  ShieldAlert, 
  PlaySquare, 
  FolderKanban, 
  Key, 
  FileText, 
  ShieldCheck, 
  Users, 
  GitPullRequest, 
  Settings,
  User,
  History,
  Lock,
} from "lucide-react";
import { Role, AuditorType, CLEARANCE_MATRIX } from "@/lib/auth/clearance";

interface DynamicSidebarProps {
  userRole?: Role;
  role?: Role;
  auditorType?: AuditorType;
  hubId?: string;
  clearanceId?: string;
}

const ROLE_DISPLAY: Record<Role, string> = {
  ANIMUS_ADMIN: "Animus Admin",
  HUB_MANAGER: "Hub Manager",
  PROJECT_LEAD: "Project Lead",
  DEVELOPER: "Developer",
  STANDARD_AUDITOR: "Standard Auditor",
  CROSS_HUB_AUDITOR: "Cross-Hub Auditor",
  REGULATORY_AUDITOR: "Regulatory Auditor",
};

const ROLE_COLOUR: Record<Role, string> = {
  ANIMUS_ADMIN: "text-red-400",
  HUB_MANAGER: "text-emerald-400",
  PROJECT_LEAD: "text-indigo-400",
  DEVELOPER: "text-sky-400",
  STANDARD_AUDITOR: "text-amber-400",
  CROSS_HUB_AUDITOR: "text-purple-400",
  REGULATORY_AUDITOR: "text-orange-400",
};

/** Returns whether a route is accessible for the given role */
function canAccess(role: Role, path: string): boolean {
  if (role === "ANIMUS_ADMIN") return true;
  const allowed = CLEARANCE_MATRIX.routes[role] || [];
  return allowed.includes(path);
}

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  role: Role;
  pathname: string;
  requiredRole?: string;
}

function NavItem({ href, icon, label, role, pathname, requiredRole }: NavItemProps) {
  const accessible = canAccess(role, href);
  const isActive = pathname === href;

  if (!accessible) {
    return (
      <div
        className="flex items-center justify-between px-3 py-2 rounded-lg opacity-35 cursor-not-allowed select-none"
        title={`Requires ${requiredRole || "higher"} clearance`}
      >
        <div className="flex items-center space-x-2.5">
          <span className="text-slate-500">{icon}</span>
          <span className="text-slate-500 line-through">{label}</span>
        </div>
        <Lock className="w-2.5 h-2.5 text-slate-600 flex-shrink-0" />
      </div>
    );
  }

  return (
    <Link
      href={href}
      prefetch={true}
      className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition ${
        isActive ? "glass-nav-active" : "text-slate-300 hover:text-white"
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

export default function DynamicSidebar({
  userRole,
  role = "HUB_MANAGER",
  auditorType,
  hubId = "animuslab-hq",
  clearanceId = "OWN-AN-MUM-001",
}: DynamicSidebarProps) {
  const pathname = usePathname();
  const effectiveRole = userRole || role;
  const roleLabel = ROLE_DISPLAY[effectiveRole] || effectiveRole;
  const roleColour = ROLE_COLOUR[effectiveRole] || "text-slate-400";

  return (
    <aside className="w-64 glass-sidebar flex flex-col justify-between flex-shrink-0 z-20 font-mono text-xs">
      <div className="overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="p-4 border-b border-white/[0.08]">
          <div className="p-3.5 glass-header-box flex items-center space-x-3">
            <div className="p-2 glass-badge">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="font-bold text-xs text-slate-100 tracking-wide uppercase font-sans">
                Governance Hub
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">hub.animuslab.dev</div>
            </div>
          </div>
        </div>

        {/* Clearance Badge — role label, not UUID */}
        <div className="mx-4 my-3.5 p-3 glass-badge text-[10px] space-y-0.5">
          <span className="text-slate-400 block uppercase tracking-wider">Clearance: {roleLabel}</span>
          <span className={`font-bold tracking-wide ${roleColour}`}>{clearanceId}</span>
        </div>

        {/* ── Section 1: Governance & Telemetry ── */}
        <div className="p-4 space-y-2 border-b border-white/[0.04]">
          <div className="animus-label text-[9px]">GOVERNANCE &amp; TELEMETRY</div>
          <nav className="space-y-1">
            <NavItem href="/hub" icon={<LayoutDashboard className="w-3.5 h-3.5 text-emerald-400" />} label="Overview" role={effectiveRole} pathname={pathname} />
            <NavItem href="/hub/telemetry" icon={<Activity className="w-3.5 h-3.5 text-sky-400" />} label="Decision Telemetry" role={effectiveRole} pathname={pathname} requiredRole="Project Lead" />
            <NavItem href="/hub/violations" icon={<ShieldAlert className="w-3.5 h-3.5 text-amber-400" />} label="Violation Feed" role={effectiveRole} pathname={pathname} requiredRole="Project Lead" />
            <NavItem href="/hub/replay" icon={<PlaySquare className="w-3.5 h-3.5 text-purple-400" />} label="Mission Replay" role={effectiveRole} pathname={pathname} requiredRole="Project Lead" />
          </nav>
        </div>

        {/* ── Section 2: Projects & Ingestion ── */}
        <div className="p-4 pt-3 space-y-2 border-b border-white/[0.04]">
          <div className="animus-label text-[9px]">PROJECTS &amp; INGESTION</div>
          <nav className="space-y-1">
            <NavItem href="/hub/projects" icon={<FolderKanban className="w-3.5 h-3.5 text-sky-400" />} label="Project Inventory" role={effectiveRole} pathname={pathname} />
            <NavItem href="/hub/keys" icon={<Key className="w-3.5 h-3.5 text-emerald-400" />} label="API Key Vault" role={effectiveRole} pathname={pathname} requiredRole="Project Lead" />
          </nav>
        </div>

        {/* ── Section 3: Compliance & Reports ── */}
        <div className="p-4 pt-3 space-y-2 border-b border-white/[0.04]">
          <div className="animus-label text-[9px]">COMPLIANCE &amp; REPORTS</div>
          <nav className="space-y-1">
            <NavItem href="/hub/reports" icon={<FileText className="w-3.5 h-3.5 text-amber-400" />} label="Dialect Reports" role={effectiveRole} pathname={pathname} requiredRole="Project Lead" />
            <NavItem href="/hub/verifier" icon={<ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />} label="Audit Chain Verifier" role={effectiveRole} pathname={pathname} requiredRole="Project Lead" />
          </nav>
        </div>

        {/* ── Section 4: Hub Management (Manager-only items locked for lower roles) ── */}
        <div className="p-4 pt-3 space-y-2">
          <div className="animus-label text-[9px]">HUB MANAGEMENT</div>
          <nav className="space-y-1">
            <NavItem href="/hub/profile" icon={<User className="w-3.5 h-3.5 text-emerald-400" />} label="My Profile" role={effectiveRole} pathname={pathname} />
            <NavItem href="/hub/team/activity" icon={<History className="w-3.5 h-3.5 text-sky-400" />} label="Team Activity" role={effectiveRole} pathname={pathname} requiredRole="Project Lead" />
            <NavItem href="/hub/team" icon={<Users className="w-3.5 h-3.5 text-sky-400" />} label="Team & Seats" role={effectiveRole} pathname={pathname} requiredRole="Hub Manager" />
            <NavItem href="/hub/requests" icon={<GitPullRequest className="w-3.5 h-3.5 text-amber-400" />} label="P2P Access Requests" role={effectiveRole} pathname={pathname} requiredRole="Hub Manager" />
            <NavItem href="/hub/settings" icon={<Settings className="w-3.5 h-3.5 text-slate-400" />} label="Hub Settings" role={effectiveRole} pathname={pathname} requiredRole="Hub Manager" />
          </nav>
        </div>
      </div>

      {/* Footer — real hubId from session */}
      <div className="p-4 border-t border-white/[0.08] text-[10px] text-slate-400 flex justify-between items-center bg-[#070b16]/80">
        <span>Silo: {hubId}</span>
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
      </div>
    </aside>
  );
}
