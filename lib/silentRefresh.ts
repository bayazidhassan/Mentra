import useAuthStore from '../store/useAuthStore';
import useUserStore from '../store/useUserStore';

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
      useAuthStore.getState().clearAuth();
      useUserStore.getState().clearUser();
      return false;
    }

    const { data } = await res.json();
    useAuthStore.getState().setAccessToken(data.accessToken);
    return true;
  } catch {
    useAuthStore.getState().clearAuth();
    useUserStore.getState().clearUser();
    return false;
  } finally {
    useAuthStore.getState().setAuthReady(true);
  }
};
