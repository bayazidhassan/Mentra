'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { disconnectSocket } from '../hooks/useSocket';
import authStore from '../store/authStore';
import userStore from '../store/userStore';

const useLogout = () => {
  const router = useRouter();
  const { clearUser } = userStore();
  const { clearAuth } = authStore();

  const logout = async () => {
    try {
      //const response = await authService.logout(); // tell Express to invalidate refresh token in DB -> but now I do not store refresh token in db
      await fetch('/api/auth/logout', { method: 'POST' }); // clear both cookies from browser
      router.replace('/login');
      disconnectSocket();
      clearUser();
      clearAuth();
      //toast.success(response.message || 'Logged out successfully.');
      toast.success('Logged out successfully.');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong.';
      toast.error(message);
    }
  };

  return { logout };
};

export default useLogout;
