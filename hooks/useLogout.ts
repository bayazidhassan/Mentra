'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authService } from '../services/auth';
import useUserStore from '../store/useUserStore';

const useLogout = () => {
  const router = useRouter();
  const { clearUser } = useUserStore();

  const logout = async () => {
    try {
      await authService.logout();
      clearUser();
      toast.success('Logged out successfully.');
      router.push('/login');
    } catch {
      toast.error('Something went wrong.');
    }
  };

  return { logout };
};

export default useLogout;
