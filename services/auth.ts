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
  const response = await axiosInstance.patch<SetRoleResponse>('/auth/setRole', {
    role,
  });
  return response.data;
};

const logout = async () => {
  const response = await axiosInstance.post('/auth/logout');
  return response.data;
};

export const authService = {
  register,
  login,
  googleLogin,
  setRole,
  logout,
};
