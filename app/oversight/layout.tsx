import DynamicSidebar from "@/components/DynamicSidebar";
import { getSession } from "@/lib/auth/session";

export default async function OversightLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  const role = session?.role || "AUDITOR";
  const clearanceId = session?.id || "AUD-RBI-IN-009";
  const auditorType = session?.auditorType || "GOVERNMENT_AUDITOR";

  return (
    <div className="flex h-screen bg-[#080c14] text-slate-100 font-sans text-xs overflow-hidden">
      {/* Dynamic Smooth Sidebar */}
      <DynamicSidebar role={role} auditorType={auditorType} clearanceId={clearanceId} />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-[#080c14]/40 backdrop-blur-sm p-8">
        {children}
      </main>
    </div>
  );
}
