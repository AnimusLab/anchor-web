import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

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

const ADMIN_HOSTS = new Set(['admin.animuslab.dev', 'admin.localhost']);
const OVERSIGHT_HOSTS = new Set(['oversight.animuslab.dev', 'oversight.localhost']);
const HUB_HOSTS = new Set(['hub.animuslab.dev', 'hub.localhost']);

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const rawHost = (request.headers.get('host') || '').toLowerCase();
  const host = rawHost.split(':')[0];
  const pathname = url.pathname;

  const isAdminSubdomain = ADMIN_HOSTS.has(host);
  const isOversightSubdomain = OVERSIGHT_HOSTS.has(host);
  const isHubSubdomain = HUB_HOSTS.has(host);

  // 1. Intelligent Subdomain Gateway Rewriting
  if (isAdminSubdomain) {
    if (pathname === '/' || pathname === '/login') {
      url.pathname = '/admin/login';
      return NextResponse.rewrite(url);
    }
  } else if (isOversightSubdomain) {
    if (pathname === '/' || pathname === '/login') {
      url.pathname = '/oversight/login';
      return NextResponse.rewrite(url);
    }
  } else if (isHubSubdomain) {
    if (pathname === '/') {
      url.pathname = '/login';
      return NextResponse.rewrite(url);
    }
  }

  // 2. Bypass Public Assets, Auth APIs, Documentation, Showcase, and Gateway Logins
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/api/v1/telemetry/') ||
    pathname.startsWith('/api/v1/anchor/eval') ||
    pathname.startsWith('/design-samples') ||
    pathname.startsWith('/demo') ||
    pathname.startsWith('/docs') ||
    pathname.startsWith('/pricing') ||
    pathname.startsWith('/compare') ||
    pathname.startsWith('/benchmarks') ||
    pathname.startsWith('/case-studies') ||
    pathname === '/pricing' ||
    pathname === '/compare' ||
    pathname === '/benchmarks' ||
    pathname === '/case-studies' ||
    pathname === '/login' ||
    pathname === '/oversight/login' ||
    pathname === '/admin/login' ||
    pathname === '/' ||
    pathname === '/favicon.ico' ||
    pathname === '/icon.svg'
  ) {
    return NextResponse.next();
  }

  // 3. Cryptographically Verify Signed JWT Access Token (Strict Zero-Trust)
  const token = request.cookies.get('access_token')?.value;
  if (!token) {
    return redirectToPortalLogin(host, request);
  }

  let session: any = null;
  try {
    const secretKey = getJwtSecret();
    const { payload } = await jwtVerify(token, secretKey, { algorithms: ['HS256'] });
    session = {
      id: payload.uid as string,
      email: payload.sub as string,
      role: payload.role as string,
      auditorType: payload.auditorType as string | undefined,
      orgId: payload.orgId as string | undefined,
      hubId: payload.hubId as string | undefined,
      projectId: payload.projectId as string | undefined,
      jurisdiction: payload.jurisdiction as string | undefined,
    };
  } catch (err: any) {
    console.warn(`[Middleware JWT Error] token verify failed: ${err?.message || err}`);
    return redirectToPortalLogin(host, request, true);
  }

  // 4. Force Login Redirection if Payload Missing or Invalid Role
  if (!session || !session.role) {
    return redirectToPortalLogin(host, request, true);
  }

  // 5. Strict Subdomain Role-Based Access Control (RBAC) Enforcement
  const role = (session.role || '').toUpperCase();

  // A. Admin Subdomain (/admin/*): Strictly requires ANIMUS_ADMIN
  if (isAdminSubdomain || pathname.startsWith('/admin')) {
    if (role !== 'ANIMUS_ADMIN') {
      console.warn(`[RBAC Guard] Denied ${session.email} (${role}) access to Admin Portal.`);
      return redirectToPortalLogin(host, request, true);
    }
  }

  // B. Oversight Subdomain (/oversight/*): Strictly requires Statutory / Cross-Hub Auditors
  else if (isOversightSubdomain || pathname.startsWith('/oversight')) {
    const isAuditor = ['REGULATORY_AUDITOR', 'CROSS_HUB_AUDITOR', 'STANDARD_AUDITOR'].includes(role);
    if (!isAuditor) {
      console.warn(`[RBAC Guard] Denied ${session.email} (${role}) access to Oversight Portal.`);
      return redirectToPortalLogin(host, request, true);
    }
  }

  // C. Hub Subdomain (/hub/*): Strictly requires Hub Manager, Project Lead, or Developer
  else if (isHubSubdomain || pathname.startsWith('/hub')) {
    const isHubPersonnel = ['HUB_MANAGER', 'PROJECT_LEAD', 'DEVELOPER'].includes(role);
    if (!isHubPersonnel) {
      console.warn(`[RBAC Guard] Denied ${session.email} (${role}) access to Hub Portal.`);
      return redirectToPortalLogin(host, request, true);
    }
  }

  return NextResponse.next();
}

function redirectToPortalLogin(host: string, request: NextRequest, clearCookies = false) {
  let targetLogin = '/login';
  const pathname = request.nextUrl.pathname;
  if (ADMIN_HOSTS.has(host) || pathname.startsWith('/admin')) {
    targetLogin = '/admin/login';
  } else if (OVERSIGHT_HOSTS.has(host) || pathname.startsWith('/oversight')) {
    targetLogin = '/oversight/login';
  }

  const loginUrl = new URL(targetLogin, request.url);
  const response = NextResponse.redirect(loginUrl);

  if (clearCookies) {
    response.cookies.delete('session');
    response.cookies.delete('access_token');
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

