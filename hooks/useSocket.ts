'use client';

import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { messageService } from '../services/message';
import useAuthStore from '../store/useAuthStore';

let socketInstance: Socket | null = null;

const SOCKET_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:5000';

type UnreadMessagePayload = {
  conversationId: string;
  senderId?: string;
  senderName?: string;
};

export const useSocket = () => {
  const { accessToken } = useAuthStore();

  const [connected, setConnected] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  const [unreadConversations, setUnreadConversations] = useState<Set<string>>(
    new Set(),
  );

  const unreadMessageCount = unreadConversations.size;

  // ─────────────────────────────────────────────
  // SOCKET CONNECTION
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (!accessToken) return;

    if (!socketInstance) {
      socketInstance = io(SOCKET_URL, {
        auth: { token: accessToken },
        withCredentials: true,
        transports: ['websocket', 'polling'],
      });
    }

    const socket = socketInstance;

    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);

    const handleUnreadMessage = ({ conversationId }: UnreadMessagePayload) => {
      setUnreadConversations((prev) => {
        const updated = new Set(prev);
        updated.add(conversationId);
        return updated;
      });
    };

    const handleNotification = () => {
      setUnreadNotificationCount((prev) => prev + 1);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('unread_message', handleUnreadMessage);
    socket.on('new_notification', handleNotification);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('unread_message', handleUnreadMessage);
      socket.off('new_notification', handleNotification);
    };
  }, [accessToken]);

  // ─────────────────────────────────────────────
  // INITIAL LOAD FROM DB
  // ─────────────────────────────────────────────
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const conversationIds = await messageService.getUnreadConversationIds();
        setUnreadConversations(new Set(conversationIds));
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          toast.error(
            err.response?.data?.message || 'Failed to generate roadmap.',
          );
        }
      }
    };

    if (accessToken) fetchUnread();
  }, [accessToken]);

  // ─────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────
  const removeConversation = useCallback((conversationId: string) => {
    setUnreadConversations((prev) => {
      const updated = new Set(prev);
      updated.delete(conversationId);
      return updated;
    });
  }, []);
  const resetMessageCount = () => setUnreadConversations(new Set());
  const resetNotificationCount = () => setUnreadNotificationCount(0);

  return {
    socket: socketInstance,
    connected,
    unreadMessageCount,
    unreadNotificationCount,
    removeConversation,
    resetMessageCount,
    resetNotificationCount,
  };
};

export const getSocket = () => socketInstance;

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};
