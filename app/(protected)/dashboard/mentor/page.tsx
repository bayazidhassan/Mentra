'use client';

import useUserStore from '@/store/useUserStore';
import {
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  DollarSign,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  mentorService,
  TMentorDashboardStats,
  TMentorRecentSession,
} from '../../../../services/mentor';

const statusConfig: Record<
  string,
  { label: string; bg: string; color: string }
> = {
  pending: { label: 'Pending', bg: 'bg-yellow-50', color: 'text-yellow-700' },
  accepted: { label: 'Confirmed', bg: 'bg-green-50', color: 'text-green-700' },
  completed: {
    label: 'Completed',
    bg: 'bg-indigo-50',
    color: 'text-indigo-700',
  },
  cancelled: { label: 'Cancelled', bg: 'bg-red-50', color: 'text-red-600' },
};

const MentorDashboard = () => {
  const { user } = useUserStore();
  const [stats, setStats] = useState<TMentorDashboardStats | null>(null);
  const [recentSessions, setRecentSessions] = useState<TMentorRecentSession[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await mentorService.getMentorDashboardStats();
        setStats(data.stats);
        setRecentSessions(data.recentSessions);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-bold text-gray-900"
          style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
        >
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Here&apos;s an overview of your mentoring activity.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total sessions',
            value: stats?.totalSessions ?? 0,
            icon: <Calendar size={18} />,
            iconBg: 'bg-indigo-50',
            iconColor: 'text-indigo-600',
          },
          {
            label: 'Completed',
            value: stats?.completedSessions ?? 0,
            icon: <CheckCircle size={18} />,
            iconBg: 'bg-green-50',
            iconColor: 'text-green-600',
          },
          {
            label: 'Total earnings',
            value: `$${(stats?.totalEarnings ?? 0).toFixed(2)}`,
            icon: <DollarSign size={18} />,
            iconBg: 'bg-emerald-50',
            iconColor: 'text-emerald-600',
          },
          {
            label: 'Rating',
            value:
              stats?.rating && stats.rating > 0
                ? `${stats.rating.toFixed(1)} ★`
                : 'No ratings',
            icon: <Star size={18} />,
            iconBg: 'bg-yellow-50',
            iconColor: 'text-yellow-600',
            sub: stats?.totalReviews
              ? `${stats.totalReviews} review${stats.totalReviews !== 1 ? 's' : ''}`
              : null,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-gray-200 rounded-2xl p-5"
          >
            <div
              className={`w-9 h-9 ${stat.iconBg} ${stat.iconColor} rounded-xl flex items-center justify-center mb-3`}
            >
              {stat.icon}
            </div>
            <p
              className="text-2xl font-bold text-gray-900"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              {stat.value}
            </p>
            <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
            {'sub' in stat && stat.sub && (
              <p className="text-xs text-gray-400">{stat.sub}</p>
            )}
          </div>
        ))}
      </div>

      {/* Second row stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            label: 'Pending requests',
            value: stats?.pendingSessions ?? 0,
            icon: <Clock size={18} />,
            iconBg: 'bg-yellow-50',
            iconColor: 'text-yellow-600',
            href: '/sessions',
          },
          {
            label: 'Upcoming sessions',
            value: stats?.acceptedSessions ?? 0,
            icon: <TrendingUp size={18} />,
            iconBg: 'bg-purple-50',
            iconColor: 'text-purple-600',
            href: '/sessions',
          },
          {
            label: 'Total reviews',
            value: stats?.totalReviews ?? 0,
            icon: <Users size={18} />,
            iconBg: 'bg-indigo-50',
            iconColor: 'text-indigo-600',
            href: null,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-gray-200 rounded-2xl p-5"
          >
            <div className="flex items-start justify-between">
              <div
                className={`w-9 h-9 ${stat.iconBg} ${stat.iconColor} rounded-xl flex items-center justify-center mb-3`}
              >
                {stat.icon}
              </div>
              {stat.href && (
                <Link
                  href={stat.href}
                  className="text-xs text-indigo-600 font-medium hover:underline flex items-center gap-1"
                >
                  View <ChevronRight size={12} />
                </Link>
              )}
            </div>
            <p
              className="text-2xl font-bold text-gray-900"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              {stat.value}
            </p>
            <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent sessions */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2
            className="text-base font-semibold text-gray-900"
            style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
          >
            Recent sessions
          </h2>
          <Link
            href="/sessions"
            className="text-xs text-indigo-600 font-medium flex items-center gap-1 hover:underline"
          >
            View all <ChevronRight size={14} />
          </Link>
        </div>

        {recentSessions.length > 0 ? (
          <div className="space-y-3">
            {recentSessions.map((session) => {
              const cfg = statusConfig[session.status] ?? statusConfig.pending;
              return (
                <div
                  key={session._id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100"
                >
                  {/* Learner avatar */}
                  {session.learner?.profileImage ? (
                    <Image
                      src={session.learner.profileImage}
                      alt={session.learner.name}
                      width={36}
                      height={36}
                      className="rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
                      {session.learner?.name[0]?.toUpperCase() ?? 'L'}
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {session.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-gray-400">
                        {session.learner?.name ?? 'Learner'}
                      </p>
                      <span className="text-gray-300">·</span>
                      <p className="text-xs text-gray-400">
                        {new Date(session.scheduledAt).toLocaleDateString(
                          undefined,
                          { month: 'short', day: 'numeric' },
                        )}
                      </p>
                      <span className="text-gray-300">·</span>
                      <p className="text-xs text-gray-400">
                        {session.durationMinutes} min
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  {session.price !== undefined && (
                    <span className="text-sm font-semibold text-gray-700 shrink-0">
                      ${session.price}
                    </span>
                  )}

                  {/* Status */}
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${cfg.bg} ${cfg.color}`}
                  >
                    {cfg.label}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-3">
              <Calendar size={22} className="text-indigo-400" />
            </div>
            <p className="text-sm font-medium text-gray-700 mb-1">
              No sessions yet
            </p>
            <p className="text-xs text-gray-400">
              Sessions from learners will appear here.
            </p>
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: 'My learners',
            desc: 'View learners you have worked with',
            href: '/learners',
            icon: <Users size={20} className="text-indigo-500" />,
          },
          {
            label: 'Earnings',
            desc: 'Track your payment history',
            href: '/earnings',
            icon: <DollarSign size={20} className="text-green-500" />,
          },
          {
            label: 'Availability',
            desc: 'Manage your schedule and hourly rate',
            href: '/profile',
            icon: <Clock size={20} className="text-purple-500" />,
          },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-2xl hover:border-indigo-200 hover:-translate-y-0.5 transition-all"
          >
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
              {item.icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {item.label}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
            </div>
            <ChevronRight
              size={16}
              className="text-gray-300 ml-auto shrink-0"
            />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MentorDashboard;
