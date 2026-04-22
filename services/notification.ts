import axiosInstance from '@/lib/axios';

// ─── Types ────────────────────────────────────────────────────────────────────

export type TNotificationType = 'session' | 'roadmap' | 'payment' | 'system';

export type TNotification = {
  _id: string;
  user: string;
  type: TNotificationType;
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
  updatedAt: string;
};

// ─── Response types ───────────────────────────────────────────────────────────

type NotificationsResponse = {
  success: boolean;
  message: string;
  data: TNotification[];
};

type UnreadCountResponse = {
  success: boolean;
  message: string;
  data: { count: number };
};

// ─── Service ──────────────────────────────────────────────────────────────────

const getMyNotifications = async (): Promise<TNotification[]> => {
  const response =
    await axiosInstance.get<NotificationsResponse>('/notification');
  return response.data.data ?? [];
};

const getUnreadCount = async (): Promise<number> => {
  const response = await axiosInstance.get<UnreadCountResponse>(
    '/notification/unread-count',
  );
  return response.data.data?.count ?? 0;
};

const markAsRead = async (id: string): Promise<void> => {
  await axiosInstance.patch(`/notification/${id}/read`);
};

const markAllAsRead = async (): Promise<void> => {
  await axiosInstance.patch('/notification/mark-all-read');
};

export const notificationService = {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
