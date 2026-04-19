'use client';

import { useEffect } from 'react';
import { userService } from '../services/user';
import useUserStore from '../store/useUserStore';

const useMe = () => {
  const { setUser, clearUser, setLoading } = useUserStore();

  useEffect(() => {
    const fetchMe = async () => {
      setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [setUser, clearUser, setLoading]);
};

export default useMe;
