import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sendOnboardingAdminNotification } from "@/lib/email";
import { getClientIp, checkRateLimit, recordFailedAttempt } from "@/lib/auth/rateLimiter";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);
    // Rate limit onboarding: Max 3 submissions per 10 minutes per IP
    const ipCheck = checkRateLimit(`onboard:${clientIp}`, 3, 10 * 60 * 1000, 10 * 60 * 1000);
    if (!ipCheck.allowed) {
      return NextResponse.json(
        { 
          error: "Too many onboarding registration attempts from this IP. Please wait a few minutes before trying again.",
          retryAfterSeconds: ipCheck.retryAfterSeconds 
        }, 
        { 
          status: 429,
          headers: {
            "Retry-After": String(ipCheck.retryAfterSeconds || 600)
          }
        }
      );
    }

    const body = await req.json();
    const { name, email, orgName, orgDomain, city, region, department, requestedHubId, jurisdiction, portalType, requestedRole } = body;

    // Track attempt
    recordFailedAttempt(`onboard:${clientIp}`, 3, 10 * 60 * 1000, 10 * 60 * 1000);

    if (!email || !name) {
      return NextResponse.json({ error: "Full Name and Email are required for onboarding submission" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    // 1. Check if user already exists in User table
    const existingUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existingUser) {
      return NextResponse.json(
        { error: `An account already exists for '${cleanEmail}' (Clearance ID: ${existingUser.id}). Please proceed to Sign In.` },
        { status: 409 }
      );
    }

    // 2. Check if request already pending in Whitelist
    const existingWhitelist = await prisma.whitelist.findUnique({
      where: { email: cleanEmail },
    });

    if (existingWhitelist) {
      return NextResponse.json(
        {
          success: true,
          message: "An onboarding registration for this email is already registered in the whitelist queue. Root Administrator verification is in progress.",
          status: existingWhitelist.status,
        },
        { status: 200 }
      );
    }

    // 3. Resolve Organization & Domain
    let cleanDomain = (orgDomain || "").trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    if (!cleanDomain && cleanEmail.includes("@")) {
      cleanDomain = cleanEmail.split("@")[1];
    }
    if (!cleanDomain) {
      cleanDomain = "enterprise.local";
    }

    const isOversight = portalType === "oversight";
    const targetOrgType = isOversight ? "REGULATORY_BODY" : "ENTERPRISE";
    const cleanOrgName = (orgName || "").trim() || (isOversight ? "Regulatory Authority" : cleanDomain.split(".")[0].toUpperCase());

    // Find or dynamically create Organization
    let targetOrg = await prisma.organization.findFirst({
      where: {
        OR: [
          { domain: cleanDomain },
          { id: cleanDomain.replace(/[^a-z0-9]/g, "-").slice(0, 30) },
        ],
      },
    });

    if (!targetOrg) {
      const orgId = cleanDomain.replace(/[^a-z0-9]/g, "-").slice(0, 30) || `org-${Date.now()}`;
      targetOrg = await prisma.organization.create({
        data: {
          id: orgId,
          displayName: cleanOrgName,
          domain: cleanDomain,
          orgType: targetOrgType as any,
          contractTier: isOversight ? "SOVEREIGN" : "STARTER",
          region: region || jurisdiction || "GL",
          status: "APPROVED",
        },
      });
    }

    // 4. Resolve Target Role
    let finalRole: any = "DEVELOPER";
    if (isOversight) {
      const validAuditorRoles = ["REGULATORY_AUDITOR", "CROSS_HUB_AUDITOR", "STANDARD_AUDITOR"];
      finalRole = validAuditorRoles.includes(requestedRole) ? requestedRole : "REGULATORY_AUDITOR";
    } else {
      const validEnterpriseRoles = ["HUB_MANAGER", "PROJECT_LEAD", "DEVELOPER"];
      finalRole = validEnterpriseRoles.includes(requestedRole) ? requestedRole : "HUB_MANAGER";
    }

    // 5. Generate Formatted Preview Clearance ID
    let previewClearanceId: string;
    if (finalRole === "REGULATORY_AUDITOR") {
      const jurTag = jurisdiction ? jurisdiction.toUpperCase().slice(0, 4) : "REG";
      previewClearanceId = `AUD-${jurTag}-L4-${Math.floor(100 + Math.random() * 900)}`;
    } else if (finalRole === "CROSS_HUB_AUDITOR") {
      previewClearanceId = `AUD-CH-L2-${Math.floor(100 + Math.random() * 900)}`;
    } else if (finalRole === "STANDARD_AUDITOR") {
      previewClearanceId = `AUD-SA-L1-${Math.floor(100 + Math.random() * 900)}`;
    } else {
      const namePrefix = cleanName.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase().padEnd(3, "X");
      const roleCode = finalRole === "HUB_MANAGER" ? "MGR-L3" : finalRole === "PROJECT_LEAD" ? "PJ-L2" : "DEV-L1";
      previewClearanceId = `${namePrefix}-${roleCode}`;
    }

    // 6. Create Whitelist Record
    await prisma.whitelist.create({
      data: {
        email: cleanEmail,
        displayName: cleanName,
        orgName: cleanOrgName,
        orgDomain: cleanDomain,
        department: department?.trim() || null,
        region: region?.trim() || jurisdiction?.trim() || targetOrg.region,
        previewClearanceId,
        orgId: targetOrg.id,
        role: finalRole,
        status: "PENDING",
        source: "SELF_REGISTERED_GATEWAY",
        invitedBy: null,
      },
    });

    // 7. Dispatch background email notification to root admin
    sendOnboardingAdminNotification({
      name: cleanName,
      email: cleanEmail,
      orgName: cleanOrgName,
      city,
      region: region || jurisdiction || targetOrg.region,
      department,
      portalType: portalType || "hub",
    }).catch((err) => console.error("Background email notification error:", err));

    return NextResponse.json({
      success: true,
      message: `Your clearance request for ${cleanOrgName} (${finalRole}) has been submitted for Root Administrator verification. Verification can take up to at least 48 hours for approval depending on institutional response times.`,
      previewClearanceId,
      orgId: targetOrg.id,
    });
  } catch (error: any) {
    console.error("Onboarding submission failed:", error);
    return NextResponse.json({ error: "Failed to submit onboarding request. " + (error.message || "") }, { status: 500 });
  }
}
