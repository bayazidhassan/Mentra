'use client';

import { useEffect } from 'react';
import { authService } from '../services/auth';
import useUserStore from '../store/useUserStore';

const useMe = () => {
  const { setUser, clearUser } = useUserStore();

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const response = await authService.getMe();
        if (response.success && response.data) {
          setUser((prev) => ({
            ...prev!,
            ...response.data,
          }));
        }
      } catch {
        clearUser();
      }
    };

    fetchMe();
  }, [setUser, clearUser]);
};

export default useMe;
