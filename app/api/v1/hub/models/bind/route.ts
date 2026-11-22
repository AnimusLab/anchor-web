import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.role) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAuthorized =
      session.role === "HUB_MANAGER" ||
      session.role === "PROJECT_LEAD" ||
      session.role === "ANIMUS_ADMIN";

    if (!isAuthorized) {
      return NextResponse.json({ error: "Access Denied." }, { status: 403 });
    }

    const body = await req.json();
    const { projectId, modelId } = body;

    if (!projectId || !modelId) {
      return NextResponse.json(
        { error: "Both projectId and modelId are required for binding." },
        { status: 400 }
      );
    }

    const hubId = session.hubId || "animuslab-hq";

    // Verify both belong to the hub
    const project = await prisma.project.findFirst({
      where: { id: projectId, hubId },
    });
    const model = await prisma.governedAiModel.findFirst({
      where: { id: modelId, hubId },
    });

    if (!project || !model) {
      return NextResponse.json(
        { error: "Project or AI Model not found in this Hub boundary." },
        { status: 404 }
      );
    }

    // Invariant: Binding consumes ZERO model slots and ZERO project slots
    const binding = await prisma.projectModelBinding.upsert({
      where: {
        projectId_modelId: {
          projectId,
          modelId,
        },
      },
      update: {},
      create: {
        projectId,
        modelId,
      },
      include: {
        project: { select: { name: true, slug: true } },
        model: { select: { name: true, slug: true } },
      },
    });

    return NextResponse.json({
      success: true,
      binding: {
        projectId: binding.projectId,
        projectName: binding.project.name,
        modelId: binding.modelId,
        modelName: binding.model.name,
        boundAt: binding.boundAt,
      },
      message: `Model '${binding.model.name}' successfully bound to project '${binding.project.name}'. Consumes 0 additional capacity slots.`,
    });
  } catch (error: any) {
    console.error("POST /api/v1/hub/models/bind error:", error);
    return NextResponse.json(
      { error: "Failed to bind model to project." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.role) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAuthorized =
      session.role === "HUB_MANAGER" ||
      session.role === "PROJECT_LEAD" ||
      session.role === "ANIMUS_ADMIN";

    if (!isAuthorized) {
      return NextResponse.json({ error: "Access Denied." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const modelId = searchParams.get("modelId");

    if (!projectId || !modelId) {
      return NextResponse.json(
        { error: "Both projectId and modelId query parameters are required." },
        { status: 400 }
      );
    }

    await prisma.projectModelBinding.deleteMany({
      where: { projectId, modelId },
    });

    return NextResponse.json({
      success: true,
      message: "Model unlinked from project successfully.",
    });
  } catch (error: any) {
    console.error("DELETE /api/v1/hub/models/bind error:", error);
    return NextResponse.json(
      { error: "Failed to remove binding." },
      { status: 500 }
    );
  }
}
