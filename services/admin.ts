import axiosInstance from '@/lib/axios';

// ─── Types ────────────────────────────────────────────────────────────────────

export type TAdminStats = {
  totalLearners: number;
  totalMentors: number;
  totalUsers: number;
  totalSessions: number;
  pendingApprovals: number;
  totalRevenue: number;
  adminProfit: number;
};

export type TAdminRecentSession = {
  _id: string;
  title: string;
  status: string;
  scheduledAt: string;
  durationMinutes: number;
  price?: number;
  paymentStatus?: string;
  learnerName: string;
  mentorName: string;
};

export type TAdminLearner = {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
  isBanned: boolean;
  createdAt: string;
};

export type TAdminMentor = {
  _id: string;
  mentorProfileId?: string;
  name: string;
  email: string;
  profileImage?: string;
  isBanned: boolean;
  isApproved: boolean;
  bio?: string;
  experience?: string;
  rating: number;
  totalReviews: number;
  createdAt: string;
};

export type TAdminSession = {
  _id: string;
  title: string;
  status: string;
  scheduledAt: string;
  durationMinutes: number;
  price?: number;
  paymentStatus?: string;
  learnerName: string;
  learnerEmail: string;
  mentorName: string;
  mentorEmail: string;
  createdAt: string;
};

// ─── Response types ───────────────────────────────────────────────────────────

type StatsResponse = {
  success: boolean;
  data: { stats: TAdminStats; recentSessions: TAdminRecentSession[] };
};

type LearnersResponse = {
  success: boolean;
  data: { learners: TAdminLearner[]; total: number; totalPages: number };
};

type MentorsResponse = {
  success: boolean;
  data: { mentors: TAdminMentor[]; total: number; totalPages: number };
};

type SessionsResponse = {
  success: boolean;
  data: { sessions: TAdminSession[]; total: number; totalPages: number };
};

// ─── Service ──────────────────────────────────────────────────────────────────

const getDashboardStats = async () => {
  const res = await axiosInstance.get<StatsResponse>('/admin/stats');
  return res.data.data;
};

const getLearners = async ({
  search,
  page,
  limit,
}: {
  search?: string;
  page: number;
  limit: number;
}) => {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  params.set('page', String(page));
  params.set('limit', String(limit));
  const res = await axiosInstance.get<LearnersResponse>(
    `/admin/learners?${params}`,
  );
  return res.data.data;
};

const banUser = async (id: string) => {
  await axiosInstance.patch(`/admin/learners/${id}/ban`);
};

const unbanUser = async (id: string) => {
  await axiosInstance.patch(`/admin/learners/${id}/unban`);
};

const getMentors = async ({
  search,
  approved,
  page,
  limit,
}: {
  search?: string;
  approved: boolean;
  page: number;
  limit: number;
}) => {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  params.set('approved', String(approved));
  params.set('page', String(page));
  params.set('limit', String(limit));
  const res = await axiosInstance.get<MentorsResponse>(
    `/admin/mentors?${params}`,
  );
  return res.data.data;
};

const approveMentor = async (mentorProfileId: string) => {
  await axiosInstance.patch(`/admin/mentors/${mentorProfileId}/approve`);
};

const banMentor = async (id: string) => {
  await axiosInstance.patch(`/admin/mentors/${id}/ban`);
};

const unbanMentor = async (id: string) => {
  await axiosInstance.patch(`/admin/mentors/${id}/unban`);
};

const getSessions = async ({
  search,
  status,
  page,
  limit,
}: {
  search?: string;
  status?: string;
  page: number;
  limit: number;
}) => {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (status) params.set('status', status);
  params.set('page', String(page));
  params.set('limit', String(limit));
  const res = await axiosInstance.get<SessionsResponse>(
    `/admin/sessions?${params}`,
  );
  return res.data.data;
};

export const adminService = {
  getDashboardStats,
  getLearners,
  banUser,
  unbanUser,
  getMentors,
  approveMentor,
  banMentor,
  unbanMentor,
  getSessions,
};
