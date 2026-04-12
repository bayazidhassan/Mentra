import axiosInstance from '@/lib/axios';

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
    role: 'learner' | 'mentor' | 'admin';
  } | null;
};

export type GoogleLoginResponse = {
  success: boolean;
  message: string;
  data: {
    _id: string;
    name: string;
    email: string;
    role: 'learner' | 'mentor' | 'admin';
  } | null;
};

export type MeResponse = {
  success: boolean;
  message: string;
  data: {
    _id: string;
    name: string;
    email: string;
    role: 'learner' | 'mentor' | 'admin';
    profileImage?: string;
    isVerified: boolean;
    isApproved: boolean;
    isBanned: boolean;
  } | null;
};

const register = async (
  payload: RegisterPayload,
): Promise<RegisterResponse> => {
  const response = await axiosInstance.post<RegisterResponse>(
    '/users/register',
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

const logout = async (): Promise<void> => {
  await axiosInstance.post('/auth/logout');
};

const getMe = async (): Promise<MeResponse> => {
  const response = await axiosInstance.get<MeResponse>('/users/getMe');
  return response.data;
};

export const authService = {
  register,
  login,
  googleLogin,
  logout,
  getMe,
};
