'use client';

import axios from 'axios';
import {
  Calendar,
  Check,
  Clock,
  CreditCard,
  DollarSign,
  ExternalLink,
  Loader2,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { paymentService } from '../../../services/payment';
import {
  sessionService,
  TSession,
  TSessionStatus,
} from '../../../services/session';
import useUserStore from '../../../store/useUserStore';

type TTab = 'upcoming' | 'completed' | 'cancelled';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });

const formatTime = (dateStr: string) =>
  new Date(dateStr).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  }) + ' UTC';

const statusConfig: Record<
  TSessionStatus,
  { label: string; color: string; bg: string }
> = {
  pending: {
    label: 'Awaiting confirmation',
    color: 'text-yellow-700',
    bg: 'bg-yellow-50 border-yellow-200',
  },
  accepted: {
    label: 'Confirmed',
    color: 'text-green-700',
    bg: 'bg-green-50 border-green-200',
  },
  completed: {
    label: 'Completed',
    color: 'text-indigo-700',
    bg: 'bg-indigo-50 border-indigo-200',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-red-600',
    bg: 'bg-red-50 border-red-200',
  },
};

// ─── Session Card ─────────────────────────────────────────────────────────────

const SessionCard = ({
  session,
  role,
  onAccept,
  onCancel,
  onPay,
  actionLoading,
  payLoading,
}: {
  session: TSession;
  role: 'learner' | 'mentor';
  onAccept?: (id: string) => void;
  onCancel?: (id: string) => void;
  onPay?: (id: string) => void;
  actionLoading: string | null;
  payLoading: string | null;
}) => {
  const cfg = statusConfig[session.status];
  const isActionLoading = actionLoading === session._id;
  const isPayLoading = payLoading === session._id;

  // Show Pay now if: learner + accepted + unpaid + has price
  const showPayButton =
    role === 'learner' &&
    session.status === 'accepted' &&
    session.paymentStatus === 'unpaid' &&
    session.price !== undefined &&
    session.price > 0;

  return (
    <div className={`bg-white border rounded-2xl overflow-hidden ${cfg.bg}`}>
      <div className="p-5">
        {/* Title + status */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <h3
              className="text-sm font-semibold text-gray-900 truncate mb-0.5"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              {session.title}
            </h3>
            {session.description && (
              <p className="text-xs text-gray-500 line-clamp-2">
                {session.description}
              </p>
            )}
          </div>
          <span
            className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}
          >
            {cfg.label}
          </span>
        </div>

        {/* Other user */}
        {session.otherUser && (
          <div className="flex items-center gap-2 mb-4">
            {session.otherUser.profileImage ? (
              <Image
                src={session.otherUser.profileImage}
                alt={session.otherUser.name}
                width={28}
                height={28}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">
                {session.otherUser.name[0].toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-xs font-medium text-gray-700">
                {role === 'learner' ? 'Mentor' : 'Learner'}:{' '}
                {session.otherUser.name}
              </p>
              <p className="text-[11px] text-gray-400">
                {session.otherUser.email}
              </p>
            </div>
          </div>
        )}

        {/* Meta */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Calendar size={13} className="text-indigo-400 shrink-0" />
            {formatDate(session.scheduledAt)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Clock size={13} className="text-indigo-400 shrink-0" />
            {formatTime(session.scheduledAt)} · {session.durationMinutes} min
          </div>
          {session.price !== undefined && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 col-span-2">
              <DollarSign size={13} className="text-green-500 shrink-0" />$
              {session.price}
              <span
                className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                  session.paymentStatus === 'paid'
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {session.paymentStatus === 'paid' ? '✓ Paid' : 'Unpaid'}
              </span>
            </div>
          )}
          {session.meetingLink && session.status === 'accepted' && (
            <a
              href={session.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="col-span-2 flex items-center gap-1.5 text-xs text-indigo-600 font-medium hover:underline"
            >
              <ExternalLink size={13} /> Join meeting
            </a>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="px-5 pb-5 flex flex-col gap-2">
        {/* Pay now — learner only, accepted + unpaid */}
        {showPayButton && (
          <button
            onClick={() => onPay?.(session._id)}
            disabled={isPayLoading}
            className="w-full h-9 flex items-center justify-center gap-1.5 text-xs font-medium text-white rounded-xl disabled:opacity-60 disabled:cursor-not-allowed transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
          >
            {isPayLoading ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <>
                <CreditCard size={13} /> Pay now · ${session.price}
              </>
            )}
          </button>
        )}

        {/* Mentor: Accept + Decline on pending */}
        {role === 'mentor' && session.status === 'pending' && (
          <div className="flex gap-2">
            <button
              onClick={() => onAccept?.(session._id)}
              disabled={isActionLoading}
              className="flex-1 h-9 flex items-center justify-center gap-1.5 text-xs font-medium text-white rounded-xl disabled:opacity-60 disabled:cursor-not-allowed transition-all hover:opacity-90"
              style={{
                background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
              }}
            >
              {isActionLoading ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <>
                  <Check size={13} /> Accept
                </>
              )}
            </button>
            <button
              onClick={() => onCancel?.(session._id)}
              disabled={isActionLoading}
              className="flex-1 h-9 flex items-center justify-center gap-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-xl hover:bg-red-50 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {isActionLoading ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <>
                  <X size={13} /> Decline
                </>
              )}
            </button>
          </div>
        )}

        {/* Learner: Cancel on pending */}
        {role === 'learner' && session.status === 'pending' && (
          <button
            onClick={() => onCancel?.(session._id)}
            disabled={isActionLoading}
            className="w-full h-9 flex items-center justify-center gap-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-xl hover:bg-red-50 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            {isActionLoading ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <>
                <X size={13} /> Cancel request
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────

const SessionsPage = () => {
  const { user } = useUserStore();
  const role = user?.role as 'learner' | 'mentor';
  const searchParams = useSearchParams();

  const [sessions, setSessions] = useState<TSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TTab>('upcoming');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [payLoading, setPayLoading] = useState<string | null>(null);

  // Show toast on return from Stripe
  useEffect(() => {
    const payment = searchParams.get('payment');
    if (payment === 'success') {
      toast.success('Payment successful! Your session is confirmed.');
    } else if (payment === 'cancelled') {
      toast.info('Payment cancelled. You can try again anytime.');
    }
  }, [searchParams]);

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

  // ── Tab filtering ──────────────────────────────────────────────────────────
  const upcoming = sessions.filter(
    (s) => s.status === 'pending' || s.status === 'accepted',
  );
  const completed = sessions.filter((s) => s.status === 'completed');
  const cancelled = sessions.filter((s) => s.status === 'cancelled');

  const tabSessions: Record<TTab, TSession[]> = {
    upcoming,
    completed,
    cancelled,
  };

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleAccept = async (sessionId: string) => {
    setActionLoading(sessionId);
    try {
      const updated = await sessionService.acceptSession(sessionId);
      setSessions((prev) =>
        prev.map((s) =>
          s._id === sessionId ? { ...s, status: updated.status } : s,
        ),
      );
      toast.success('Session accepted!');
    } catch (err: unknown) {
      toast.error(
        axios.isAxiosError(err)
          ? err.response?.data?.message || 'Failed to accept.'
          : 'Failed to accept.',
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (sessionId: string) => {
    if (!confirm('Are you sure you want to cancel this session?')) return;
    setActionLoading(sessionId);
    try {
      const updated = await sessionService.cancelSession(sessionId);
      setSessions((prev) =>
        prev.map((s) =>
          s._id === sessionId ? { ...s, status: updated.status } : s,
        ),
      );
      toast.success('Session cancelled.');
    } catch (err: unknown) {
      toast.error(
        axios.isAxiosError(err)
          ? err.response?.data?.message || 'Failed to cancel.'
          : 'Failed to cancel.',
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handlePay = async (sessionId: string) => {
    setPayLoading(sessionId);
    try {
      const url = await paymentService.createCheckoutSession(sessionId);
      // Redirect to Stripe hosted checkout
      window.location.href = url;
    } catch (err: unknown) {
      toast.error(
        axios.isAxiosError(err)
          ? err.response?.data?.message || 'Failed to initiate payment.'
          : 'Failed to initiate payment.',
      );
      setPayLoading(null);
    }
    // Note: don't reset payLoading here — page will redirect away
  };

  // ── Tabs ───────────────────────────────────────────────────────────────────
  const tabs: { key: TTab; label: string; count: number }[] = [
    { key: 'upcoming', label: 'Upcoming', count: upcoming.length },
    { key: 'completed', label: 'Completed', count: completed.length },
    { key: 'cancelled', label: 'Cancelled', count: cancelled.length },
  ];

  const emptyMessages: Record<TTab, string> = {
    upcoming:
      role === 'learner'
        ? 'No upcoming sessions. Book a session with a mentor to get started.'
        : 'No upcoming sessions. New requests will appear here.',
    completed: 'No completed sessions yet.',
    cancelled: 'No cancelled sessions.',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-bold text-gray-900"
          style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
        >
          {role === 'learner' ? 'My sessions' : 'Session requests'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {role === 'learner'
            ? 'Track your booked sessions with mentors.'
            : 'Manage session requests from learners.'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
              activeTab === tab.key
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                  activeTab === tab.key
                    ? 'bg-indigo-100 text-indigo-600'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Session list */}
      {tabSessions[activeTab].length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
            <Calendar size={24} className="text-gray-300" />
          </div>
          <p className="text-sm text-gray-500">{emptyMessages[activeTab]}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tabSessions[activeTab].map((session) => (
            <SessionCard
              key={session._id}
              session={session}
              role={role}
              onAccept={handleAccept}
              onCancel={handleCancel}
              onPay={handlePay}
              actionLoading={actionLoading}
              payLoading={payLoading}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SessionsPage;
