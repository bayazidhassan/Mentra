import axiosInstance from '@/lib/axios';

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

const logout = async (): Promise<void> => {
  await axiosInstance.post('/auth/logout');
};

export const authService = {
  register,
  login,
  googleLogin,
  logout,
};
