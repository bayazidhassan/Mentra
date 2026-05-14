import { disconnectSocket } from '../hooks/useSocket';
import authStore from '../store/authStore';
import userStore from '../store/userStore';

export const silentRefresh = async (): Promise<boolean> => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/refreshToken`,
      {
        method: 'POST',
        credentials: 'include',
      },
    );

    if (!res.ok) {
      disconnectSocket();
      authStore.getState().clearAuth();
      userStore.getState().clearUser();
      return false;
    }

    const { data } = await res.json();
    authStore.getState().setAccessToken(data.accessToken);
    return true;
  } catch {
    disconnectSocket();
    authStore.getState().clearAuth();
    userStore.getState().clearUser();
    return false;
  } finally {
    authStore.getState().setAuthReady(true);
  }
};
