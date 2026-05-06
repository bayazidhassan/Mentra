'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import useAuthStore from '../store/useAuthStore';

let socketInstance: Socket | null = null;

const SOCKET_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:5000';

export const useSocket = () => {
  const { accessToken } = useAuthStore();
  const pathname = usePathname();
  const [connected, setConnected] = useState(false);
  const [unreadSenders, setUnreadSenders] = useState<Set<string>>(new Set());
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  // Keep pathname in a ref so the socket listener always has the latest value
  // without needing to re-register the listener on every route change
  const pathnameRef = useRef(pathname);
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  // ── Connect socket ─────────────────────────────────────────────────────────
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

    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, [accessToken]);

  // ── Message badge listener — separate effect so it always has fresh state ──
  useEffect(() => {
    if (!socketInstance) return;

    const handleUnreadMessage = (data: {
      senderId: string;
      conversationId: string;
    }) => {
      // Don't show badge if user is already in this conversation
      const currentPath = pathnameRef.current;
      const isInChat = currentPath.startsWith('/chat/');

      if (isInChat) {
        // Extract conversationId from current path e.g. /chat/abc_def
        const currentConvId = currentPath.split('/chat/')[1];
        if (currentConvId && data.conversationId === currentConvId) {
          return; // user is already reading this conversation
        }
      }

      setUnreadSenders((prev) => new Set(prev).add(data.senderId));
    };

    socketInstance.on('unread_message', handleUnreadMessage);

    return () => {
      socketInstance?.off('unread_message', handleUnreadMessage);
    };
  }); // ← no dependency array — re-runs every render to always use latest state

  // ── Notification badge listener ────────────────────────────────────────────
  useEffect(() => {
    if (!socketInstance) return;

    const handleNewNotification = () => {
      setUnreadNotificationCount((prev) => prev + 1);
    };

    socketInstance.on('new_notification', handleNewNotification);

    return () => {
      socketInstance?.off('new_notification', handleNewNotification);
    };
  }); // ← no dependency array

  const resetMessageCount = () => setUnreadSenders(new Set());
  const resetNotificationCount = () => setUnreadNotificationCount(0);

  return {
    socket: socketInstance,
    connected,
    unreadMessageCount: unreadSenders.size,
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
