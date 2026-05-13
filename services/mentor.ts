import { api } from '@/lib/api';
import { TAvailability } from '../store/useUserStore';

// ─── Types ────────────────────────────────────────────────────────────────────

export type TMentor = {
  _id: string;
  userId: string;
  name: string;
  email: string;
  profileImage?: string;
  bio?: string;
  experience?: string;
  hourlyRate?: number;
  availability?: TAvailability[];
  rating: number;
  totalReviews: number;
};

export type TSuggestedMentor = TMentor & {
  matchScore: number;
  matchReason: string;
};

type MentorsResponse = {
  success: boolean;
  message: string;
  data: {
    mentors: TMentor[];
    total: number;
    totalPages: number;
    page: number;
  };
};

type SingleMentorResponse = {
  success: boolean;
  message: string;
  data: TMentor | null;
};

type SuggestedMentorsResponse = {
  success: boolean;
  message: string;
  data: TSuggestedMentor[];
};

export type TMentorDashboardStats = {
  totalSessions: number;
  completedSessions: number;
  pendingSessions: number;
  acceptedSessions: number;
  totalEarnings: number;
  rating: number;
  totalReviews: number;
};

export type TMentorRecentSession = {
  _id: string;
  title: string;
  status: string;
  scheduledAt: string;
  durationMinutes: number;
  price?: number;
  paymentStatus?: string;
  learner: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
  } | null;
};

type MentorDashboardResponse = {
  success: boolean;
  message: string;
  data: {
    stats: TMentorDashboardStats;
    recentSessions: TMentorRecentSession[];
  };
};

type AvailabilityResponse = {
  success: boolean;
  message: string;
  data: {
    availability: TAvailability[];
    hourlyRate?: number;
  };
};

// ─── Service ──────────────────────────────────────────────────────────────────

const getMentors = async ({
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

  const response = await api.get<MentorsResponse>(
    `/mentor?${params.toString()}`,
  );
  return response.data;
};

const getMentorById = async (id: string): Promise<TMentor> => {
  const response = await api.get<SingleMentorResponse>(`/mentor/${id}`);
  return response.data as TMentor;
};

const getSuggestedMentors = async (): Promise<TSuggestedMentor[]> => {
  const response = await api.get<SuggestedMentorsResponse>('/mentor/suggested');
  return response.data ?? [];
};

const getMentorDashboardStats = async (): Promise<{
  stats: TMentorDashboardStats;
  recentSessions: TMentorRecentSession[];
}> => {
  const response = await api.get<MentorDashboardResponse>('/mentor/stats');
  return response.data;
};

const getAvailability = async (): Promise<{
  availability: TAvailability[];
  hourlyRate?: number;
}> => {
  const response = await api.get<AvailabilityResponse>('/mentor/availability');
  return response.data;
};

const updateAvailability = async (
  availability: TAvailability[],
  hourlyRate?: number,
): Promise<void> => {
  await api.patch('/mentor/availability', { availability, hourlyRate });
};

export const mentorService = {
  getMentors,
  getMentorById,
  getSuggestedMentors,
  getMentorDashboardStats,
  getAvailability,
  updateAvailability,
};
