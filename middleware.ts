import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';

  // 1. Subdomain Rewrites
  // admin.animuslab.dev or admin.localhost:3000 -> /admin
  if (hostname.startsWith('admin.')) {
    if (!url.pathname.startsWith('/admin')) {
      url.pathname = `/admin${url.pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  // hub.animuslab.dev or hub.localhost:3000 -> /hub
  if (hostname.startsWith('hub.')) {
    if (!url.pathname.startsWith('/hub')) {
      url.pathname = `/hub${url.pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  // oversight.animuslab.dev or oversight.localhost:3000 -> /oversight
  if (hostname.startsWith('oversight.')) {
    if (!url.pathname.startsWith('/oversight')) {
      url.pathname = `/oversight${url.pathname}`;
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
