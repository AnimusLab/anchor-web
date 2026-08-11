import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  const pathname = url.pathname;

  // Bypass public static assets, API auth, and telemetry APIs
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/api/v1/telemetry/') ||
    pathname.startsWith('/api/v1/anchor/eval') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Check session cookie
  const sessionCookie = request.cookies.get('session');
  let session: any = null;
  if (sessionCookie) {
    try {
      session = JSON.parse(sessionCookie.value);
    } catch (e) {
      // Ignored
    }
  }

  // 1. Rewrite for landing.animuslab.dev or landing.localhost:3000
  if (hostname.startsWith('landing.')) {
    // Serve the root landing page (app/(marketing)/page.tsx)
    if (pathname === '/login') {
      return NextResponse.rewrite(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // 2. Force login redirection if not authenticated
  if (!session && pathname !== '/login') {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If already authenticated and visiting /login, redirect to their home portal
  if (session && pathname === '/login') {
    let homeUrl = 'https://hub.animuslab.dev';
    if (session.role === 'AUDITOR') {
      homeUrl = 'https://oversight.animuslab.dev';
    } else if (session.role === 'ANIMUS_ADMIN') {
      homeUrl = 'https://admin.animuslab.dev';
    }
    return NextResponse.redirect(new URL(homeUrl, request.url));
  }

  // 3. Subdomain Specific Role Gates & Rewrites
  
  // admin.animuslab.dev -> /admin (Requires ANIMUS_ADMIN)
  if (hostname.startsWith('admin.')) {
    if (pathname === '/login') return NextResponse.next();
    if (session?.role !== 'ANIMUS_ADMIN') {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    if (!pathname.startsWith('/admin')) {
      url.pathname = `/admin${pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  // hub.animuslab.dev -> /hub (Requires HUB_MANAGER, PROJECT_LEAD, DEVELOPER, or ANIMUS_ADMIN)
  if (hostname.startsWith('hub.')) {
    if (pathname === '/login') return NextResponse.next();
    const allowedRoles = ['HUB_MANAGER', 'PROJECT_LEAD', 'DEVELOPER', 'ANIMUS_ADMIN'];
    if (!allowedRoles.includes(session?.role || '')) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    if (!pathname.startsWith('/hub')) {
      url.pathname = `/hub${pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  // oversight.animuslab.dev -> /oversight (Requires AUDITOR or ANIMUS_ADMIN)
  if (hostname.startsWith('oversight.')) {
    if (pathname === '/login') return NextResponse.next();
    const allowedRoles = ['AUDITOR', 'ANIMUS_ADMIN'];
    if (!allowedRoles.includes(session?.role || '')) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    if (!pathname.startsWith('/oversight')) {
      url.pathname = `/oversight${pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

