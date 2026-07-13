import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/verify'];
const PUBLIC_FILE_EXTENSIONS = /\.(?:svg|png|jpg|jpeg|gif|ico|css|js|webp|json|woff|woff2|ttf|otf|eot)$/i;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || PUBLIC_FILE_EXTENSIONS.test(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value || request.cookies.get('accessToken')?.value;

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|api|login|.*\\..*).*)'],
};
