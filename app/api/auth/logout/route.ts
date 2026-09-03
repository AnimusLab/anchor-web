import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revokeJwt } from "@/lib/auth/rateLimiter";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (session?.id) {
      // Revoke token server-side for remaining lifetime
      revokeJwt(session.id, Date.now() + 8 * 60 * 60 * 1000);
    }
  } catch {
    // Ignored if invalid/expired
  }

  cookies().delete("session");
  cookies().delete("access_token");
  return NextResponse.json({ success: true, message: "Logged out and session invalidated." });
}

export async function GET() {
  cookies().delete("session");
  cookies().delete("access_token");
  return NextResponse.redirect("https://hub.animuslab.dev/login");
}
