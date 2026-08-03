export type Role = "ANIMUS_ADMIN" | "HUB_MANAGER" | "PROJECT_LEAD" | "DEVELOPER" | "AUDITOR";

export type AuditorType = "STANDARD_AUDITOR" | "CROSS_HUB_AUDITOR" | "GOVERNMENT_AUDITOR";

export interface UserSession {
  id: string;
  email: string;
  role: Role;
  auditorType?: AuditorType;
  orgId?: string;
  hubId?: string;
  projectId?: string;
}

export const CLEARANCE_MATRIX = {
  // Routes accessible by Role
  routes: {
    ANIMUS_ADMIN: ["/admin", "/admin/*"],
    HUB_MANAGER: ["/hub", "/hub/telemetry", "/hub/violations", "/hub/replay", "/hub/projects", "/hub/keys", "/hub/reports", "/hub/verifier", "/hub/team", "/hub/requests", "/hub/settings"],
    PROJECT_LEAD: ["/hub", "/hub/telemetry", "/hub/violations", "/hub/replay", "/hub/projects", "/hub/keys", "/hub/reports", "/hub/verifier"],
    DEVELOPER: ["/hub", "/hub/telemetry", "/hub/violations", "/hub/replay"],
    AUDITOR: ["/oversight", "/oversight/dac", "/oversight/heatmap", "/oversight/requests", "/oversight/replay", "/oversight/dialects", "/oversight/verify", "/oversight/notices", "/oversight/profile"],
  },

  // Capabilities by Role
  capabilities: {
    canManageHubKeys: (role: Role) => role === "HUB_MANAGER" || role === "ANIMUS_ADMIN",
    canCreateProjectKeys: (role: Role) => role === "HUB_MANAGER" || role === "PROJECT_LEAD" || role === "ANIMUS_ADMIN",
    canManageSeats: (role: Role) => role === "HUB_MANAGER" || role === "ANIMUS_ADMIN",
    canApproveP2PRequests: (role: Role) => role === "HUB_MANAGER" || role === "ANIMUS_ADMIN",
    canSeeCodebaseAudits: (role: Role) => role !== "AUDITOR", // Strict Auditor Wall
    canFileEnforcementNotices: (role: Role, auditorType?: AuditorType) => 
      role === "ANIMUS_ADMIN" || (role === "AUDITOR" && (auditorType === "CROSS_HUB_AUDITOR" || auditorType === "GOVERNMENT_AUDITOR")),
  }
};

export function canAccessRoute(user: UserSession, pathname: string): boolean {
  if (user.role === "ANIMUS_ADMIN") return true;

  const allowedRoutes = CLEARANCE_MATRIX.routes[user.role] || [];
  return allowedRoutes.some(route => {
    if (route.endsWith("/*")) {
      const base = route.slice(0, -2);
      return pathname.startsWith(base);
    }
    return pathname === route;
  });
}
