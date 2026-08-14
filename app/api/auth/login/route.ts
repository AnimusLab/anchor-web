import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PrismaClient, UserStatus } from "@prisma/client";
import { authenticator } from "otplib";
import { createSessionCookie } from "@/lib/auth/session";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, identifier, totpCode, portalType } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Please provide Enterprise Email address." },
        { status: 400 }
      );
    }

    const lowerEmail = email.trim().toLowerCase();
    const cleanIdentifier = (identifier || "").trim();

    // 1. Check AdminUser Table (AnimusLab Internal Root Operators ONLY)
    const admin = await prisma.adminUser.findUnique({
      where: { email: lowerEmail },
    });

    if (admin) {
      // Enforce strict Root Admin portal scoping
      if (portalType && portalType !== "admin") {
        return NextResponse.json(
          {
            success: false,
            message: "🚫 ACCESS RESTRICTED // ROOT ADMIN CREDENTIALS CAN ONLY AUTHENTICATE AT ROOT ADMIN GATEWAY (/admin/login)",
          },
          { status: 403 }
        );
      }

      if (admin.status !== UserStatus.APPROVED) {
        return NextResponse.json(
          { success: false, message: "Admin account is suspended or pending approval." },
          { status: 403 }
        );
      }

      // Step 1: If 2FA TOTP code is NOT provided, instruct client to prompt Step 2 TOTP input
      if (!totpCode) {
        return NextResponse.json(
          {
            success: false,
            requireTotp: true,
            message: "🔒 Identity verified. Enter 6-digit TOTP Authenticator code to complete login.",
          },
          { status: 200 }
        );
      }

      // Step 2: Validate 6-Digit TOTP Code
      if (admin.totpSecret) {
        const isValidTotp = authenticator.check(totpCode.trim(), admin.totpSecret);
        if (!isValidTotp) {
          return NextResponse.json(
            { success: false, requireTotp: true, message: "❌ Invalid 6-digit TOTP Authenticator code. Check your app." },
            { status: 401 }
          );
        }
      }

      const sessionData = {
        id: admin.id,
        email: admin.email,
        role: "ANIMUS_ADMIN" as const,
      };

      const token = await createSessionCookie(sessionData);
      const redirectUrl = "/admin";

      cookies().set("access_token", token, {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        maxAge: 60 * 60 * 8, // 8 hours
      });

      cookies().set("session", JSON.stringify(sessionData), {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        maxAge: 60 * 60 * 8,
      });

      return NextResponse.json({ success: true, redirectUrl, session: sessionData });
    }

    // 2. Query Enterprise / Auditor User Table
    const user = await prisma.user.findUnique({
      where: { email: lowerEmail },
      include: {
        organization: true,
        hub: true,
        project: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentication failed. Email not found in Sovereign Whitelist." },
        { status: 401 }
      );
    }

    if (user.status !== UserStatus.APPROVED) {
      return NextResponse.json(
        { success: false, message: "User account is pending whitelist activation." },
        { status: 403 }
      );
    }

    // 3. Validate Identifier (Hub ID or Org ID)
    if (cleanIdentifier) {
      const matchHubId = user.hubId?.toLowerCase() === cleanIdentifier.toLowerCase();
      const matchOrgId = user.orgId.toLowerCase() === cleanIdentifier.toLowerCase();
      const matchOrgDomain = user.organization.domain.toLowerCase() === cleanIdentifier.toLowerCase();

      if (!matchHubId && !matchOrgId && !matchOrgDomain) {
        return NextResponse.json(
          { success: false, message: `Access denied. Identifier '${cleanIdentifier}' does not match assigned Hub or Organization.` },
          { status: 403 }
        );
      }
    }

    // Step 1: If TOTP code is NOT provided, request TOTP challenge
    if (!totpCode) {
      return NextResponse.json(
        {
          success: false,
          requireTotp: true,
          message: "🔒 Identity verified. Enter 6-digit TOTP Authenticator code to complete login.",
        },
        { status: 200 }
      );
    }

    // Step 2: Validate 6-Digit TOTP Code
    if (user.totpSecret) {
      const isValidTotp = authenticator.check(totpCode.trim(), user.totpSecret);
      if (!isValidTotp) {
        return NextResponse.json(
          { success: false, requireTotp: true, message: "❌ Invalid 6-digit TOTP Authenticator code." },
          { status: 401 }
        );
      }
    }

    // 5. Build Session Payload & Generate Signed JWT
    const sessionData = {
      id: user.id,
      email: user.email,
      role: user.role,
      orgId: user.orgId,
      hubId: user.hubId || undefined,
      projectId: user.projectId || undefined,
      jurisdiction: user.jurisdiction || undefined,
    };

    const token = await createSessionCookie(sessionData);

    // 6. Determine Domain Redirect
    let redirectUrl = "/hub";
    if (user.role === "CROSS_HUB_AUDITOR" || user.role === "REGULATORY_AUDITOR") {
      redirectUrl = "/oversight";
    }

    cookies().set("access_token", token, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 8, // 8 hours
    });

    cookies().set("session", JSON.stringify(sessionData), {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 8,
    });

    return NextResponse.json({ success: true, redirectUrl, session: sessionData });
  } catch (error: any) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { success: false, message: "Authentication database failure.", details: error.message },
      { status: 500 }
    );
  }
}
