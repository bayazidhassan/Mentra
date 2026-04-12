'use client';

import useUserStore from '@/store/useUserStore';
import axios from 'axios';
import {
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  ExternalLink,
  Mail,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  sessionService,
  TSession,
  TSessionStatus,
} from '../../../../services/session';

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

const SessionDetailPage = () => {
  const { id } = useParams() as { id: string };
  const { user } = useUserStore();
  const [session, setSession] = useState<TSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const isLearner = user?.role === 'learner';

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const data = await sessionService.getSessionById(id);
        setSession(data);
      } catch {
        setSession(null);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [id]);

  const handleStatusUpdate = async (status: TSessionStatus) => {
    if (!session) return;
    setUpdating(true);
    try {
      const updated = await sessionService.updateSessionStatus(
        session._id,
        status,
      );
      setSession(updated);
      toast.success('Session status updated.');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || 'Failed to update session.');
      } else {
        toast.error('Failed to update session.');
      }
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-sm font-medium text-gray-700 mb-1">
          Session not found
        </p>
        <Link
          href="/sessions"
          className="text-xs text-indigo-600 hover:underline"
        >
          Back to sessions
        </Link>
      </div>
    );
  }

  const config = statusConfig[session.status];
  const other = isLearner ? session.mentor : session.learner;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back */}
      <Link
        href="/sessions"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft size={16} /> Back to sessions
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-gray-900 mb-1"
            style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
          >
            {session.title}
          </h1>
          <span
            className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full ${config.bg} ${config.text}`}
          >
            {config.label}
          </span>
        </div>
      </div>

      {/* Session info card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        {/* Date & time */}
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
            <Calendar size={16} className="text-indigo-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Scheduled at</p>
            <p className="text-sm font-medium text-gray-800">
              {new Date(session.scheduledAt).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}{' '}
              at{' '}
              {new Date(session.scheduledAt).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>

        {/* Duration */}
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
            <Clock size={16} className="text-purple-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Duration</p>
            <p className="text-sm font-medium text-gray-800">
              {session.duration} minutes
            </p>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
            <DollarSign size={16} className="text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Price</p>
            <p className="text-sm font-medium text-gray-800">
              ${session.price}
            </p>
          </div>
        </div>

        {/* Description */}
        {session.description && (
          <div className="pb-4 border-b border-gray-100">
            <p className="text-xs text-gray-400 mb-1">Description</p>
            <p className="text-sm text-gray-700 leading-relaxed">
              {session.description}
            </p>
          </div>
        )}

        {/* Meeting link */}
        {session.meetingLink && session.status === 'confirmed' && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
              <ExternalLink size={16} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Meeting link</p>
              <a
                href={session.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-indigo-600 hover:underline"
              >
                Join meeting →
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Mentor/Learner card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <p className="text-xs font-medium text-gray-400 mb-3 uppercase tracking-wider">
          {isLearner ? 'Your mentor' : 'Your learner'}
        </p>
        <div className="flex items-center gap-3">
          {other?.profileImage ? (
            <img
              src={other.profileImage}
              alt={other.name}
              className="w-12 h-12 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold shrink-0">
              {other?.name?.[0]?.toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <User size={12} className="text-gray-400" />
              <p className="text-sm font-semibold text-gray-900">
                {other?.name}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={12} className="text-gray-400" />
              <p className="text-xs text-gray-400">{other?.email}</p>
            </div>
          </div>
          {isLearner && (
            <Link
              href={`/mentors/${session.mentor._id}`}
              className="ml-auto text-xs font-medium text-indigo-600 border border-indigo-200 px-3 py-1.5 rounded-xl hover:bg-indigo-50 transition-all"
            >
              View profile
            </Link>
          )}
        </div>
      </div>

      {/* Actions */}
      {(session.status === 'pending' || session.status === 'confirmed') && (
        <div className="flex gap-3">
          {/* Mentor confirm */}
          {!isLearner && session.status === 'pending' && (
            <button
              onClick={() => handleStatusUpdate('confirmed')}
              disabled={updating}
              className="flex-1 py-3 text-sm font-medium text-white rounded-xl disabled:opacity-60 disabled:cursor-not-allowed transition-all hover:opacity-90 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              }}
            >
              {updating ? 'Updating...' : 'Confirm session'}
            </button>
          )}

          {/* Mentor complete */}
          {!isLearner && session.status === 'confirmed' && (
            <button
              onClick={() => handleStatusUpdate('completed')}
              disabled={updating}
              className="flex-1 py-3 text-sm font-medium text-white rounded-xl disabled:opacity-60 disabled:cursor-not-allowed transition-all hover:opacity-90 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
              }}
            >
              {updating ? 'Updating...' : 'Mark as completed'}
            </button>
          )}

          {/* Both cancel */}
          <button
            onClick={() => handleStatusUpdate('cancelled')}
            disabled={updating}
            className="flex-1 py-3 text-sm font-medium text-red-500 border border-red-200 rounded-xl hover:bg-red-50 disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            {updating ? 'Updating...' : 'Cancel session'}
          </button>
        </div>
      )}
    </div>
  );
};

export default SessionDetailPage;
