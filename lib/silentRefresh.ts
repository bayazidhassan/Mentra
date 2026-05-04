import axios from 'axios';
import useAuthStore from '../store/useAuthStore';
import useUserStore from '../store/useUserStore';

export const silentRefresh = async (): Promise<boolean> => {
  try {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/refreshToken`,
      {},
      { withCredentials: true },
    );

    useAuthStore.getState().setAccessToken(res.data.data.accessToken);
    return true;
  } catch {
    useAuthStore.getState().clearAuth();
    useUserStore.getState().clearUser();
    return false;
  } finally {
    useAuthStore.getState().setAuthReady(true);
  }
};
