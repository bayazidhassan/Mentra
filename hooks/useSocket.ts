'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import useAuthStore from '../store/useAuthStore';

// Singleton — survives re-renders
let socketInstance: Socket | null = null;

const SOCKET_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:5000';

export const useSocket = () => {
  const { accessToken } = useAuthStore();
  const [connected, setConnected] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [unreadConversations, setUnreadConversations] = useState<Set<string>>(
    new Set(),
  );
  const unreadMessageCount = unreadConversations.size;

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

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    // New chat message — increment message badge
    socket.on('unread_message', ({ conversationId }) => {
      if (window.location.pathname.startsWith('/chat')) return;
      setUnreadConversations((prev) => {
        const updated = new Set(prev);
        updated.add(conversationId);
        return updated;
      });
    });

    // New notification — increment notification badge
    socket.on('new_notification', () => {
      setUnreadNotificationCount((prev) => prev + 1);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('unread_message');
      socket.off('new_notification');
    };
  }, [accessToken]);

  const resetMessageCount = () => setUnreadConversations(new Set());
  const resetNotificationCount = () => setUnreadNotificationCount(0);

  return {
    socket: socketInstance,
    connected,
    unreadMessageCount,
    unreadNotificationCount,
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
