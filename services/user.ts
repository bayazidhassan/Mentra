import axiosInstance from '@/lib/axios';
import { TUser } from '../store/useUserStore';

export type UpdateProfileResponse = {
  success: boolean;
  message: string;
  data: Partial<TUser> | null;
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
  updateProfile,
};
