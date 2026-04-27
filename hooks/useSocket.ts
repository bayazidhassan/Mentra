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
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Don't connect if no token
    if (!accessToken) return;

    // Only create one instance
    if (!socketInstance) {
      socketInstance = io(SOCKET_URL, {
        auth: { token: accessToken }, // backend reads socket.handshake.auth.token
        withCredentials: true,
        transports: ['websocket'],
      });
    }

    const socket = socketInstance;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    // Increment unread badge when a message arrives outside chat
    socket.on('unread_message', () => {
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('unread_message');
    };
  }, [accessToken]);

  // Call this when user opens the chat page to reset badge
  const resetUnreadCount = () => setUnreadCount(0);

  return { socket: socketInstance, connected, unreadCount, resetUnreadCount };
};

// Use outside React components (e.g. in ConversationPage event handlers)
export const getSocket = () => socketInstance;

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};
