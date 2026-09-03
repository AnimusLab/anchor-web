import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PrismaClient, UserStatus } from "@prisma/client";
import { authenticator } from "otplib";
import { createSessionCookie } from "@/lib/auth/session";
import { getClientIp, checkRateLimit, recordFailedAttempt, resetRateLimit, consumeTotpToken } from "@/lib/auth/rateLimiter";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);
    const body = await request.json();
    const { email, identifier, hubId, clearanceId, totpCode, portalType } = body;

    // Check IP-level rate limiting
    const ipCheck = checkRateLimit(clientIp, 5, 15 * 60 * 1000);
    if (!ipCheck.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          message: ipCheck.message || "Too many failed attempts. Temporary lockout active.",
          retryAfterSeconds: ipCheck.retryAfterSeconds,
          lockedUntil: ipCheck.lockedUntilIso
        },
        { 
          status: 429,
          headers: {
            "Retry-After": String(ipCheck.retryAfterSeconds || 900),
            "X-RateLimit-Remaining": "0"
          }
        }
      );
    }

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Please provide Enterprise Email address." },
        { status: 400 }
      );
    }

    const lowerEmail = email ? email.trim().toLowerCase() : "";
    const cleanIdentifier = (identifier || hubId || clearanceId || "").trim();

    // Check Email/Identity-level rate limiting
    const identityKey = lowerEmail || cleanIdentifier;
    const identityCheck = checkRateLimit(`user:${identityKey}`, 5, 15 * 60 * 1000);
    if (!identityCheck.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          message: identityCheck.message || "Account temporarily locked due to excessive failed attempts.",
          retryAfterSeconds: identityCheck.retryAfterSeconds,
          lockedUntil: identityCheck.lockedUntilIso
        },
        { 
          status: 429,
          headers: {
            "Retry-After": String(identityCheck.retryAfterSeconds || 900),
            "X-RateLimit-Remaining": "0"
          }
        }
      );
    }

    // Build OR query to match by Clearance ID (id) OR Corporate Email (email)
    const userOrConditions: any[] = [];
    if (lowerEmail) userOrConditions.push({ email: lowerEmail });
    if (cleanIdentifier) userOrConditions.push({ id: cleanIdentifier });

    if (userOrConditions.length === 0) {
      return NextResponse.json(
        { success: false, message: "Please provide Clearance ID or Corporate Email." },
        { status: 400 }
      );
    }

    // 1. Check AdminUser Table — ONLY when portalType is "admin" (or unset for backward compat).
    const isAdminPortal = !portalType || portalType === "admin";

    const admin = isAdminPortal
      ? await prisma.adminUser.findFirst({
          where: { OR: userOrConditions },
        })
      : null;

    if (admin) {
      if (admin.status !== UserStatus.APPROVED) {
        return NextResponse.json(
          { success: false, message: "Authentication failed. Account not authorized." },
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

      // Step 2: Validate 6-Digit TOTP Code with Replay Prevention
      if (admin.totpSecret) {
        const isValidTotp = authenticator.check(totpCode.trim(), admin.totpSecret);
        const isNotReplayed = isValidTotp ? consumeTotpToken(`admin:${admin.id}`, totpCode) : false;

        if (!isValidTotp || !isNotReplayed) {
          const failResult = recordFailedAttempt(clientIp, 5, 15 * 60 * 1000);
          recordFailedAttempt(`user:${identityKey}`, 5, 15 * 60 * 1000);
          return NextResponse.json(
            { 
              success: false, 
              requireTotp: true, 
              message: !isValidTotp
                ? `❌ Invalid 6-digit TOTP Authenticator code. (${failResult.remaining} attempt(s) remaining before lockout).`
                : `❌ Security Alert: TOTP code was already consumed. Wait for the next 30-second token in your app.`,
              remainingAttempts: failResult.remaining
            },
            { status: 401 }
          );
        }
      }

      // Success: Clear failed attempts
      resetRateLimit(clientIp);
      resetRateLimit(`user:${identityKey}`);

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

    // 2. Query Enterprise / Auditor User Table (Matches by Clearance ID OR Email)
    const user = await prisma.user.findFirst({
      where: { OR: userOrConditions },
      include: {
        organization: true,
        hub: true,
        project: true,
      },
    });

    if (!user) {
      const failResult = recordFailedAttempt(clientIp, 5, 15 * 60 * 1000);
      recordFailedAttempt(`user:${identityKey}`, 5, 15 * 60 * 1000);
      return NextResponse.json(
        { 
          success: false, 
          message: `Authentication failed. Invalid clearance credentials or organization mapping. (${failResult.remaining} attempt(s) remaining).`,
          remainingAttempts: failResult.remaining
        },
        { status: 401 }
      );
    }

    if (user.status !== UserStatus.APPROVED) {
      return NextResponse.json(
        { success: false, message: "Authentication failed. Account pending authorization." },
        { status: 403 }
      );
    }

    // Portal Type Role Enforcement
    const isAuditorRole = ["REGULATORY_AUDITOR", "CROSS_HUB_AUDITOR", "STANDARD_AUDITOR"].includes(user.role);
    if (portalType === "admin") {
      return NextResponse.json(
        { success: false, message: "🚫 ACCESS RESTRICTED // ONLY ROOT PLATFORM ADMINS CAN AUTHENTICATE AT ROOT ADMIN GATEWAY." },
        { status: 403 }
      );
    }
    if (portalType === "oversight" && !isAuditorRole) {
      return NextResponse.json(
        { success: false, message: "🚫 ACCESS RESTRICTED // ONLY STATUTORY AUDITORS CAN AUTHENTICATE AT OVERSIGHT GATEWAY." },
        { status: 403 }
      );
    }
    if (portalType === "hub" && isAuditorRole) {
      return NextResponse.json(
        { success: false, message: "🚫 ACCESS RESTRICTED // AUDITOR ACCOUNTS MUST AUTHENTICATE AT OVERSIGHT GATEWAY (oversight.animuslab.dev)." },
        { status: 403 }
      );
    }

    // 3. Validate Identifier (Hub ID or Org ID) — Unified symmetric error to prevent oracle enumeration
    if (cleanIdentifier) {
      const matchHubId = user.hubId?.toLowerCase() === cleanIdentifier.toLowerCase();
      const matchOrgId = user.orgId.toLowerCase() === cleanIdentifier.toLowerCase();
      const matchOrgDomain = user.organization.domain.toLowerCase() === cleanIdentifier.toLowerCase();

      if (!matchHubId && !matchOrgId && !matchOrgDomain) {
        const failResult = recordFailedAttempt(clientIp, 5, 15 * 60 * 1000);
        recordFailedAttempt(`user:${identityKey}`, 5, 15 * 60 * 1000);
        return NextResponse.json(
          { 
            success: false, 
            message: `Authentication failed. Invalid clearance credentials or organization mapping. (${failResult.remaining} attempt(s) remaining).`,
            remainingAttempts: failResult.remaining
          },
          { status: 401 }
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

    // Step 2: Validate 6-Digit TOTP Code with Replay Prevention
    if (user.totpSecret) {
      const isValidTotp = authenticator.check(totpCode.trim(), user.totpSecret);
      const isNotReplayed = isValidTotp ? consumeTotpToken(`user:${user.id}`, totpCode) : false;

      if (!isValidTotp || !isNotReplayed) {
        const failResult = recordFailedAttempt(clientIp, 5, 15 * 60 * 1000);
        recordFailedAttempt(`user:${identityKey}`, 5, 15 * 60 * 1000);
        return NextResponse.json(
          { 
            success: false, 
            requireTotp: true, 
            message: !isValidTotp
              ? `❌ Invalid 6-digit TOTP Authenticator code. (${failResult.remaining} attempt(s) remaining before lockout).`
              : `❌ Security Alert: TOTP code was already consumed. Wait for the next 30-second token in your app.`,
            remainingAttempts: failResult.remaining
          },
          { status: 401 }
        );
      }
    }

    // Success: Clear failed attempts
    resetRateLimit(clientIp);
    resetRateLimit(`user:${identityKey}`);

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
