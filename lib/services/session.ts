import { api } from '@/lib/api';
import { TAvailability } from '../../store/userStore';

// ─── Types ────────────────────────────────────────────────────────────────────

export type TSessionStatus = 'pending' | 'accepted' | 'completed' | 'cancelled';

export type TSessionOtherUser = {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
};

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
  otherUser: TSessionOtherUser | null;
  createdAt?: string;
  updatedAt?: string;
};

export type TBookSessionPayload = {
  mentorProfileId: string;
  title: string;
  description?: string;
  scheduledAt: string;
  durationMinutes: number;
};

// ─── Response types ───────────────────────────────────────────────────────────

type SessionResponse = {
  success: boolean;
  message: string;
  data: TSession | null;
};

type SessionsResponse = {
  success: boolean;
  message: string;
  data: TSession[];
};

type SlotsResponse = {
  success: boolean;
  message: string;
  data: {
    availability: TAvailability[];
    hourlyRate?: number;
    bookedSlots: { start: string; end: string }[];
  };
};

// ─── Service ──────────────────────────────────────────────────────────────────

const getAvailableSlots = async (mentorProfileId: string) => {
  const response = await api.get<SlotsResponse>(
    `/session/slots/${mentorProfileId}`,
  );
  return response.data;
};

const bookSession = async (payload: TBookSessionPayload): Promise<TSession> => {
  const response = await api.post<SessionResponse>('/session/book', payload);
  return response.data as TSession;
};

const getMySessions = async (): Promise<TSession[]> => {
  const response = await api.get<SessionsResponse>('/session/my-sessions');
  return response.data ?? [];
};

const acceptSession = async (sessionId: string): Promise<TSession> => {
  const response = await api.patch<SessionResponse>(
    `/session/${sessionId}/accept`,
  );
  return response.data as TSession;
};

const cancelSession = async (sessionId: string): Promise<TSession> => {
  const response = await api.patch<SessionResponse>(
    `/session/${sessionId}/cancel`,
  );
  return response.data as TSession;
};

const addMeetingLink = async (
  sessionId: string,
  meetingLink: string,
): Promise<TSession> => {
  const response = await api.patch<SessionResponse>(
    `/session/${sessionId}/meeting-link`,
    { meetingLink },
  );
  return response.data as TSession;
};

const completeSession = async (sessionId: string): Promise<TSession> => {
  const response = await api.patch<SessionResponse>(
    `/session/${sessionId}/complete`,
  );
  return response.data as TSession;
};

const rateSession = async (
  sessionId: string,
  rating: number,
  feedback?: string,
): Promise<TSession> => {
  const response = await api.patch<SessionResponse>(
    `/session/${sessionId}/rate`,
    { rating, feedback },
  );
  return response.data as TSession;
};

export const sessionService = {
  getAvailableSlots,
  bookSession,
  getMySessions,
  acceptSession,
  cancelSession,
  addMeetingLink,
  completeSession,
  rateSession,
};
