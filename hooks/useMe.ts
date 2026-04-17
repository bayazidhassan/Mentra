'use client';

import { useEffect } from 'react';
import { userService } from '../services/user';
import useUserStore from '../store/useUserStore';

const useMe = () => {
  const { setUser, clearUser } = useUserStore();

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const response = await userService.getMe();
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
