import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendCredentialWelcomeEmail } from "@/lib/email";
import { generateClearanceId } from "@/lib/auth/clearanceId";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { whitelistId, email, assignedHubId } = body;

    if (!whitelistId && !email) {
      return NextResponse.json({ error: "Whitelist ID or Email is required for approval." }, { status: 400 });
    }

    const whitelist = await prisma.whitelist.findFirst({
      where: {
        OR: [
          whitelistId ? { id: whitelistId } : {},
          email ? { email: email.trim().toLowerCase() } : {},
        ],
      },
      include: { organization: true, hub: true },
    });

    if (!whitelist) {
      return NextResponse.json({ error: "Pending whitelist registration not found." }, { status: 404 });
    }

    const cleanEmail = whitelist.email.trim().toLowerCase();
    const cleanName = whitelist.displayName || cleanEmail.split("@")[0];
    const targetRole = whitelist.role;
    const isAuditorRole = ["REGULATORY_AUDITOR", "CROSS_HUB_AUDITOR", "STANDARD_AUDITOR"].includes(targetRole);

    // 1. Check if user already exists
    let user = await prisma.user.findUnique({ where: { email: cleanEmail } });

    if (!user) {
      // Determine clearance ID
      let clearanceId = whitelist.previewClearanceId;
      if (!clearanceId) {
        if (targetRole === "REGULATORY_AUDITOR") {
          clearanceId = `AUD-${whitelist.region ? whitelist.region.toUpperCase().slice(0, 4) : "REG"}-L4-${Math.floor(100 + Math.random() * 900)}`;
        } else if (targetRole === "CROSS_HUB_AUDITOR") {
          clearanceId = `AUD-CH-L2-${Math.floor(100 + Math.random() * 900)}`;
        } else if (targetRole === "STANDARD_AUDITOR") {
          clearanceId = `AUD-SA-L1-${Math.floor(100 + Math.random() * 900)}`;
        } else {
          clearanceId = generateClearanceId(cleanName, targetRole);
        }
      }

      // Check for ID collision
      let seq = 1;
      let finalId = clearanceId;
      while (await prisma.user.findUnique({ where: { id: finalId } })) {
        seq += 1;
        finalId = `${clearanceId}-${seq}`;
      }

      // Determine default Hub if needed
      let targetHubId = assignedHubId || whitelist.hubId;
      if (!targetHubId && !isAuditorRole) {
        // Find existing hub for this org or use first active hub
        const orgHub = await prisma.hub.findFirst({ where: { orgId: whitelist.orgId } });
        targetHubId = orgHub ? orgHub.id : "animuslab-hq";
      }

      // Create User row
      user = await prisma.user.create({
        data: {
          id: finalId,
          email: cleanEmail,
          displayName: cleanName,
          role: targetRole,
          orgId: whitelist.orgId,
          hubId: targetHubId || null,
          jurisdiction: whitelist.region || "GL",
          status: "APPROVED",
          totpSecret: "JBSWY3DPEHPK3PXP",
        },
      });

      // Link UserHubAssignment if hub assigned
      if (targetHubId) {
        await prisma.userHubAssignment.create({
          data: {
            userId: user.id,
            hubId: targetHubId,
            reason: "Root Admin Whitelist Approval",
          },
        });
      }
    } else {
      // Activate existing user status
      user = await prisma.user.update({
        where: { id: user.id },
        data: { status: "APPROVED" },
      });
    }

    // 2. Update Whitelist status to APPROVED
    await prisma.whitelist.update({
      where: { id: whitelist.id },
      data: {
        status: "APPROVED",
        previewClearanceId: user.id,
      },
    });

    // 3. Dispatch Welcome Credential Email
    sendCredentialWelcomeEmail({
      to: cleanEmail,
      name: cleanName,
      clearanceId: user.id,
      hubId: user.hubId || whitelist.orgId,
      role: user.role,
      totpSecret: user.totpSecret || "JBSWY3DPEHPK3PXP",
    }).catch((err) => console.error("Welcome email dispatch error:", err));

    return NextResponse.json({
      success: true,
      user,
      clearanceId: user.id,
      message: `Registration for ${cleanName} (${user.id}) approved. Credentials dispatched via email.`,
    });
  } catch (error: any) {
    console.error("Whitelist approval error:", error);
    return NextResponse.json({ error: "Failed to approve whitelist request: " + (error.message || "") }, { status: 500 });
  }
}
