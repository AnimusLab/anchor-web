import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import {
  createOnboardingInvitation,
  markInvitationDelivered,
  InvitationError,
} from "@/lib/onboarding/invitations";
import { sendOnboardingInvitationEmail } from "@/lib/email";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ANIMUS_ADMIN") return null;
  return session;
}

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orgId = req.nextUrl.searchParams.get("orgId") || undefined;
  const contractId = req.nextUrl.searchParams.get("contractId") || undefined;

  const invitations = await prisma.onboardingInvitation.findMany({
    where: {
      ...(orgId ? { orgId } : {}),
      ...(contractId ? { contractId } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orgId: true,
      contractId: true,
      recipientEmail: true,
      recipientName: true,
      role: true,
      expiresAt: true,
      consumedAt: true,
      revokedAt: true,
      revokedBy: true,
      deliveryStatus: true,
      deliveredAt: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ success: true, invitations });
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      orgId,
      contractId,
      recipientEmail,
      recipientName,
      role,
      expiresInMs,
    } = body ?? {};

    if (!orgId || !contractId || !recipientEmail || !role) {
      return NextResponse.json(
        {
          error:
            "orgId, contractId, recipientEmail and role are required.",
        },
        { status: 400 }
      );
    }

    if (role !== "HUB_MANAGER" && role !== "AUTHORISED_SIGNATORY") {
      return NextResponse.json(
        { error: "role must be HUB_MANAGER or AUTHORISED_SIGNATORY." },
        { status: 400 }
      );
    }

    const org = await prisma.organization.findUnique({ where: { id: orgId } });
    if (!org) {
      return NextResponse.json(
        { error: `Organization '${orgId}' not found.` },
        { status: 404 }
      );
    }

    const created = await createOnboardingInvitation({
      orgId,
      contractId,
      recipientEmail,
      recipientName,
      role,
      expiresInMs,
    });

    const delivery = await sendOnboardingInvitationEmail({
      to: recipientEmail,
      name: recipientName || recipientEmail.split("@")[0],
      orgName: org.displayName,
      onboardingUrl: created.onboardingUrl,
      expiresAt: created.expiresAt,
    });

    await markInvitationDelivered(
      created.invitationId,
      delivery.success ? "SENT" : "FAILED"
    );

    // The raw token is returned only when email delivery failed, so an
    // administrator can deliver the link manually. Never log this response.
    return NextResponse.json(
      {
        success: true,
        invitationId: created.invitationId,
        expiresAt: created.expiresAt,
        deliveryStatus: delivery.success ? "SENT" : "FAILED",
        ...(delivery.success
          ? {}
          : {
              onboardingUrl: created.onboardingUrl,
              warning:
                "Email delivery failed. Deliver this URL privately and do not log it.",
            }),
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error: any) {
    if (error instanceof InvitationError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 409 }
      );
    }
    console.error("POST /api/v1/admin/invitations error:", error);
    return NextResponse.json(
      { error: "Failed to issue onboarding invitation." },
      { status: 500 }
    );
  }
}
