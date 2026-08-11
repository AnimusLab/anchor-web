import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  cookies().delete("session");
  return NextResponse.json({ success: true });
}

export async function GET() {
  cookies().delete("session");
  // Redirect back to login page on hub
  return NextResponse.redirect("https://hub.animuslab.dev/login");
}
