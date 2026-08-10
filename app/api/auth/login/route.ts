import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const lowerEmail = (email || "").toLowerCase();

    // Query user profile from Prisma database
    const user = await prisma.user.findUnique({
      where: { email: lowerEmail }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentication failed. Email not in Whitelist." },
        { status: 401 }
      );
    }

    if (user.status !== "APPROVED") {
      return NextResponse.json(
        { success: false, message: "User account is pending whitelist activation." },
        { status: 403 }
      );
    }

    let redirectUrl = "/hub";
    if (user.role === "AUDITOR") {
      redirectUrl = "/oversight";
    } else if (user.role === "ANIMUS_ADMIN") {
      redirectUrl = "/admin";
    }

    const sessionData = {
      id: user.id,
      email: user.email,
      role: user.role,
      auditorType: user.auditorType,
      projectId: user.projectId,
    };

    cookies().set("session", JSON.stringify(sessionData), {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({ success: true, redirectUrl, session: sessionData });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Authentication database connection failure.", details: error.message },
      { status: 500 }
    );
  }
}
