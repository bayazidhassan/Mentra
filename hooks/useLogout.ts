'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { disconnectSocket } from '../hooks/useSocket';
import { authService } from '../lib/services/auth';
import authStore from '../store/authStore';
import userStore from '../store/userStore';

const useLogout = () => {
  const router = useRouter();
  const { clearUser } = userStore();
  const { clearAuth } = authStore();

  const logout = async () => {
    try {
      const response = await authService.logout();
      disconnectSocket();
      clearUser();
      clearAuth();
      toast.success(response.message || 'Logged out successfully.');
      router.push('/login');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong.';
      toast.error(message);
    }
  };

  return { logout };
};

export default useLogout;
