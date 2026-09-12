import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOnboardingAdminNotification } from "@/lib/email";
import { getClientIp, checkRateLimit, recordFailedAttempt } from "@/lib/auth/rateLimiter";
import { generateSequentialClearanceId } from "@/lib/auth/clearanceId";

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
    const { 
      name, 
      displayName, 
      email, 
      orgName, 
      organizationName, 
      orgDomain, 
      city, 
      region, 
      department, 
      requestedHubId, 
      jurisdiction, 
      portalType, 
      requestedRole 
    } = body;

    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanName = (name || displayName || "").trim();
    const resolvedOrgName = (orgName || organizationName || "").trim();

    // Track attempt
    recordFailedAttempt(`onboard:${clientIp}`, 3, 10 * 60 * 1000, 10 * 60 * 1000);

    if (!cleanEmail || !cleanName) {
      return NextResponse.json({ error: "Full Name and Email are required for onboarding submission." }, { status: 400 });
    }

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
    const cleanOrgName = resolvedOrgName || (isOversight ? "Regulatory Authority" : cleanDomain.split(".")[0].toUpperCase());

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

    // 5. Generate Sequential Clearance ID
    const previewClearanceId = await generateSequentialClearanceId({
      name: cleanName,
      role: finalRole,
      orgName: cleanOrgName,
      orgId: targetOrg.id,
      jurisdiction: jurisdiction || region || targetOrg.region,
      region: region,
    });

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
