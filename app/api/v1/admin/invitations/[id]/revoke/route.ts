import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  revokeOnboardingInvitation,
  InvitationError,
} from "@/lib/onboarding/invitations";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "ANIMUS_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await revokeOnboardingInvitation(id, session.id);
    return NextResponse.json({ success: true, invitationId: id });
  } catch (error: any) {
    if (error instanceof InvitationError) {
      const status =
        error.code === "INVITATION_NOT_FOUND" ? 404 : 409;
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status }
      );
    }
    console.error("POST /api/v1/admin/invitations/[id]/revoke error:", error);
    return NextResponse.json(
      { error: "Failed to revoke invitation." },
      { status: 500 }
    );
  }
}
