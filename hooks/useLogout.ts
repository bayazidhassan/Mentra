'use client';

import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { disconnectSocket } from '../hooks/useSocket';
import { authService } from '../services/auth';
import useAuthStore from '../store/useAuthStore';
import useUserStore from '../store/useUserStore';

const useLogout = () => {
  const router = useRouter();
  const { clearUser } = useUserStore();
  const { clearAuth } = useAuthStore();

  const logout = async () => {
    try {
      const response = await authService.logout();
      disconnectSocket();
      clearUser();
      clearAuth();
      toast.success(response.message || 'Logged out successfully.');
      router.push('/login');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Something went wrong.');
      }
    }
  };

  return { logout };
};

export default useLogout;
