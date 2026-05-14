import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/*
Middleware/Proxy cannot call Express directly and set cookies at the same time in Next.js — it can only redirect or pass through. So it hands off to the route handler which can both call Express AND set cookies in the response.
Middleware/Proxy    → only redirects
Route handler       → calls Express + sets cookie + redirects back
*/

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get('from') || '/dashboard';
  const cookieStore = await cookies();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/refreshToken`,
    {
      method: 'POST',
      headers: { Cookie: cookieStore.toString() },
    },
  );

  if (!res.ok) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const { data } = await res.json();

  const response = NextResponse.redirect(new URL(from, req.url));

  response.cookies.set('accessToken', data.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60, // 15 min -> Use * 1000 on the Express side, without * 1000 on the Next.js side.
  });

  return response;
};
