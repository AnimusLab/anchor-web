import DynamicSidebar from "@/components/DynamicSidebar";
import { getSession } from "@/lib/auth/session";

export default async function HubLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  // Fallback default for preview/demo if session cookie not set
  const role = session?.role || "HUB_MANAGER";
  const clearanceId = session?.id || "OWN-AN-MUM-001";
  const auditorType = session?.auditorType;

  return (
    <div className="flex h-screen bg-[#050505] text-[#e5e5e5] font-sans text-xs overflow-hidden">
      <DynamicSidebar role={role} auditorType={auditorType} clearanceId={clearanceId} />
      <main className="flex-1 overflow-y-auto bg-[#050505] p-8">
        {children}
      </main>
    </div>
  );
}
