import axiosInstance from '@/lib/axios';
import { TUser } from '../store/useUserStore';

export type GetMeResponse = {
  success: boolean;
  message: string;
  data: Partial<TUser> | null;
};

export type UpdateProfileResponse = {
  success: boolean;
  message: string;
  data: Partial<TUser> | null;
};

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export type ChangePasswordResponse = {
  success: boolean;
  message: string;
  data: null;
};

const getMe = async (): Promise<GetMeResponse> => {
  const response = await axiosInstance.get<GetMeResponse>('/users/getMe');
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

const changePassword = async (
  payload: ChangePasswordPayload,
): Promise<ChangePasswordResponse> => {
  const response = await axiosInstance.patch<ChangePasswordResponse>(
    '/users/changePassword',
    payload,
  );
  return response.data;
};

export const userService = {
  getMe,
  updateProfile,
  changePassword,
};
