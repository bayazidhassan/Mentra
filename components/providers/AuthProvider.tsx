'use client';

import { silentRefresh } from '@/lib/silentRefresh';
import useAuthStore from '@/store/useAuthStore';
import { useEffect } from 'react';

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const isAuthReady = useAuthStore((s) => s.isAuthReady);

  useEffect(() => {
    silentRefresh();

    const interval = setInterval(silentRefresh, 14 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isAuthReady) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthProvider;
