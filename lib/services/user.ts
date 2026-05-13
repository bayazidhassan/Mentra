import { api } from '@/lib/api';
import { fetchClient } from '@/lib/fetchClient';
import { TUser } from '../../store/userStore';

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
  return api.get<GetMeResponse>('/users/getMe');
};

const updateProfile = async (
  formData: FormData,
): Promise<UpdateProfileResponse> => {
  // FormData must NOT have Content-Type header — browser sets it automatically
  // with the correct multipart boundary
  return fetchClient<UpdateProfileResponse>('/users/updateProfile', {
    method: 'PATCH',
    body: formData,
    headers: {}, // override fetchClient's default Content-Type: application/json
  });
};

const changePassword = async (
  payload: ChangePasswordPayload,
): Promise<ChangePasswordResponse> => {
  return api.patch<ChangePasswordResponse>('/users/changePassword', payload);
};

export const userService = {
  getMe,
  updateProfile,
  changePassword,
};
