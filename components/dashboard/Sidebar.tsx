'use client';

import useLogout from '@/hooks/useLogout';
import useUserStore from '@/store/useUserStore';
import {
  Calendar,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Map,
  MessageSquare,
  Settings,
  UserCheck,
  UserSearch,
  Wallet,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

type TNavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

const learnerNav: TNavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard/learner',
    icon: <LayoutDashboard size={18} />,
  },
  { label: 'My roadmap', href: '/roadmap', icon: <Map size={18} /> },
  { label: 'Find mentors', href: '/mentors', icon: <UserSearch size={18} /> },
  { label: 'Sessions', href: '/sessions', icon: <Calendar size={18} /> },
  { label: 'Chat', href: '/chat', icon: <MessageSquare size={18} /> },
];

const mentorNav: TNavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard/mentor',
    icon: <LayoutDashboard size={18} />,
  },
  {
    label: 'Availability',
    href: '/availability',
    icon: <CalendarCheck size={18} />,
  },
  { label: 'My sessions', href: '/sessions', icon: <Calendar size={18} /> },
  { label: 'Learners', href: '/learners', icon: <GraduationCap size={18} /> },
  { label: 'Earnings', href: '/earnings', icon: <Wallet size={18} /> },

  { label: 'Chat', href: '/chat', icon: <MessageSquare size={18} /> },
];

const adminNav: TNavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard/admin',
    icon: <LayoutDashboard size={18} />,
  },
  {
    label: 'Learners',
    href: '/dashboard/admin/learners',
    icon: <GraduationCap size={18} />,
  },
  {
    label: 'Mentors',
    href: '/dashboard/admin/mentors',
    icon: <UserCheck size={18} />,
  },
  {
    label: 'Sessions',
    href: '/dashboard/admin/sessions',
    icon: <Calendar size={18} />,
  },
  {
    label: 'Settings',
    href: '/dashboard/admin/settings',
    icon: <Settings size={18} />,
  },
];

const navMap = {
  learner: learnerNav,
  mentor: mentorNav,
  admin: adminNav,
};

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useUserStore();
  const pathname = usePathname();
  const { logout } = useLogout();

  const navItems = navMap[user?.role ?? 'learner'];

  return (
    <aside
      className={`relative flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ${
        collapsed ? 'w-17' : 'w-60'
      }`}
    >
      {/* Logo */}
      <Link
        href="/"
        className={`flex items-center gap-2.5 p-4 border-b border-gray-200 hover:opacity-80 transition-opacity ${collapsed ? 'justify-center' : ''}`}
      >
        <Image src="/mentra_logo.svg" alt="Mentra" width={32} height={32} />
        {!collapsed && (
          <span
            className="font-bold text-lg text-indigo-600"
            style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
          >
            Mentra
          </span>
        )}
      </Link>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              } ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? item.label : ''}
            >
              <span className={isActive ? 'text-indigo-600' : 'text-gray-400'}>
                {item.icon}
              </span>
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>

      {/* Profile + Logout */}
      <div className="px-3 py-4 border-t border-gray-200 flex flex-col gap-1">
        <Link
          href="/profile"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? 'Profile' : ''}
        >
          {user?.profileImage ? (
            <div className="w-6 h-6 rounded-full overflow-hidden shrink-0">
              <Image
                src={user.profileImage}
                alt={user.name}
                width={24}
                height={24}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">
              {user?.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
          )}
          {!collapsed && (
            <span className="truncate">{user?.name ?? 'Profile'}</span>
          )}
        </Link>

        <button
          onClick={logout}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all cursor-pointer w-full ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? 'Logout' : ''}
        >
          <LogOut size={18} />
          {!collapsed && 'Logout'}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((p) => !p)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:border-indigo-300 transition-all cursor-pointer z-10"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
};

export default Sidebar;
