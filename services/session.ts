import axiosInstance from '@/lib/axios';

export type TSessionStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled';

export type TSessionUser = {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
};

export type TSession = {
  _id: string;
  title: string;
  description?: string;
  scheduledAt: string;
  duration: number;
  status: TSessionStatus;
  price: number;
  meetingLink?: string;
  mentor: TSessionUser;
  learner: TSessionUser;
};

export type TBookSessionPayload = {
  mentor: string;
  title: string;
  description?: string;
  scheduledAt: string;
  duration: number;
  price: number;
};

type SessionResponse = {
  success: boolean;
  message: string;
  data: TSession | TSession[] | null;
};

const getMySessions = async (): Promise<TSession[]> => {
  const response = await axiosInstance.get<SessionResponse>('/sessions');
  return response.data.data as TSession[];
};

const getSessionById = async (id: string): Promise<TSession> => {
  const response = await axiosInstance.get<SessionResponse>(`/sessions/${id}`);
  return response.data.data as TSession;
};

const bookSession = async (payload: TBookSessionPayload): Promise<TSession> => {
  const response = await axiosInstance.post<SessionResponse>(
    '/sessions',
    payload,
  );
  return response.data.data as TSession;
};

const updateSessionStatus = async (
  id: string,
  status: TSessionStatus,
): Promise<TSession> => {
  const response = await axiosInstance.patch<SessionResponse>(
    `/sessions/${id}/status`,
    { status },
  );
  return response.data.data as TSession;
};

export const sessionService = {
  getMySessions,
  getSessionById,
  bookSession,
  updateSessionStatus,
};
