'use client';

import useUserStore from '@/store/useUserStore';
import {
  BookOpen,
  Calendar,
  ChevronRight,
  Clock,
  Map,
  Users,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  dashboardService,
  TRecommendedMentor,
  TRoadmap,
  TUpcomingSession,
} from '../../../../services/dashboard';

const LearnerDashboard = () => {
  const { user } = useUserStore();
  const [sessions, setSessions] = useState<TUpcomingSession[]>([]);
  const [roadmap, setRoadmap] = useState<TRoadmap | null>(null);
  const [mentors, setMentors] = useState<TRecommendedMentor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sessionsData, roadmapData, mentorsData] = await Promise.all([
          dashboardService.getUpcomingSessions(),
          dashboardService.getMyRoadmap(),
          dashboardService.getRecommendedMentors(),
        ]);
        setSessions(sessionsData);
        setRoadmap(roadmapData);
        setMentors(mentorsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const progressPercent = roadmap
    ? Math.round((roadmap.completedSteps / roadmap.totalSteps) * 100) || 0
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-gray-900"
            style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
          >
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Here&apos;s what&apos;s happening with your learning journey.
          </p>
        </div>
        <Link
          href="/roadmap"
          className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-xl transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
        >
          View roadmap
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Upcoming sessions',
            value: sessions.length,
            icon: <Calendar size={18} />,
            iconBg: 'bg-indigo-50',
            iconColor: 'text-indigo-600',
          },
          {
            label: 'Roadmap progress',
            value: `${progressPercent}%`,
            icon: <Map size={18} />,
            iconBg: 'bg-purple-50',
            iconColor: 'text-purple-600',
          },
          {
            label: 'Steps completed',
            value: roadmap?.completedSteps ?? 0,
            icon: <BookOpen size={18} />,
            iconBg: 'bg-green-50',
            iconColor: 'text-green-600',
          },
          {
            label: 'Available mentors',
            value: mentors.length,
            icon: <Users size={18} />,
            iconBg: 'bg-amber-50',
            iconColor: 'text-amber-600',
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
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roadmap preview */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2
              className="text-base font-semibold text-gray-900"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              My roadmap
            </h2>
            <Link
              href="/roadmap"
              className="text-xs text-indigo-600 font-medium flex items-center gap-1 hover:underline"
            >
              View all <ChevronRight size={14} />
            </Link>
          </div>

          {roadmap ? (
            <div>
              {/* Progress bar */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">
                    {roadmap.title}
                  </p>
                  <span className="text-xs text-indigo-600 font-medium">
                    {progressPercent}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${progressPercent}%`,
                      background: 'linear-gradient(90deg, #4F46E5, #7C3AED)',
                    }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {roadmap.completedSteps} of {roadmap.totalSteps} steps
                  completed
                </p>
              </div>

              {/* Steps preview */}
              <div className="space-y-2">
                {roadmap.steps.slice(0, 4).map((step) => (
                  <div
                    key={step._id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50"
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        step.status === 'completed'
                          ? 'bg-green-500 border-green-500'
                          : step.status === 'in_progress'
                            ? 'border-indigo-500'
                            : 'border-gray-300'
                      }`}
                    >
                      {step.status === 'completed' && (
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 10 10"
                          fill="none"
                        >
                          <path
                            d="M2 5l2 2 4-4"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                      {step.status === 'in_progress' && (
                        <div className="w-2 h-2 rounded-full bg-indigo-500" />
                      )}
                    </div>
                    <p
                      className={`text-sm ${
                        step.status === 'completed'
                          ? 'text-gray-400 line-through'
                          : 'text-gray-700'
                      }`}
                    >
                      {step.title}
                    </p>
                    {step.status === 'in_progress' && (
                      <span className="ml-auto text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                        In progress
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-3">
                <Map size={22} className="text-indigo-400" />
              </div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                No roadmap yet
              </p>
              <p className="text-xs text-gray-400 mb-4">
                Generate your personalized AI learning roadmap
              </p>
              <Link
                href="/roadmap"
                className="px-4 py-2 text-xs font-medium text-white rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                }}
              >
                Generate roadmap
              </Link>
            </div>
          )}
        </div>

        {/* Upcoming sessions */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2
              className="text-base font-semibold text-gray-900"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              Upcoming sessions
            </h2>
            <Link
              href="/sessions"
              className="text-xs text-indigo-600 font-medium flex items-center gap-1 hover:underline"
            >
              View all <ChevronRight size={14} />
            </Link>
          </div>

          {sessions.length > 0 ? (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session._id}
                  className="p-3 rounded-xl bg-gray-50 border border-gray-100"
                >
                  <p className="text-sm font-medium text-gray-800 mb-1">
                    {session.title}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
                    <Clock size={12} />
                    {new Date(session.scheduledAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    <span>· {session.duration} min</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {session.mentor.profileImage ? (
                      <Image
                        src={session.mentor.profileImage}
                        alt={session.mentor.name}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                        {session.mentor.name[0]}
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      {session.mentor.name}
                    </p>
                    <span
                      className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                        session.status === 'confirmed'
                          ? 'bg-green-50 text-green-600'
                          : 'bg-amber-50 text-amber-600'
                      }`}
                    >
                      {session.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-3">
                <Calendar size={22} className="text-indigo-400" />
              </div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                No upcoming sessions
              </p>
              <p className="text-xs text-gray-400 mb-4">
                Book a session with a mentor
              </p>
              <Link
                href="/mentors"
                className="px-4 py-2 text-xs font-medium text-white rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                }}
              >
                Find mentors
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recommended mentors */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2
            className="text-base font-semibold text-gray-900"
            style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
          >
            Recommended mentors
          </h2>
          <Link
            href="/mentors"
            className="text-xs text-indigo-600 font-medium flex items-center gap-1 hover:underline"
          >
            Browse all <ChevronRight size={14} />
          </Link>
        </div>

        {mentors.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {mentors.map((mentor) => (
              <div
                key={mentor._id}
                className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-indigo-200 transition-all"
              >
                {mentor.profileImage ? (
                  <Image
                    src={mentor.profileImage}
                    alt={mentor.name}
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold shrink-0">
                    {mentor.name[0]}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {mentor.name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {mentor.email}
                  </p>
                </div>
                <Link
                  href={`/mentors/${mentor._id}`}
                  className="ml-auto shrink-0 px-3 py-1.5 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-all"
                >
                  View
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-3">
              <Users size={22} className="text-indigo-400" />
            </div>
            <p className="text-sm font-medium text-gray-700 mb-1">
              No mentors available
            </p>
            <p className="text-xs text-gray-400">
              Check back later for mentor recommendations
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearnerDashboard;
