import axiosInstance from '@/lib/axios';

export type TMentor = {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
};

export type TMentorsResponse = {
  mentors: TMentor[];
  total: number;
  page: number;
  totalPages: number;
};

const getMentors = async (params: {
  search?: string;
  page?: number;
  limit?: number;
}): Promise<TMentorsResponse> => {
  const response = await axiosInstance.get('/users/mentors', { params });
  return response.data.data;
};

const getMentorById = async (id: string): Promise<TMentor> => {
  const response = await axiosInstance.get(`/users/mentors/${id}`);
  return response.data.data;
};

export const mentorService = {
  getMentors,
  getMentorById,
};
