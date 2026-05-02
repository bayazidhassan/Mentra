import { jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';

const authRoutes = ['/login', '/register'];

const roleRedirectMap: Record<string, string> = {
  learner: '/dashboard/learner',
  mentor: '/dashboard/mentor',
  admin: '/dashboard/admin',
};

const roleAccessMap: Record<string, string[]> = {
  learner: [
    '/dashboard/learner',
    '/dashboard/learner/mentors',
    '/dashboard/learner/roadmap',
    '/sessions',
    '/chat',
    '/profile',
  ],
  mentor: [
    '/dashboard/mentor',
    '/dashboard/mentor/availability',
    '/dashboard/mentor/learners',
    '/dashboard/mentor/earnings',
    '/sessions',
    '/chat',
    '/profile',
  ],
  admin: [
    '/dashboard/admin',
    '/dashboard/admin/learners',
    '/dashboard/admin/mentors',
    '/dashboard/admin/sessions',
    '/dashboard/admin/settings',
    '/profile',
  ],
};

const verifyToken = async (token: string) => {
  const secret = process.env.REFRESH_TOKEN;
  if (!secret) throw new Error('Refresh token missing');

  const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));

  return payload;
};

export const proxy = async (req: NextRequest) => {
  const token = req.cookies.get('refreshToken')?.value;
  const { pathname } = req.nextUrl;

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  let role: string | null = null;

  // Verify token
  if (token) {
    try {
      const payload = await verifyToken(token);
      role = payload.role as string;
    } catch {
      const res = NextResponse.redirect(new URL('/login', req.url));
      res.cookies.delete('refreshToken');
      return res;
    }
  }

  // Block unauthenticated users
  if (!role && !isAuthRoute) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);

    return NextResponse.redirect(loginUrl);
  }

  // Redirect logged-in users away from auth pages
  if (role && isAuthRoute) {
    return NextResponse.redirect(
      new URL(roleRedirectMap[role] ?? '/', req.url),
    );
  }

  // Role-based access control
  if (role) {
    const allowedRoutes = roleAccessMap[role] || [];

    const isAllowed = allowedRoutes.some((route) => pathname.startsWith(route));

    if (!isAllowed) {
      return NextResponse.redirect(new URL(roleRedirectMap[role], req.url));
    }
  }

  return NextResponse.next();
};

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/sessions/:path*',
    '/chat/:path*',
    '/profile/:path*',
    '/login',
    '/register',
  ],
};
