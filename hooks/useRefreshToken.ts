'use client';

import { useEffect } from 'react';
import { authService } from '../services/auth';
import { useAuthStore } from '../store/useAuthStore';

const useRefreshToken = () => {
  const { setAccessToken } = useAuthStore();

  useEffect(() => {
    const refresh = async () => {
      try {
        const res = await authService.refreshToken();
        if (res.success && res.data?.accessToken) {
          setAccessToken(res.data.accessToken);
        }
      } catch {
        setAccessToken(null);
      }
    };

    refresh();
  }, [setAccessToken]);
};

export default useRefreshToken;
