'use client';

import useUserStore from '@/store/useUserStore';
import Image from 'next/image';
import Link from 'next/link';
import NotificationBell from '../modal/NotificationBell';

const DashboardNavbar = () => {
  const { user } = useUserStore();

  return (
    <header className="h-16.25 bg-white border-b border-gray-200 px-6 flex items-center justify-between shrink-0">
      {/* Welcome text — visible on md+ screens */}
      <div className="hidden md:block">
        <p className="text-gray-400">
          Welcome back,{' '}
          <span className="font-medium text-gray-800">
            {user?.name ?? 'there'} 👋
          </span>
        </p>
        <p className="text-sm text-gray-600">
          Here&apos;s what&apos;s happening with your learning journey.
        </p>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Notifications */}
        <NotificationBell />

        {/* Avatar */}
        <Link
          href="/profile"
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-gray-200 hover:border-indigo-200 transition-all"
        >
          {user?.profileImage ? (
            <div className="w-7 h-7 rounded-full overflow-hidden shrink-0">
              <Image
                src={user.profileImage}
                alt={user.name}
                width={28}
                height={28}
                loading="eager"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
              {user?.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
          )}
          <div className="hidden sm:block">
            <p className="text-xs font-medium text-gray-800 leading-none">
              {user?.name ?? 'User'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5 capitalize">
              {user?.role ?? 'learner'}
            </p>
          </div>
        </Link>
      </div>
    </header>
  );
};

export default DashboardNavbar;
