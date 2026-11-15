import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const authed = request.cookies.get('masarah_auth')?.value === '1';
  const { pathname } = request.nextUrl;
  const isLogin = pathname === '/login';
  const isApi = pathname.startsWith('/api');
  const isStatic = pathname.startsWith('/_next') || pathname.startsWith('/favicon');

  if (isApi || isStatic) return NextResponse.next();

  if (!authed && !isLogin) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (authed && isLogin) {
    return NextResponse.redirect(new URL('/products', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};