import axiosInstance from '@/lib/axios';

export type TUpcomingSession = {
  _id: string;
  title: string;
  scheduledAt: string;
  duration: number;
  status: 'pending' | 'confirmed';
  mentor: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
};

export type TRoadmap = {
  _id: string;
  title: string;
  goal: string;
  totalSteps: number;
  completedSteps: number;
  isAIGenerated: boolean;
  steps: {
    _id: string;
    title: string;
     description?: string;
    resources?: string[];
    status: 'not_started' | 'in_progress' | 'completed';
    order: number;
  }[];
};

export type TRecommendedMentor = {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
};

export type DashboardData = {
  sessions: TUpcomingSession[];
  roadmap: TRoadmap | null;
  mentors: TRecommendedMentor[];
};

const getUpcomingSessions = async (): Promise<TUpcomingSession[]> => {
  const response = await axiosInstance.get('/sessions/upcoming');
  return response.data.data;
};

const getMyRoadmap = async (): Promise<TRoadmap | null> => {
  const response = await axiosInstance.get('/roadmap/me');
  return response.data.data;
};

const getRecommendedMentors = async (): Promise<TRecommendedMentor[]> => {
  const response = await axiosInstance.get(
    '/users/mentors/recommended?limit=3',
  );
  return response.data.data;
};

export const dashboardService = {
  getUpcomingSessions,
  getMyRoadmap,
  getRecommendedMentors,
};
