import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Role, AuditorType } from "@/lib/auth/clearance";

export async function POST(request: Request) {
  const body = await request.json();
  const { email } = body;

  let role: Role = "HUB_MANAGER";
  let auditorType: AuditorType | undefined = undefined;
  let clearanceId = "OWN-AN-MUM-001";
  let projectId = "payments-service";
  let redirectUrl = "/hub";

  const lowerEmail = (email || "").toLowerCase();

  if (lowerEmail.includes("rbi") || lowerEmail.includes("auditor")) {
    role = "AUDITOR";
    auditorType = "GOVERNMENT_AUDITOR";
    clearanceId = "AUD-RBI-IN-009";
    redirectUrl = "/oversight";
  } else if (lowerEmail.includes("admin") || lowerEmail.includes("root")) {
    role = "ANIMUS_ADMIN";
    clearanceId = "LEVEL_ROOT_CLEARANCE";
    redirectUrl = "/admin";
  } else if (lowerEmail.includes("lead") || lowerEmail.includes("alex")) {
    role = "PROJECT_LEAD";
    clearanceId = "LEAD-PAYMENTS-002";
    projectId = "payments-service";
    redirectUrl = "/hub";
  } else if (lowerEmail.includes("dev") || lowerEmail.includes("sarah")) {
    role = "DEVELOPER";
    clearanceId = "DEV-WEALTH-003";
    projectId = "wealth-advisor-agent";
    redirectUrl = "/hub";
  }

  const sessionData = {
    id: clearanceId,
    email: lowerEmail,
    role,
    auditorType,
    projectId,
  };

  cookies().set("session", JSON.stringify(sessionData), {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return NextResponse.json({ success: true, redirectUrl, session: sessionData });
}
