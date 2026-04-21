import axiosInstance from '@/lib/axios';

// ─── Types ────────────────────────────────────────────────────────────────────

export type TAvailability = {
  day: 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';
  startTime: string;
  endTime: string;
};

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
  matchScore: number; // 1–10 from AI
  matchReason: string; // one sentence explanation
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

  const response = await axiosInstance.get<MentorsResponse>(
    `/mentor?${params.toString()}`,
  );
  return response.data.data;
};

const getMentorById = async (id: string): Promise<TMentor> => {
  const response = await axiosInstance.get<SingleMentorResponse>(
    `/mentor/${id}`,
  );
  return response.data.data as TMentor;
};

const getSuggestedMentors = async (): Promise<TSuggestedMentor[]> => {
  const response =
    await axiosInstance.get<SuggestedMentorsResponse>('/mentor/suggested');
  return response.data.data ?? [];
};

export const mentorService = {
  getMentors,
  getMentorById,
  getSuggestedMentors,
};
