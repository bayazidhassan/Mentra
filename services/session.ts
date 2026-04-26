import axiosInstance from '@/lib/axios';

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

export type TAvailabilitySlot = {
  day: 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';
  startTime: string;
  endTime: string;
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
    availability: TAvailabilitySlot[];
    hourlyRate?: number;
    bookedSlots: { start: string; end: string }[];
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

const getMySessions = async (): Promise<TSession[]> => {
  const response = await axiosInstance.get<SessionsResponse>(
    '/session/my-sessions',
  );
  return response.data.data ?? [];
};

const acceptSession = async (sessionId: string): Promise<TSession> => {
  const response = await axiosInstance.patch<SessionResponse>(
    `/session/${sessionId}/accept`,
  );
  return response.data.data as TSession;
};

const cancelSession = async (sessionId: string): Promise<TSession> => {
  const response = await axiosInstance.patch<SessionResponse>(
    `/session/${sessionId}/cancel`,
  );
  return response.data.data as TSession;
};

const addMeetingLink = async (
  sessionId: string,
  meetingLink: string,
): Promise<TSession> => {
  const response = await axiosInstance.patch<SessionResponse>(
    `/session/${sessionId}/meeting-link`,
    { meetingLink },
  );
  return response.data.data as TSession;
};

const completeSession = async (sessionId: string): Promise<TSession> => {
  const response = await axiosInstance.patch<SessionResponse>(
    `/session/${sessionId}/complete`,
  );
  return response.data.data as TSession;
};

const rateSession = async (
  sessionId: string,
  rating: number,
  feedback?: string,
): Promise<TSession> => {
  const response = await axiosInstance.patch<SessionResponse>(
    `/session/${sessionId}/rate`,
    { rating, feedback },
  );
  return response.data.data as TSession;
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
