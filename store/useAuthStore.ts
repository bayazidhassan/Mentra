import { create } from 'zustand';

type TAuthStore = {
  accessToken: string | null;
  isAuthReady: boolean;
  setAccessToken: (token: string) => void;
  setAuthReady: (ready: boolean) => void;
  clearAuth: () => void;
};

const useAuthStore = create<TAuthStore>((set) => ({
  accessToken: null,
  isAuthReady: false,
  setAccessToken: (token) => set({ accessToken: token }),
  setAuthReady: (ready) => set({ isAuthReady: ready }),
  clearAuth: () => set({ accessToken: null }),
}));

export default useAuthStore;
