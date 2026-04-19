'use client';

import useUserStore from '@/store/useUserStore';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

const roleRedirectMap: Record<string, string> = {
  learner: '/dashboard/learner',
  mentor: '/dashboard/mentor',
  admin: '/dashboard/admin',
};

const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/roadmap',
  '/sessions',
  '/chat',
];

const authRoutes = ['/login', '/register'];

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();

  const { user, isLoading } = useUserStore();

  useEffect(() => {
    const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));

    const isAuth = authRoutes.some((r) => pathname.startsWith(r));

    // 🟡 wait until user is loaded
    if (isLoading) return;

    // 🔴 not logged in
    if (isProtected && !user) {
      router.replace(`/login?redirect=${pathname}`);
      return;
    }

    // 🟡 role protection
    if (isProtected && user?.role) {
      if (
        pathname.startsWith('/dashboard/learner') &&
        user.role !== 'learner'
      ) {
        router.replace(roleRedirectMap[user.role]);
        return;
      }

      if (pathname.startsWith('/dashboard/mentor') && user.role !== 'mentor') {
        router.replace(roleRedirectMap[user.role]);
        return;
      }

      if (pathname.startsWith('/dashboard/admin') && user.role !== 'admin') {
        router.replace(roleRedirectMap[user.role]);
        return;
      }
    }

    // 🟢 block login/register when already logged in
    if (user && isAuth) {
      router.replace(roleRedirectMap[user.role]);
    }
  }, [pathname, user, isLoading, router]);

  return <>{children}</>;
};

export default AuthGuard;
