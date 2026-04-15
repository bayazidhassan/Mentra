import { jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';

const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/roadmap',
  '/sessions',
  '/chat',
];

const authRoutes = ['/login', '/register'];

const roleRedirectMap: Record<string, string> = {
  learner: '/dashboard/learner',
  mentor: '/dashboard/mentor',
  admin: '/dashboard/admin',
};

const verifyToken = async (token: string) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET missing');

  const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));

  return payload;
};

export const proxy = async (req: NextRequest) => {
  const token = req.cookies.get('accessToken')?.value;
  const { pathname } = req.nextUrl;

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  let role: string | null = null;

  if (token) {
    try {
      const payload = await verifyToken(token);
      role = payload.role as string;
    } catch {
      const res = NextResponse.redirect(new URL('/login', req.url));
      res.cookies.delete('accessToken');
      return res;
    }
  }

  //Redirect unauthenticated users to login with original requested path
  if (isProtectedRoute && !role) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);

    return NextResponse.redirect(loginUrl);
  }

  //Role-based access
  if (isProtectedRoute && role) {
    if (pathname.startsWith('/dashboard/learner') && role !== 'learner') {
      return NextResponse.redirect(
        new URL(roleRedirectMap[role] ?? '/login', req.url),
      );
    }
    if (pathname.startsWith('/dashboard/mentor') && role !== 'mentor') {
      return NextResponse.redirect(
        new URL(roleRedirectMap[role] ?? '/login', req.url),
      );
    }
    if (pathname.startsWith('/dashboard/admin') && role !== 'admin') {
      return NextResponse.redirect(
        new URL(roleRedirectMap[role] ?? '/login', req.url),
      );
    }
  }

  //Prevent logged-in users from login/register page
  if (role && isAuthRoute) {
    return NextResponse.redirect(
      new URL(roleRedirectMap[role] ?? '/dashboard/learner', req.url),
    );
  }

  return NextResponse.next();
};

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/roadmap/:path*',
    '/sessions/:path*',
    '/chat/:path*',
    '/login',
    '/register',
    '/selectRole',
  ],
};
