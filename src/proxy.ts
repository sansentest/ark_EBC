import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/session';

export default async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const isProtectedRoute = path.startsWith('/ark_admin') || path.startsWith('/print');
  const isPublicRoute = path === '/ark_login';

  const cookie = request.cookies.get('session')?.value;
  const session = await decrypt(cookie);

  if (isProtectedRoute && !session?.userId) {
    return NextResponse.redirect(new URL('/ark_login', request.url));
  }

  if (isPublicRoute && session?.userId) {
    return NextResponse.redirect(new URL('/ark_admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
