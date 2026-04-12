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
          setUser({
            _id: response.data._id,
            name: response.data.name,
            email: response.data.email,
            role: response.data.role,
            profileImage: response.data.profileImage,
          });
        }
      } catch {
        clearUser();
      }
    };

    fetchMe();
  }, [setUser, clearUser]);
};

export default useMe;
