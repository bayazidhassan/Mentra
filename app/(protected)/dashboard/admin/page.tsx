'use client';

import useUserStore from '@/store/useUserStore';
import {
  Calendar,
  ChevronRight,
  DollarSign,
  GraduationCap,
  Shield,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AdminDashboardSkeleton } from '../../../../components/dashboard/DashboardSkeleton';
import {
  adminService,
  TAdminRecentSession,
  TAdminStats,
} from '../../../../services/admin';

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

const AdminDashboard = () => {
  const { user } = useUserStore();
  const [stats, setStats] = useState<TAdminStats | null>(null);
  const [recentSessions, setRecentSessions] = useState<TAdminRecentSession[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await adminService.getDashboardStats();
        setStats(data.stats);
        setRecentSessions(data.recentSessions);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // if (loading) {
  //   return (
  //     <div className="flex items-center justify-center h-64">
  //       <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
  //     </div>
  //   );
  // }

  if (loading) return <AdminDashboardSkeleton></AdminDashboardSkeleton>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1
          className="text-xl md:text-2xl font-bold text-gray-900"
          style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
        >
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Here&apos;s an overview of the Mentra platform.
        </p>
      </div>

      {/* Primary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total users',
            value: stats?.totalUsers ?? 0,
            sub: `${stats?.totalLearners ?? 0} learners · ${stats?.totalMentors ?? 0} mentors`,
            icon: <Users size={18} />,
            iconBg: 'bg-indigo-50',
            iconColor: 'text-indigo-600',
          },
          {
            label: 'Total sessions',
            value: stats?.totalSessions ?? 0,
            sub: null,
            icon: <Calendar size={18} />,
            iconBg: 'bg-purple-50',
            iconColor: 'text-purple-600',
          },
          {
            label: 'Platform revenue',
            value: `$${(stats?.totalRevenue ?? 0).toFixed(2)}`,
            sub: 'Total paid sessions',
            icon: <DollarSign size={18} />,
            iconBg: 'bg-emerald-50',
            iconColor: 'text-emerald-600',
          },
          {
            label: 'Admin profit (5%)',
            value: `$${(stats?.adminProfit ?? 0).toFixed(2)}`,
            sub: '5% of total revenue',
            icon: <TrendingUp size={18} />,
            iconBg: 'bg-green-50',
            iconColor: 'text-green-600',
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
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
              >
                {stat.value}
              </p>
              <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
              {stat.sub && <p className="text-xs text-gray-400">{stat.sub}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Pending approvals banner */}
      {(stats?.pendingApprovals ?? 0) > 0 && (
        <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
              <Shield size={18} className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-800">
                {stats?.pendingApprovals} mentor
                {stats?.pendingApprovals !== 1 ? 's' : ''} waiting for approval
              </p>
              <p className="text-xs text-amber-600 mt-0.5">
                Review and approve mentor applications to grow the platform.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/admin/mentors"
            className="shrink-0 flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-amber-700 border border-amber-300 rounded-xl hover:bg-amber-100 transition-all"
          >
            Review now <ChevronRight size={14} />
          </Link>
        </div>
      )}

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
            href="/dashboard/admin/sessions"
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
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {session.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <p className="text-xs text-gray-400">
                        {session.learnerName} → {session.mentorName}
                      </p>
                      <span className="text-gray-300">·</span>
                      <p className="text-xs text-gray-400">
                        {new Date(session.scheduledAt).toLocaleDateString(
                          undefined,
                          {
                            weekday: 'short',
                            year: 'numeric',
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
                  </div>
                  {session.price !== undefined && (
                    <span className="text-sm font-semibold text-gray-700 shrink-0">
                      ${session.price}
                    </span>
                  )}
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
            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-3">
              <Calendar size={22} className="text-gray-300" />
            </div>
            <p className="text-sm text-gray-500">No sessions yet</p>
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          {
            label: 'Learners',
            desc: 'Manage learner accounts',
            href: '/dashboard/admin/learners',
            icon: <GraduationCap size={20} className="text-indigo-500" />,
          },
          {
            label: 'Mentors',
            desc: 'Approve and manage mentors',
            href: '/dashboard/admin/mentors',
            icon: <UserCheck size={20} className="text-amber-500" />,
          },
          {
            label: 'Sessions',
            desc: 'View all platform sessions',
            href: '/dashboard/admin/sessions',
            icon: <Calendar size={20} className="text-purple-500" />,
          },
          {
            label: 'Settings',
            desc: 'Platform configuration',
            href: '/dashboard/admin/settings',
            icon: <TrendingUp size={20} className="text-green-500" />,
          },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-2xl hover:border-indigo-200 hover:-translate-y-0.5 transition-all"
          >
            <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
              {item.icon}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800">
                {item.label}
              </p>
              <p className="text-xs text-gray-400 mt-0.5 truncate">
                {item.desc}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
