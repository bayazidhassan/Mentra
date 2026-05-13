import { api } from '@/lib/api';

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
  const response = await api.get<NotificationsResponse>('/notification');
  return response.data ?? [];
};

const getUnreadCount = async (): Promise<number> => {
  const response = await api.get<UnreadCountResponse>(
    '/notification/unread-count',
  );
  return response.data?.count ?? 0;
};

const markAsRead = async (id: string): Promise<void> => {
  await api.patch(`/notification/${id}/read`);
};

const markAllAsRead = async (): Promise<void> => {
  await api.patch('/notification/mark-all-read');
};

export const notificationService = {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
