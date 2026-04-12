import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type TRole = 'learner' | 'mentor' | 'admin';

type TUser = {
  _id: string;
  name: string;
  email: string;
  role: TRole;
  profileImage?: string;
};

type TUserStore = {
  user: TUser | null;
  setUser: (user: TUser) => void;
  clearUser: () => void;
};

const useUserStore = create<TUserStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: 'user-store',
    },
  ),
);

export default useUserStore;
