'use client';

import axios from 'axios';
import {
  Calendar,
  Check,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  ExternalLink,
  Link as LinkIcon,
  Loader2,
  MessageSquare,
  Star,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import RatingModal from '../../../components/modal/RatingModal';
import { paymentService } from '../../../services/payment';
import {
  sessionService,
  TSession,
  TSessionStatus,
} from '../../../services/session';
import useUserStore from '../../../store/useUserStore';
import { buildConversationId } from '../../../utils/chat_utils';

type TTab = 'upcoming' | 'completed' | 'cancelled';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const formatTime = (dateStr: string) =>
  new Date(dateStr).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

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

// ─── Star display (read-only) ─────────────────────────────────────────────────

const StarDisplay = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        size={13}
        className={
          s <= rating
            ? 'fill-yellow-400 text-yellow-400'
            : 'fill-gray-200 text-gray-200'
        }
      />
    ))}
    <span className="text-xs text-gray-500 ml-1">{rating}/5</span>
  </div>
);

// ─── Meeting link input (mentor only) ─────────────────────────────────────────

const MeetingLinkInput = ({
  session,
  onSaved,
}: {
  session: TSession;
  onSaved: (sessionId: string, link: string) => void;
}) => {
  const [link, setLink] = useState(session.meetingLink ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!link.trim()) {
      toast.error('Please enter a meeting link.');
      return;
    }
    setSaving(true);
    try {
      await sessionService.addMeetingLink(session._id, link.trim());
      onSaved(session._id, link.trim());
      toast.success('Meeting link saved!');
    } catch (err: unknown) {
      toast.error(
        axios.isAxiosError(err)
          ? err.response?.data?.message || 'Failed to save link.'
          : 'Failed to save link.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-3 space-y-1.5">
      <p className="text-xs font-medium text-gray-600 flex items-center gap-1">
        <LinkIcon size={12} className="text-indigo-400" />
        {session.meetingLink ? 'Update meeting link' : 'Add meeting link'}
      </p>
      <div className="flex gap-2">
        <input
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://meet.google.com/..."
          className="flex-1 h-8 border border-gray-200 rounded-lg px-3 text-xs outline-none focus:border-indigo-500 transition-all"
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="h-8 px-3 text-xs font-medium text-white rounded-lg disabled:opacity-60 transition-all hover:opacity-90 flex items-center gap-1"
          style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
        >
          {saving ? <Loader2 size={12} className="animate-spin" /> : 'Save'}
        </button>
      </div>
    </div>
  );
};

// ─── Session Card ─────────────────────────────────────────────────────────────

const SessionCard = ({
  session,
  role,
  onAccept,
  onCancel,
  onPay,
  onComplete,
  onRate,
  onMeetingLinkSaved,
  actionLoading,
  payLoading,
  completeLoading,
}: {
  session: TSession;
  role: 'learner' | 'mentor';
  onAccept?: (id: string) => void;
  onCancel?: (id: string) => void;
  onPay?: (id: string) => void;
  onComplete?: (id: string) => void;
  onRate?: (session: TSession) => void;
  onMeetingLinkSaved?: (sessionId: string, link: string) => void;
  actionLoading: string | null;
  payLoading: string | null;
  completeLoading: string | null;
}) => {
  const router = useRouter();

  const cfg = statusConfig[session.status];
  const isActionLoading = actionLoading === session._id;
  const isPayLoading = payLoading === session._id;
  const isCompleteLoading = completeLoading === session._id;

  // Conditions
  const isPaid = session.paymentStatus === 'paid';
  const isAccepted = session.status === 'accepted';
  const isCompleted = session.status === 'completed';

  const showPayButton =
    role === 'learner' &&
    isAccepted &&
    !isPaid &&
    session.price !== undefined &&
    session.price > 0;

  const showMeetingLinkInput = role === 'mentor' && isAccepted && isPaid;

  const showCompleteButton = role === 'mentor' && isAccepted;

  // Has the current user already rated?
  const hasRated =
    role === 'learner'
      ? session.ratingByLearner !== undefined
      : session.ratingByMentor !== undefined;

  const showRateButton = isCompleted && !hasRated;

  // The other person's rating of you
  const theirRating =
    role === 'learner' ? session.ratingByMentor : session.ratingByLearner;
  const theirFeedback =
    role === 'learner' ? session.feedbackByMentor : session.feedbackByLearner;

  // Your rating of them
  const myRating =
    role === 'learner' ? session.ratingByLearner : session.ratingByMentor;
  const myFeedback =
    role === 'learner' ? session.feedbackByLearner : session.feedbackByMentor;

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
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Calendar size={13} className="text-indigo-400 shrink-0" />
            {formatDate(session.scheduledAt)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Clock size={13} className="text-indigo-400 shrink-0" />
            {formatTime(session.scheduledAt)} · {session.durationMinutes} min
          </div>
          {session.price !== undefined && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <DollarSign size={13} className="text-green-500 shrink-0" />$
              {session.price}
              <span
                className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                  isPaid
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {isPaid ? '✓ Paid' : 'Unpaid'}
              </span>
            </div>
          )}
          {/* Join meeting link — shown to everyone when available */}
          {session.meetingLink && (
            <a
              href={session.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-indigo-600 font-medium hover:underline"
            >
              <ExternalLink size={13} /> Join meeting
            </a>
          )}
        </div>

        {/* Meeting link input — mentor only, accepted + paid */}
        {showMeetingLinkInput && onMeetingLinkSaved && (
          <MeetingLinkInput session={session} onSaved={onMeetingLinkSaved} />
        )}

        {/* ── Ratings section (completed sessions) ── */}
        {isCompleted && (
          <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
            {/* Their rating of you */}
            {theirRating !== undefined ? (
              <div>
                <p className="text-[11px] text-gray-400 mb-1">
                  {role === 'learner'
                    ? "Mentor's rating of you"
                    : "Learner's rating of you"}
                </p>
                <StarDisplay rating={theirRating} />
                {theirFeedback && (
                  <p className="text-xs text-gray-500 mt-1 italic">
                    `&quot;`{theirFeedback}`&quot;`
                  </p>
                )}
              </div>
            ) : (
              <p className="text-[11px] text-gray-400">
                {role === 'learner'
                  ? 'Mentor has not rated yet'
                  : 'Learner has not rated yet'}
              </p>
            )}

            {/* Your rating */}
            {myRating !== undefined && (
              <div>
                <p className="text-[11px] text-gray-400 mb-1">Your rating</p>
                <StarDisplay rating={myRating} />
                {myFeedback && (
                  <p className="text-xs text-gray-500 mt-1 italic">
                    `&quot;`{myFeedback}`&quot;`
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="px-5 pb-5 flex flex-col gap-2">
        {/* Pay now */}
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

        {/* Send a message — accepted + paid */}
        {(session.status === 'accepted' || session.status === 'completed') &&
          session.paymentStatus === 'paid' && (
            <button
              onClick={() => {
                const convId = buildConversationId(
                  session.learner,
                  session.mentor,
                );
                router.push(`/chat/${convId}`);
              }}
              className="w-full h-9 flex items-center justify-center gap-1.5 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-xl hover:bg-indigo-50 transition-all cursor-pointer"
            >
              <MessageSquare size={13} /> Send a message
            </button>
          )}

        {/* Mark as completed — mentor only */}
        {showCompleteButton && (
          <button
            onClick={() => onComplete?.(session._id)}
            disabled={isCompleteLoading}
            className="w-full h-9 flex items-center justify-center gap-1.5 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-xl hover:bg-indigo-50 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            {isCompleteLoading ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <>
                <CheckCircle size={13} /> Mark as completed
              </>
            )}
          </button>
        )}

        {/* Leave a review */}
        {showRateButton && (
          <button
            onClick={() => onRate?.(session)}
            className="w-full h-9 flex items-center justify-center gap-1.5 text-xs font-medium text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-xl hover:bg-yellow-100 transition-all cursor-pointer"
          >
            <Star size={13} className="fill-yellow-400 text-yellow-400" />
            Leave a review
          </button>
        )}

        {/* Already rated badge */}
        {isCompleted && hasRated && (
          <div className="w-full h-9 flex items-center justify-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 border border-green-200 rounded-xl">
            <Check size={13} /> Review submitted
          </div>
        )}

        {/* Mentor: Accept + Decline */}
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
  const [completeLoading, setCompleteLoading] = useState<string | null>(null);
  const [ratingSession, setRatingSession] = useState<TSession | null>(null);

  // Handle Stripe return
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
      window.location.href = url;
    } catch (err: unknown) {
      toast.error(
        axios.isAxiosError(err)
          ? err.response?.data?.message || 'Failed to initiate payment.'
          : 'Failed to initiate payment.',
      );
      setPayLoading(null);
    }
  };

  const handleComplete = async (sessionId: string) => {
    if (!confirm('Mark this session as completed?')) return;
    setCompleteLoading(sessionId);
    try {
      const updated = await sessionService.completeSession(sessionId);
      setSessions((prev) =>
        prev.map((s) =>
          s._id === sessionId ? { ...s, status: updated.status } : s,
        ),
      );
      toast.success('Session marked as completed!');
      setActiveTab('completed');
    } catch (err: unknown) {
      toast.error(
        axios.isAxiosError(err)
          ? err.response?.data?.message || 'Failed to complete.'
          : 'Failed to complete.',
      );
    } finally {
      setCompleteLoading(null);
    }
  };

  const handleMeetingLinkSaved = (sessionId: string, link: string) => {
    setSessions((prev) =>
      prev.map((s) => (s._id === sessionId ? { ...s, meetingLink: link } : s)),
    );
  };

  const handleRatingSuccess = (
    sessionId: string,
    rating: number,
    feedback: string,
  ) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s._id !== sessionId) return s;
        return role === 'learner'
          ? { ...s, ratingByLearner: rating, feedbackByLearner: feedback }
          : { ...s, ratingByMentor: rating, feedbackByMentor: feedback };
      }),
    );
    setRatingSession(null);
  };

  // ── Tabs config ────────────────────────────────────────────────────────────
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
    <>
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
                onComplete={handleComplete}
                onRate={setRatingSession}
                onMeetingLinkSaved={handleMeetingLinkSaved}
                actionLoading={actionLoading}
                payLoading={payLoading}
                completeLoading={completeLoading}
              />
            ))}
          </div>
        )}
      </div>

      {/* Rating modal */}
      {ratingSession && (
        <RatingModal
          sessionId={ratingSession._id}
          sessionTitle={ratingSession.title}
          role={role}
          otherUserName={ratingSession.otherUser?.name ?? 'them'}
          onClose={() => setRatingSession(null)}
          onSuccess={handleRatingSuccess}
        />
      )}
    </>
  );
};

export default SessionsPage;
