import axiosInstance from '@/lib/axios';

// ─── Types ────────────────────────────────────────────────────────────────────

export type TMessage = {
  _id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  text: string;
  isRead: boolean;
  createdAt: string;
};

export type TConversationUser = {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
};

export type TConversation = {
  conversationId: string;
  otherUser: TConversationUser | null;
  lastMessage: {
    text: string;
    senderId: string;
    createdAt: string;
    isRead: boolean;
  } | null;
  unreadCount: number;
};

// ─── Response types ───────────────────────────────────────────────────────────

type ConversationsResponse = {
  success: boolean;
  message: string;
  data: TConversation[];
};

type MessagesResponse = {
  success: boolean;
  message: string;
  data: TMessage[];
};

type UnreadCountResponse = {
  success: boolean;
  message: string;
  data: { count: number };
};

type UnreadConversationsResponse = {
  success: boolean;
  message: string;
  data: { conversationIds: string[] };
};

// ─── Service ──────────────────────────────────────────────────────────────────

const getConversations = async (): Promise<TConversation[]> => {
  const response = await axiosInstance.get<ConversationsResponse>(
    '/message/conversations',
  );
  return response.data.data ?? [];
};

const getMessages = async (
  otherUserId: string,
  page = 1,
): Promise<TMessage[]> => {
  const response = await axiosInstance.get<MessagesResponse>(
    `/message/${otherUserId}?page=${page}`,
  );
  return response.data.data ?? [];
};

const sendMessage = async (
  receiverId: string,
  text: string,
): Promise<TMessage> => {
  const response = await axiosInstance.post<{
    success: boolean;
    data: TMessage;
  }>('/message/send', { receiverId, text });
  return response.data.data;
};

const markAsRead = async (otherUserId: string): Promise<void> => {
  await axiosInstance.patch(`/message/read/${otherUserId}`);
};

const getTotalUnreadCount = async (): Promise<number> => {
  const response = await axiosInstance.get<UnreadCountResponse>(
    '/message/unread-count',
  );
  return response.data.data?.count ?? 0;
};

const getUnreadConversationIds = async (): Promise<string[]> => {
  const response = await axiosInstance.get<UnreadConversationsResponse>(
    '/message/unread-conversations',
  );

  return response.data.data?.conversationIds ?? [];
};

export const messageService = {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  getTotalUnreadCount,
  getUnreadConversationIds,
};
