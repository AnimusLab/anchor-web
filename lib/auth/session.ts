import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import { Role, AuditorType, UserSession } from "./clearance";

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.trim().length < 32) {
    throw new Error(
      "FATAL: JWT_SECRET environment variable is missing, empty, or shorter than 32 characters. " +
      "The application refuses to operate with an insecure or fallback secret."
    );
  }
  return new TextEncoder().encode(secret.trim());
}

export async function createSessionCookie(user: UserSession): Promise<string> {
  const secretKey = getJwtSecret();
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
    .sign(secretKey);

  return token;
}

export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) return null;

  try {
    const secretKey = getJwtSecret();
    const { payload } = await jwtVerify(token, secretKey, { algorithms: ["HS256"] });
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
    return null;
  }
}

