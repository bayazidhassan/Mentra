import axiosInstance from '@/lib/axios';

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
  currentStep: number;
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

const getMyRoadmap = async (): Promise<TRoadmap | null> => {
  const response = await axiosInstance.get<RoadmapResponse>('/roadmap/me');
  return response.data.data;
};

const generateRoadmap = async (goal: string): Promise<TRoadmap> => {
  const response = await axiosInstance.post<RoadmapResponse>(
    '/roadmap/generate',
    { goal },
  );
  return response.data.data as TRoadmap;
};

const createRoadmap = async (
  payload: TCreateRoadmapPayload,
): Promise<TRoadmap> => {
  const response = await axiosInstance.post<RoadmapResponse>(
    '/roadmap/create',
    payload,
  );
  return response.data.data as TRoadmap;
};

const updateStepStatus = async (
  roadmapId: string,
  stepId: string,
  status: TStepStatus,
): Promise<TRoadmap> => {
  const response = await axiosInstance.patch<RoadmapResponse>(
    `/roadmap/${roadmapId}/steps/${stepId}`,
    { status },
  );
  return response.data.data as TRoadmap;
};

const deleteRoadmap = async (roadmapId: string): Promise<void> => {
  await axiosInstance.delete(`/roadmap/${roadmapId}`);
};

export const roadmapService = {
  getMyRoadmap,
  generateRoadmap,
  createRoadmap,
  updateStepStatus,
  deleteRoadmap,
};
