import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.role) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isManager = session.role === "HUB_MANAGER" || session.role === "ANIMUS_ADMIN";
    const isLead = session.role === "PROJECT_LEAD";

    if (!isManager && !isLead) {
      return NextResponse.json({ error: "Access Denied: Only Hub Managers and Project Leads can generate API keys." }, { status: 403 });
    }

    const body = await req.json();
    const { name, projectId, scope, expiresInDays } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "API Key name / label is required." }, { status: 400 });
    }

    const hubId = session.hubId || "animuslab-hq";

    // Generate cryptographically secure random raw token
    const randomHex = crypto.randomBytes(20).toString("hex");
    const rawKey = `anc_live_${randomHex}`;
    const keyPrefix = rawKey.slice(0, 16);
    const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");

    // Calculate expiration date
    let expiresAt: Date | null = null;
    if (expiresInDays && Number(expiresInDays) > 0) {
      expiresAt = new Date(Date.now() + Number(expiresInDays) * 24 * 60 * 60 * 1000);
    }

    // Determine target project
    let validProjectId = projectId;
    if (!validProjectId && isLead && session.projectId) {
      validProjectId = session.projectId;
    }

    const apiKey = await prisma.apiKey.create({
      data: {
        name: name.trim(),
        keyPrefix,
        keyHash,
        hubId,
        projectId: validProjectId || null,
        role: isManager ? "HUB_MANAGER" : "PROJECT_LEAD",
        scope: scope || "INGEST_ONLY",
        createdBy: session.id || session.email,
        expiresAt,
        isActive: true,
      },
      include: {
        project: { select: { name: true, slug: true } },
      },
    });

    return NextResponse.json({
      success: true,
      apiKey: {
        id: apiKey.id,
        name: apiKey.name,
        keyPrefix: apiKey.keyPrefix,
        scope: apiKey.scope,
        role: apiKey.role,
        projectId: apiKey.projectId,
        projectName: apiKey.project?.name || "Global Hub",
        createdAt: apiKey.createdAt,
        expiresAt: apiKey.expiresAt,
        isActive: apiKey.isActive,
      },
      rawKey, // Returned once for copy
      message: `API Key '${apiKey.name}' successfully generated. Copy and store this secret securely.`,
    });
  } catch (error: any) {
    console.error("API Key generation error:", error);
    return NextResponse.json({ error: "Failed to generate API key: " + (error.message || "") }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.role) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const keyId = searchParams.get("keyId");

    if (!keyId) {
      return NextResponse.json({ error: "Key ID is required." }, { status: 400 });
    }

    const apiKey = await prisma.apiKey.findUnique({ where: { id: keyId } });
    if (!apiKey) {
      return NextResponse.json({ error: "API Key not found." }, { status: 404 });
    }

    if (session.role !== "HUB_MANAGER" && session.role !== "ANIMUS_ADMIN" && apiKey.createdBy !== session.id) {
      return NextResponse.json({ error: "Access Denied: You cannot revoke this key." }, { status: 403 });
    }

    await prisma.apiKey.update({
      where: { id: keyId },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: `API Key '${apiKey.name}' has been revoked.`,
    });
  } catch (error: any) {
    console.error("API Key revocation error:", error);
    return NextResponse.json({ error: "Failed to revoke API key: " + (error.message || "") }, { status: 500 });
  }
}
