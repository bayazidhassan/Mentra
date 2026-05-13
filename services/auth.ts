import { api } from '../lib/api';

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
    user: {
      _id: string;
      name: string;
      email: string;
      role: TRole;
      profileImage?: string;
    };
    accessToken: string;
  } | null;
};

export type GoogleLoginResponse = {
  success: boolean;
  message: string;
  data: {
    user: {
      _id: string;
      name: string;
      email: string;
      role: TRole;
      profileImage?: string;
    };
    isNewUser: boolean;
    accessToken: string;
  } | null;
};

export type SetRoleResponse = {
  success: boolean;
  message: string;
  data: {
    selectedRole: 'learner' | 'mentor';
    accessToken: string;
  } | null;
};

export type ForgotPasswordResponse = {
  success: boolean;
  message: string;
  data: null;
};

export type ResetPasswordResponse = {
  success: boolean;
  message: string;
  data: null;
};

const register = async (
  payload: RegisterPayload,
): Promise<RegisterResponse> => {
  return api.post<RegisterResponse>('/auth/register', payload);
};

const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  return api.post<LoginResponse>('/auth/login', payload);
};

const googleLogin = async (idToken: string): Promise<GoogleLoginResponse> => {
  return api.post<GoogleLoginResponse>('/auth/google-Login', { idToken });
};

const setRole = async (
  role: 'learner' | 'mentor',
): Promise<SetRoleResponse> => {
  return api.patch<SetRoleResponse>('/auth/setRole', { role });
};

const forgotPassword = async (
  email: string,
): Promise<ForgotPasswordResponse> => {
  return api.post<ForgotPasswordResponse>('/auth/forgot-password', { email });
};

const resetPassword = async (
  token: string,
  password: string,
): Promise<ResetPasswordResponse> => {
  return api.post<ResetPasswordResponse>('/auth/reset-password', {
    token,
    password,
  });
};

const logout = async () => {
  return api.post('/auth/logout');
};

export const authService = {
  register,
  login,
  googleLogin,
  setRole,
  forgotPassword,
  resetPassword,
  logout,
};
