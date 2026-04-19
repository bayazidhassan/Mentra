import { create } from 'zustand';

type TAuthStore = {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
};

export const useAuthStore = create<TAuthStore>((set) => ({
  accessToken: null,
  setAccessToken: (token) => set({ accessToken: token }),
}));
