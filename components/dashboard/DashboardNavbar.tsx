'use client';

import useUserStore from '@/store/useUserStore';
import { Bell } from 'lucide-react';
import Link from 'next/link';

const DashboardNavbar = () => {
  const { user } = useUserStore();

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shrink-0">
      {/* Page title placeholder */}
      <div>
        <p className="text-sm text-gray-400">
          Welcome back,{' '}
          <span className="font-medium text-gray-800">
            {user?.name ?? 'there'} 👋
          </span>
        </p>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="relative w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:border-indigo-200 transition-all cursor-pointer">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full" />
        </button>

        {/* Avatar */}
        <Link
          href="/profile"
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-gray-200 hover:border-indigo-200 transition-all"
        >
          <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
            {user?.name?.[0]?.toUpperCase() ?? 'U'}
          </div>
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
