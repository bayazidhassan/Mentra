import axiosInstance from '@/lib/axios';
import { TUser } from '../store/useUserStore';

type TRole = 'learner' | 'mentor' | 'admin';

export type RegisterPayload = {
  name: string;
  email: string;
  role: 'learner' | 'mentor';
  password: string;
};

export type RegisterResponse = {
  success: boolean;
  message: string;
  data: {
    _id: string;
    name: string;
    email: string;
    role: 'learner' | 'mentor';
  } | null;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  success: boolean;
  message: string;
  data: {
    _id: string;
    name: string;
    email: string;
    role: TRole;
  } | null;
};

export type GoogleLoginResponse = {
  success: boolean;
  message: string;
  data: {
    _id: string;
    name: string;
    email: string;
    role: TRole;
    isNewUser: boolean;
  } | null;
};

export type SetRoleResponse = {
  success: boolean;
  message: string;
  data: {
    _id: string;
    name: string;
    email: string;
    role: 'learner' | 'mentor';
  } | null;
};

export type GetMeResponse = {
  success: boolean;
  message: string;
  data: Partial<TUser> | null;
};

const register = async (
  payload: RegisterPayload,
): Promise<RegisterResponse> => {
  const response = await axiosInstance.post<RegisterResponse>(
    '/auth/register',
    payload,
  );
  return response.data;
};

const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  const response = await axiosInstance.post<LoginResponse>(
    '/auth/login',
    payload,
  );
  return response.data;
};

const googleLogin = async (idToken: string): Promise<GoogleLoginResponse> => {
  const response = await axiosInstance.post<GoogleLoginResponse>(
    '/auth/googleLogin',
    {
      idToken,
    },
  );
  return response.data;
};

const setRole = async (
  role: 'learner' | 'mentor',
): Promise<SetRoleResponse> => {
  const response = await axiosInstance.post<SetRoleResponse>('/auth/setRole', {
    role,
  });
  return response.data;
};

const logout = async (): Promise<void> => {
  await axiosInstance.post('/auth/logout');
};

const getMe = async (): Promise<GetMeResponse> => {
  const response = await axiosInstance.get<GetMeResponse>('/users/getMe');
  return response.data;
};

export const authService = {
  register,
  login,
  googleLogin,
  setRole,
  logout,
  getMe,
};
