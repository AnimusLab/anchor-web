import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import { Role, AuditorType, UserSession } from "./clearance";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "anchor-governance-secret-key-change-in-production-min-32-chars"
);

export async function createSessionCookie(user: UserSession): Promise<string> {
  const token = await new SignJWT({
    sub: user.email,
    uid: user.id,
    role: user.role,
    auditorType: user.auditorType,
    orgId: user.orgId,
    hubId: user.hubId,
    projectId: user.projectId,
    jurisdiction: user.jurisdiction,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(JWT_SECRET);

  return token;
}

export async function getSession(): Promise<UserSession | null> {
  const cookieStore = cookies();
  const token = cookieStore.get("access_token")?.value || cookieStore.get("session")?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      id: payload.uid as string,
      email: payload.sub as string,
      role: payload.role as Role,
      auditorType: payload.auditorType as AuditorType | undefined,
      orgId: payload.orgId as string | undefined,
      hubId: payload.hubId as string | undefined,
      projectId: payload.projectId as string | undefined,
      jurisdiction: payload.jurisdiction as string | undefined,
    };
  } catch (err) {
    // If fallback is raw JSON (legacy format)
    try {
      const parsed = JSON.parse(token);
      if (parsed && parsed.email) {
        return {
          id: parsed.id || "user_id",
          email: parsed.email,
          role: parsed.role as Role,
          auditorType: parsed.auditorType as AuditorType | undefined,
          orgId: parsed.orgId as string | undefined,
          hubId: parsed.hubId as string | undefined,
          projectId: parsed.projectId as string | undefined,
          jurisdiction: parsed.jurisdiction as string | undefined,
        };
      }
    } catch (e) {
      // Ignore
    }
    return null;
  }
}

