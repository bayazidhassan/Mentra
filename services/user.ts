import axiosInstance from '@/lib/axios';
import { TUser } from '../store/useUserStore';

export type GetMeResponse = {
  success: boolean;
  message: string;
  data: Partial<TUser> | null;
};

export type SetRoleResponse = {
  success: boolean;
  message: string;
  data: {
    _id: string;
    name: string;
    email: string;
    role: 'learner' | 'mentor';
    profileImage: string;
  } | null;
};

export type UpdateProfileResponse = {
  success: boolean;
  message: string;
  data: Partial<TUser> | null;
};

const getMe = async (): Promise<GetMeResponse> => {
  const response = await axiosInstance.get<GetMeResponse>('/users/getMe');
  return response.data;
};

const setRole = async (
  role: 'learner' | 'mentor',
): Promise<SetRoleResponse> => {
  const response = await axiosInstance.patch<SetRoleResponse>(
    '/users/setRole',
    {
      role,
    },
  );
  return response.data;
};

const updateProfile = async (
  formData: FormData,
): Promise<UpdateProfileResponse> => {
  const response = await axiosInstance.patch<UpdateProfileResponse>(
    '/users/updateProfile',
    formData,
  );
  return response.data;
};

export const userService = {
  getMe,
  setRole,
  updateProfile,
};
