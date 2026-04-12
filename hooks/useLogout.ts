'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authService } from '../services/auth';

const useLogout = () => {
  const router = useRouter();

  const logout = async () => {
    try {
      await authService.logout();
      toast.success('Logged out successfully.');
      router.push('/login');
    } catch {
      toast.error('Something went wrong.');
    }
  };

  return { logout };
};

export default useLogout;
