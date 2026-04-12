'use client';

import useUserStore from '@/store/useUserStore';
import axios from 'axios';
import { Calendar, Clock, DollarSign, Plus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  sessionService,
  TSession,
  TSessionStatus,
} from '../../../services/session';

const statusConfig: Record<
  TSessionStatus,
  { label: string; bg: string; text: string }
> = {
  pending: { label: 'Pending', bg: 'bg-amber-50', text: 'text-amber-600' },
  confirmed: { label: 'Confirmed', bg: 'bg-green-50', text: 'text-green-600' },
  completed: {
    label: 'Completed',
    bg: 'bg-indigo-50',
    text: 'text-indigo-600',
  },
  cancelled: { label: 'Cancelled', bg: 'bg-red-50', text: 'text-red-500' },
};

const tabs = ['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const;
type TTab = (typeof tabs)[number];

const SessionsPage = () => {
  const { user } = useUserStore();
  const [sessions, setSessions] = useState<TSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TTab>('all');

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const data = await sessionService.getMySessions();
        setSessions(data);
      } catch {
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  const handleStatusUpdate = async (id: string, status: TSessionStatus) => {
    try {
      const updated = await sessionService.updateSessionStatus(id, status);
      setSessions((prev) => prev.map((s) => (s._id === id ? updated : s)));
      toast.success('Session status updated.');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || 'Failed to update session.');
      } else {
        toast.error('Failed to update session.');
      }
    }
  };

  const filteredSessions =
    activeTab === 'all'
      ? sessions
      : sessions.filter((s) => s.status === activeTab);

  const isLearner = user?.role === 'learner';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-gray-900"
            style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
          >
            Sessions
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {sessions.length} total sessions
          </p>
        </div>
        {isLearner && (
          <Link
            href="/mentors"
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-xl transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
          >
            <Plus size={16} /> Book session
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-medium rounded-xl whitespace-nowrap transition-all cursor-pointer capitalize ${
              activeTab === tab
                ? 'text-white'
                : 'text-gray-500 bg-white border border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
            }`}
            style={
              activeTab === tab
                ? { background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }
                : {}
            }
          >
            {tab === 'all'
              ? `All (${sessions.length})`
              : `${tab} (${sessions.filter((s) => s.status === tab).length})`}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {filteredSessions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
            <Calendar size={24} className="text-indigo-400" />
          </div>
          <p className="text-sm font-medium text-gray-700 mb-1">
            No {activeTab === 'all' ? '' : activeTab} sessions
          </p>
          <p className="text-xs text-gray-400 mb-4">
            {isLearner
              ? 'Book a session with a mentor to get started'
              : 'No sessions yet'}
          </p>
          {isLearner && (
            <Link
              href="/mentors"
              className="px-4 py-2 text-xs font-medium text-white rounded-xl"
              style={{
                background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
              }}
            >
              Find mentors
            </Link>
          )}
        </div>
      )}

      {/* Sessions list */}
      <div className="space-y-4">
        {filteredSessions.map((session) => {
          const other = isLearner ? session.mentor : session.learner;
          const config = statusConfig[session.status];

          return (
            <div
              key={session._id}
              className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-indigo-200 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0">
                  {/* Avatar */}
                  {other?.profileImage ? (
                    <Image
                      src={other.profileImage}
                      alt={other.name}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold shrink-0">
                      {other?.name?.[0]?.toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 mb-0.5">
                      {session.title}
                    </h3>
                    <p className="text-xs text-gray-400 mb-2">
                      {isLearner ? 'Mentor' : 'Learner'}: {other?.name}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(session.scheduledAt).toLocaleDateString(
                          'en-US',
                          {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          },
                        )}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(session.scheduledAt).toLocaleTimeString(
                          'en-US',
                          {
                            hour: '2-digit',
                            minute: '2-digit',
                          },
                        )}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {session.duration} min
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign size={12} />
                        {session.price}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right side */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${config.bg} ${config.text}`}
                  >
                    {config.label}
                  </span>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {/* Mentor can confirm pending */}
                    {!isLearner && session.status === 'pending' && (
                      <button
                        onClick={() =>
                          handleStatusUpdate(session._id, 'confirmed')
                        }
                        className="text-xs font-medium px-3 py-1.5 bg-green-50 text-green-600 border border-green-200 rounded-lg hover:bg-green-100 transition-all cursor-pointer"
                      >
                        Confirm
                      </button>
                    )}

                    {/* Both can cancel pending/confirmed */}
                    {(session.status === 'pending' ||
                      session.status === 'confirmed') && (
                      <button
                        onClick={() =>
                          handleStatusUpdate(session._id, 'cancelled')
                        }
                        className="text-xs font-medium px-3 py-1.5 bg-red-50 text-red-500 border border-red-200 rounded-lg hover:bg-red-100 transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}

                    {/* Mentor can mark as completed */}
                    {!isLearner && session.status === 'confirmed' && (
                      <button
                        onClick={() =>
                          handleStatusUpdate(session._id, 'completed')
                        }
                        className="text-xs font-medium px-3 py-1.5 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-all cursor-pointer"
                      >
                        Complete
                      </button>
                    )}

                    <Link
                      href={`/sessions/${session._id}`}
                      className="text-xs font-medium px-3 py-1.5 bg-gray-50 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-all"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>

              {/* Description */}
              {session.description && (
                <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">
                  {session.description}
                </p>
              )}

              {/* Meeting link */}
              {session.meetingLink && session.status === 'confirmed' && (
                <a
                  href={session.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-3 pt-3 border-t border-gray-100 text-xs font-medium text-indigo-600 hover:underline"
                >
                  Join meeting →
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SessionsPage;
