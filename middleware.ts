import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  const pathname = url.pathname;

  // 1. Intelligent Subdomain Rewriting & Gateway Routing
  if (hostname.includes('admin.animuslab.dev')) {
    if (pathname === '/' || pathname === '/login') {
      url.pathname = '/admin/login';
      return NextResponse.rewrite(url);
    }
  } else if (hostname.includes('oversight.animuslab.dev')) {
    if (pathname === '/' || pathname === '/login') {
      url.pathname = '/oversight/login';
      return NextResponse.rewrite(url);
    }
  } else if (hostname.includes('hub.animuslab.dev')) {
    if (pathname === '/') {
      url.pathname = '/login';
      return NextResponse.rewrite(url);
    }
  }

  // Bypass public static assets, API auth, public showcase, public login gateways, and telemetry APIs
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/api/v1/telemetry/') ||
    pathname.startsWith('/api/v1/anchor/eval') ||
    pathname.startsWith('/design-samples') ||
    pathname.startsWith('/demo') ||
    pathname.startsWith('/docs') ||
    pathname === '/login' ||
    pathname === '/oversight/login' ||
    pathname === '/admin/login' ||
    pathname === '/' ||
    pathname === '/favicon.ico' ||
    pathname === '/icon.svg'
  ) {
    return NextResponse.next();
  }

  // Check session cookie (JWT or JSON payload)
  const sessionCookie = request.cookies.get('session') || request.cookies.get('access_token');
  let session: any = null;

  if (sessionCookie) {
    try {
      session = JSON.parse(sessionCookie.value);
    } catch (e) {
      try {
        const parts = sessionCookie.value.split('.');
        if (parts.length === 3) {
          const payloadJson = Buffer.from(parts[1], 'base64').toString('utf-8');
          const payload = JSON.parse(payloadJson);
          session = {
            id: payload.uid,
            email: payload.sub,
            role: payload.role,
            auditorType: payload.auditorType,
            orgId: payload.orgId,
            hubId: payload.hubId,
            projectId: payload.projectId,
            jurisdiction: payload.jurisdiction,
          };
        }
      } catch (err) {
        // Ignored
      }
    }
  }

  // Force login redirection if not authenticated
  if (!session) {
    let targetLogin = '/login';
    if (hostname.includes('admin.animuslab.dev')) {
      targetLogin = '/admin/login';
    } else if (hostname.includes('oversight.animuslab.dev')) {
      targetLogin = '/oversight/login';
    }

    const loginUrl = new URL(targetLogin, request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
