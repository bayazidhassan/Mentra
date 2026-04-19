import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TRole = 'learner' | 'mentor' | 'admin';
export type TAvailability = {
  day: 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';
  startTime: string;
  endTime: string;
};

export type TUser = {
  //user
  _id: string;
  name: string;
  email: string;
  role: TRole;
  profileImage?: string;
  phone?: string;
  google?: {
    googleId: string;
    roleUpdated: boolean;
  };
  //learner
  skills?: string[];
  //mentor
  bio?: string;
  experience?: string;
  hourlyRate?: number;
  availability?: TAvailability[];
};

type TUserStore = {
  user: TUser | null;
  setUser: (user: TUser | ((prev: TUser | null) => TUser)) => void;
  clearUser: () => void;
  isLoading: boolean;
  setLoading: (value: boolean) => void;
};

const useUserStore = create<TUserStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) =>
        set((state) => ({
          user: typeof user === 'function' ? user(state.user) : user,
        })),
      clearUser: () => set({ user: null }),
      isLoading: false,
      setLoading: (value) => set({ isLoading: value }),
    }),
    {
      name: 'user-store',
    },
  ),
);

export default useUserStore;
