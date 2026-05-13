'use client';

import { useEffect } from 'react';
import { userService } from '../lib/services/user';
import userStore from '../store/userStore';

const useMe = () => {
  const { setUser, clearUser, setLoading } = userStore();

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
