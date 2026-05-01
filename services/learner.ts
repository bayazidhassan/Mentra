// ─── Types ────────────────────────────────────────────────────────────────────

import axiosInstance from '../lib/axios';

export type TMyLearner = {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
  totalSessions: number;
  completedSessions: number;
};

export type TAllLearner = {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
};

// ─── Service ──────────────────────────────────────────────────────────────────

const getMyLearners = async (): Promise<TMyLearner[]> => {
  const response = await axiosInstance.get('/learner/my-learners');
  return response.data.data ?? [];
};

const getAllLearners = async ({
  search,
  page,
  limit,
}: {
  search?: string;
  page: number;
  limit: number;
}): Promise<{
  learners: TAllLearner[];
  total: number;
  totalPages: number;
}> => {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  params.set('page', String(page));
  params.set('limit', String(limit));
  const response = await axiosInstance.get(
    `/learner/all-learners?${params.toString()}`,
  );
  return response.data.data;
};

export const learnerService = {
  getMyLearners,
  getAllLearners,
};
