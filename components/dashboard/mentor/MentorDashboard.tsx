'use client';

import userStore from '@/store/userStore';

import {
  Calendar,
  CalendarCheck,
  CalendarClock,
  ChevronRight,
  Clock,
  DollarSign,
  GraduationCap,
  MessageSquareText,
  Star,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import {
  TMentorDashboardStats,
  TMentorRecentSession,
} from '../../../lib/services/mentor';

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

type Props = {
  stats: TMentorDashboardStats | null;
  recentSessions: TMentorRecentSession[];
};

const MentorDashboard = ({ stats, recentSessions }: Props) => {
  const { user } = userStore();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome text — hidden on md+ screens */}
      <div className="md:hidden">
        <p className="text-sm text-gray-500">
          Welcome back,{' '}
          <span className="font-medium text-lg text-gray-800">
            {user?.name ?? 'there'} 👋
          </span>
        </p>
        <p className="text-sm text-gray-500">
          Here&apos;s what&apos;s happening with your learning journey.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Sessions',
            value: stats?.totalSessions ?? 0,
            icon: <Calendar size={18} />,
            iconBg: 'bg-indigo-50',
            iconColor: 'text-indigo-600',
          },
          {
            label: 'Completed Sessions',
            value: stats?.completedSessions ?? 0,
            icon: <CalendarCheck size={18} />,
            iconBg: 'bg-green-50',
            iconColor: 'text-green-600',
          },
          {
            label: 'Total Earnings',
            value: `$${(stats?.totalEarnings ?? 0).toFixed(2)}`,
            icon: <DollarSign size={18} />,
            iconBg: 'bg-emerald-50',
            iconColor: 'text-emerald-600',
          },
          {
            label: 'Average Rating',
            value:
              stats?.rating && stats.rating > 0
                ? `${stats.rating.toFixed(1)} ★`
                : '0',
            icon: <Star size={18} />,
            iconBg: 'bg-yellow-50',
            iconColor: 'text-yellow-600',
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
            <div className="flex flex-col items-center">
              <p
                className="text-lg md:text-2xl font-semibold md:font-bold text-gray-900"
                style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
              >
                {stat.value}
              </p>
              <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Second row stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            label: 'Pending Requests',
            value: stats?.pendingSessions ?? 0,
            icon: <Clock size={18} />,
            iconBg: 'bg-yellow-50',
            iconColor: 'text-yellow-600',
            href: '/sessions',
          },
          {
            label: 'Upcoming Sessions',
            value: stats?.acceptedSessions ?? 0,
            icon: <CalendarClock size={18} />,
            iconBg: 'bg-purple-50',
            iconColor: 'text-purple-600',
            href: '/sessions',
          },
          {
            label: 'Total Reviews',
            value: stats?.totalReviews ?? 0,
            icon: <MessageSquareText size={18} />,
            iconBg: 'bg-indigo-50',
            iconColor: 'text-indigo-600',
            href: null,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-gray-200 rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-9 h-9 ${stat.iconBg} ${stat.iconColor} rounded-xl flex items-center justify-center`}
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
            <div className="flex flex-col items-center">
              <p
                className="text-lg md:text-2xl font-semibold md:font-bold text-gray-900"
                style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
              >
                {stat.value}
              </p>
              <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
            </div>
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
                  className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100"
                >
                  {/* Learner avatar */}
                  {session.learner?.profileImage ? (
                    <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
                      <Image
                        src={session.learner.profileImage}
                        alt={session.learner.name}
                        width={36}
                        height={36}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
                      {session.learner?.name[0]?.toUpperCase() ?? 'L'}
                    </div>
                  )}

                  {/* Info + badges */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {session.title}
                    </p>

                    {/* Meta row — wraps gracefully on small screens */}
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                      <p className="text-xs text-gray-400">
                        {session.learner?.name ?? 'Learner'}
                      </p>
                      <span className="text-gray-300">·</span>
                      <p className="text-xs text-gray-400">
                        {new Date(session.scheduledAt).toLocaleDateString(
                          undefined,
                          {
                            month: 'short',
                            day: 'numeric',
                          },
                        )}
                      </p>
                      <span className="text-gray-300">·</span>
                      <p className="text-xs text-gray-400">
                        {session.durationMinutes} min
                      </p>
                    </div>

                    {/* Price + status — stacked under info on mobile */}
                    <div className="flex items-center gap-2 mt-2 sm:hidden">
                      {session.price !== undefined && (
                        <span className="text-sm font-semibold text-gray-700">
                          ${session.price}
                        </span>
                      )}
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color}`}
                      >
                        {cfg.label}
                      </span>
                    </div>
                  </div>

                  {/* Price + status — inline on sm+ screens */}
                  <div className="hidden sm:flex items-center gap-2 shrink-0">
                    {session.price !== undefined && (
                      <span className="text-sm font-semibold text-gray-700">
                        ${session.price}
                      </span>
                    )}
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color}`}
                    >
                      {cfg.label}
                    </span>
                  </div>
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
            label: 'Availability',
            desc: 'Manage your schedule and hourly rate',
            href: '/dashboard/mentor/availability',
            icon: <CalendarCheck size={20} className="text-purple-500" />,
          },
          {
            label: 'My learners',
            desc: 'View learners you have worked with',
            href: '/dashboard/mentor/learners',
            icon: <GraduationCap size={20} className="text-indigo-500" />,
          },
          {
            label: 'Earnings',
            desc: 'Track your payment history',
            href: '/dashboard/mentor/earnings',
            icon: <DollarSign size={20} className="text-green-500" />,
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
