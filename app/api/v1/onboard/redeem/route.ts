import { NextRequest, NextResponse } from "next/server";
import { redeemAndProvisionOnboarding } from "@/lib/onboarding/provision";
import { InvitationError } from "@/lib/onboarding/invitations";
import {
  getClientIp,
  checkRateLimit,
  recordFailedAttempt,
} from "@/lib/auth/rateLimiter";

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req);
  const limit = checkRateLimit(`onboard:redeem:${clientIp}`, 5, 15 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many redemption attempts. Try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds || 900) },
      }
    );
  }

  try {
    const body = await req.json();
    const token = typeof body?.token === "string" ? body.token.trim() : "";
    const displayName =
      typeof body?.displayName === "string" ? body.displayName : undefined;

    if (!token) {
      return NextResponse.json(
        { error: "An onboarding token is required." },
        { status: 400 }
      );
    }

    const provisioned = await redeemAndProvisionOnboarding(token, {
      displayName,
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Onboarding complete. Enter the authenticator key, then sign in with your Clearance ID.",
        clearanceId: provisioned.userId,
        email: provisioned.email,
        displayName: provisioned.displayName,
        role: provisioned.role,
        orgId: provisioned.orgId,
        hubId: provisioned.hubId,
        totpSecret: provisioned.totpSecret,
        otpauthUri: provisioned.otpauthUri,
        loginUrl: "/login?portal=hub",
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error: any) {
    if (error instanceof InvitationError) {
      recordFailedAttempt(`onboard:redeem:${clientIp}`, 5, 15 * 60 * 1000);
      const status =
        error.code === "INVITATION_NOT_FOUND" ? 404 : 409;
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status }
      );
    }
    console.error("POST /api/v1/onboard/redeem error:", error);
    return NextResponse.json(
      { error: "Onboarding could not be completed." },
      { status: 500 }
    );
  }
}
