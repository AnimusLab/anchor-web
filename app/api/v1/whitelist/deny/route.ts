import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ANIMUS_ADMIN") {
      return NextResponse.json(
        { error: "Access Denied: Only Root Platform Administrators (ANIMUS_ADMIN) can deny whitelist registrations." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { whitelistId, email, reason = "Denied by Root Admin" } = body;

    if (!whitelistId && !email) {
      return NextResponse.json(
        { error: "Whitelist ID or Email is required to decline a request." },
        { status: 400 }
      );
    }

    const cleanEmail = email ? email.trim().toLowerCase() : undefined;

    // 1. Find the target whitelist record
    const whitelist = await prisma.whitelist.findFirst({
      where: {
        OR: [
          whitelistId ? { id: whitelistId } : {},
          cleanEmail ? { email: cleanEmail } : {},
        ],
      },
    });

    if (!whitelist) {
      return NextResponse.json(
        { error: "Pending whitelist registration not found." },
        { status: 404 }
      );
    }

    const targetEmail = whitelist.email.toLowerCase();

    // 2. Update or delete user record if pending
    const user = await prisma.user.findUnique({
      where: { email: targetEmail },
    });

    if (user && user.status === "PENDING") {
      await prisma.user.update({
        where: { id: user.id },
        data: { status: "REVOKED" },
      });
    }

    // 3. Mark whitelist as REVOKED (or delete from active pending queue)
    await prisma.whitelist.update({
      where: { id: whitelist.id },
      data: { status: "REVOKED" },
    });

    return NextResponse.json({
      success: true,
      message: `Registration for '${whitelist.displayName || targetEmail}' declined successfully.`,
      email: targetEmail,
      status: "REVOKED",
    });
  } catch (error: any) {
    console.error("Whitelist deny error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to decline registration request." },
      { status: 500 }
    );
  }
}
