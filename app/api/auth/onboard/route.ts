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
    const { name, email, orgName, city, region, department, requestedHubId, jurisdiction, portalType } = body;

    // Track attempt
    recordFailedAttempt(`onboard:${clientIp}`, 3, 10 * 60 * 1000, 10 * 60 * 1000);

    if (!email || !name) {
      return NextResponse.json({ error: "Name and Email are required for onboarding submission" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Account already exists for this email address. Please proceed to Sign In." },
        { status: 409 }
      );
    }

    // Check if request already pending in Whitelist
    const existingWhitelist = await prisma.whitelist.findUnique({
      where: { email: cleanEmail },
    });

    if (existingWhitelist) {
      return NextResponse.json(
        {
          success: true,
          message: "An onboarding registration for this email is already registered in the whitelist queue.",
          status: existingWhitelist.status,
        },
        { status: 200 }
      );
    }

    // Find default org for self-service onboarding or fallback
    const defaultOrg = await prisma.organization.findFirst({
      where: { orgType: "ENTERPRISE" },
    });

    if (defaultOrg) {
      await prisma.whitelist.create({
        data: {
          email: cleanEmail,
          orgId: defaultOrg.id,
          role: portalType === "oversight" ? "REGULATORY_AUDITOR" : "HUB_MANAGER",
          status: "PENDING",
        },
      });
    }

    // Dispatch background email notification to root admin & backup email
    sendOnboardingAdminNotification({
      name: name.trim(),
      email: cleanEmail,
      orgName,
      city,
      region: region || jurisdiction,
      department,
      portalType,
    }).catch((err) => console.error("Background email notification error:", err));

    return NextResponse.json({
      success: true,
      message: "Your enterprise onboarding registration has been submitted for Root Administrator clearance review.",
    });
  } catch (error: any) {
    console.error("Onboarding submission failed:", error);
    return NextResponse.json({ error: "Failed to submit onboarding request. Please try again." }, { status: 500 });
  }
}
