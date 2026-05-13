import { api } from '@/lib/api';

export type TStepStatus = 'not_started' | 'in_progress' | 'completed';
export type TRoadmapStatus = 'active' | 'completed';

export type TResource = {
  title: string;
  url: string;
};

export type TStep = {
  _id: string;
  title: string;
  description?: string;
  resources?: TResource[];
  status: TStepStatus;
  order: number;
  completedAt?: string;
};

export type TRoadmap = {
  _id: string;
  learner: string;
  title: string;
  description?: string;
  goal: string;
  steps: TStep[];
  status: TRoadmapStatus;
  isAIGenerated: boolean;
  totalSteps: number;
  completedSteps: number;
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type TCreateRoadmapPayload = {
  title: string;
  description?: string;
  goal: string;
  steps: {
    title: string;
    description?: string;
    resources?: TResource[];
    order: number;
  }[];
};

type RoadmapResponse = {
  success: boolean;
  message: string;
  data: TRoadmap | null;
};

type RoadmapListResponse = {
  success: boolean;
  message: string;
  data: TRoadmap[];
};

const getMyRoadmap = async (): Promise<TRoadmap | null> => {
  const response = await api.get<RoadmapResponse>('/roadmap/me');
  return response.data;
};

const getCompletedRoadmaps = async (): Promise<TRoadmap[]> => {
  const response = await api.get<RoadmapListResponse>('/roadmap/completed');
  return response.data;
};

const generateRoadmap = async (goal: string): Promise<TRoadmap> => {
  const response = await api.post<RoadmapResponse>('/roadmap/generate', {
    goal,
  });
  return response.data as TRoadmap;
};

const createRoadmap = async (
  payload: TCreateRoadmapPayload,
): Promise<TRoadmap> => {
  const response = await api.post<RoadmapResponse>('/roadmap/create', payload);
  return response.data as TRoadmap;
};

const updateStepStatus = async (
  roadmapId: string,
  stepId: string,
  status: TStepStatus,
): Promise<TRoadmap> => {
  const response = await api.patch<RoadmapResponse>(
    `/roadmap/${roadmapId}/steps/${stepId}`,
    { status },
  );
  return response.data as TRoadmap;
};

const deleteRoadmap = async (roadmapId: string): Promise<void> => {
  await api.delete(`/roadmap/${roadmapId}`);
};

export const roadmapService = {
  getMyRoadmap,
  getCompletedRoadmaps,
  generateRoadmap,
  createRoadmap,
  updateStepStatus,
  deleteRoadmap,
};
