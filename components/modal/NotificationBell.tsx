'use client';

import { Bell, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useSocket } from '../../hooks/useSocket';
import {
  notificationService,
  TNotification,
} from '../../lib/services/notification';

const typeColors: Record<string, string> = {
  session: 'bg-indigo-100 text-indigo-600',
  roadmap: 'bg-purple-100 text-purple-600',
  payment: 'bg-green-100 text-green-600',
  system: 'bg-gray-100 text-gray-600',
};

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<TNotification[]>([]);
  const [polledUnreadCount, setPolledUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Real-time unread count from Socket.IO
  const { unreadNotificationCount, resetNotificationCount } = useSocket();

  // Total badge = existing unread from DB + real-time arrivals since mount
  const totalUnread = polledUnreadCount + unreadNotificationCount;

  // Fetch existing unread count once on mount (for offline notifications)
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const count = await notificationService.getUnreadCount();
        setPolledUnreadCount(count);
      } catch {}
    };
    fetchCount();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpen = async () => {
    setOpen((prev) => !prev);
    if (!open) {
      // Reset real-time count when opening
      resetNotificationCount();

      setLoading(true);
      try {
        const data = await notificationService.getMyNotifications();
        setNotifications(data);
        // Sync polled count with fresh data
        setPolledUnreadCount(data.filter((n) => !n.isRead).length);
      } catch {
      } finally {
        setLoading(false);
      }
    }
  };

  const handleMarkAsRead = async (notification: TNotification) => {
    if (!notification.isRead) {
      try {
        await notificationService.markAsRead(notification._id);
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notification._id ? { ...n, isRead: true } : n,
          ),
        );
        setPolledUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {}
    }
    if (notification.actionUrl) {
      setOpen(false);
      router.push(notification.actionUrl);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setPolledUnreadCount(0);
      resetNotificationCount();
    } catch {}
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={handleOpen}
        className="relative w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all cursor-pointer"
      >
        <Bell size={19} />
        {totalUnread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {totalUnread > 9 ? '9+' : totalUnread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 w-[min(360px,calc(100vw-80px))] sm:absolute sm:top-14 sm:left-auto sm:translate-x-0 sm:right-0 sm:w-80 bg-white border border-gray-200 rounded-2xl shadow-lg z-5 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3
              className="text-sm font-semibold text-gray-900"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              Notifications
            </h3>
            {totalUnread > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-1 text-xs text-indigo-600 font-medium hover:underline cursor-pointer"
              >
                <Check size={12} /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center h-24">
                <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {!loading && notifications.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                <Bell size={24} className="text-gray-200 mb-2" />
                <p className="text-xs text-gray-400">No notifications yet</p>
              </div>
            )}

            {!loading &&
              notifications.map((n) => (
                <button
                  key={n._id}
                  onClick={() => handleMarkAsRead(n)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${
                    !n.isRead ? 'bg-indigo-50/40' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Unread dot */}
                    <div className="mt-1 shrink-0">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          !n.isRead ? 'bg-indigo-500' : 'bg-gray-200'
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span
                          className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${typeColors[n.type]}`}
                        >
                          {n.type}
                        </span>
                        <span className="text-[10px] text-gray-400 ml-auto shrink-0">
                          {formatTime(n.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-gray-800 truncate">
                        {n.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                        {n.message}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
