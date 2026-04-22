import axiosInstance from '@/lib/axios';

// ─── Types ────────────────────────────────────────────────────────────────────

export type TSessionStatus = 'pending' | 'accepted' | 'completed' | 'cancelled';

export type TSession = {
  _id: string;
  learner: string;
  mentor: string;
  roadmap?: string;
  title: string;
  description?: string;
  scheduledAt: string;
  durationMinutes: number;
  price?: number;
  paymentStatus?: 'unpaid' | 'paid';
  meetingLink?: string;
  status: TSessionStatus;
  ratingByLearner?: number;
  feedbackByLearner?: string;
  ratingByMentor?: number;
  feedbackByMentor?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type TAvailabilitySlot = {
  day: 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';
  startTime: string;
  endTime: string;
};

export type TBookSessionPayload = {
  mentorProfileId: string;
  title: string;
  description?: string;
  scheduledAt: string; // ISO string
  durationMinutes: number;
};

// ─── Response types ───────────────────────────────────────────────────────────

type SessionResponse = {
  success: boolean;
  message: string;
  data: TSession | null;
};

type SlotsResponse = {
  success: boolean;
  message: string;
  data: {
    availability: TAvailabilitySlot[];
    hourlyRate?: number;
  };
};

// ─── Service ──────────────────────────────────────────────────────────────────

const getAvailableSlots = async (mentorProfileId: string) => {
  const response = await axiosInstance.get<SlotsResponse>(
    `/session/slots/${mentorProfileId}`,
  );
  return response.data.data;
};

const bookSession = async (payload: TBookSessionPayload): Promise<TSession> => {
  const response = await axiosInstance.post<SessionResponse>(
    '/session/book',
    payload,
  );
  return response.data.data as TSession;
};

export const sessionService = {
  getAvailableSlots,
  bookSession,
};
