import { api } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

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

type MyLearnersResponse = {
  success: boolean;
  message: string;
  data: TMyLearner[];
};

type AllLearnersResponse = {
  success: boolean;
  message: string;
  data: {
    learners: TAllLearner[];
    total: number;
    totalPages: number;
  };
};

// ─── Service ──────────────────────────────────────────────────────────────────

const getMyLearners = async (): Promise<TMyLearner[]> => {
  const response = await api.get<MyLearnersResponse>('/learner/my-learners');
  return response.data ?? [];
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

  const response = await api.get<AllLearnersResponse>(
    `/learner/all-learners?${params.toString()}`,
  );
  return response.data;
};

export const learnerService = {
  getMyLearners,
  getAllLearners,
};
