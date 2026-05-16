'use client';

import useLogout from '@/hooks/useLogout';
import userStore from '@/store/userStore';
import {
  Calendar,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Map,
  Menu,
  MessageSquare,
  Settings,
  UserCheck,
  UserSearch,
  Wallet,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSocket } from '../../hooks/useSocket';

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
  {
    label: 'My roadmap',
    href: '/dashboard/learner/roadmap',
    icon: <Map size={18} />,
  },
  {
    label: 'Find mentors',
    href: '/dashboard/learner/mentors',
    icon: <UserSearch size={18} />,
  },
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
    href: '/dashboard/mentor/availability',
    icon: <CalendarCheck size={18} />,
  },
  { label: 'My sessions', href: '/sessions', icon: <Calendar size={18} /> },
  {
    label: 'Learners',
    href: '/dashboard/mentor/learners',
    icon: <GraduationCap size={18} />,
  },
  {
    label: 'Earnings',
    href: '/dashboard/mentor/earnings',
    icon: <Wallet size={18} />,
  },
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
    label: 'Revenue',
    href: '/dashboard/admin/revenue',
    icon: <Wallet size={18} />,
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

// ─── Shared nav content ───────────────────────────────────────────────────────

const NavContent = ({
  collapsed,
  onNavClick,
}: {
  collapsed: boolean;
  onNavClick?: () => void;
}) => {
  const { user } = userStore();
  const pathname = usePathname();
  const { logout } = useLogout();
  const { unreadMessageCount, resetMessageCount } = useSocket();
  const navItems = navMap[user?.role ?? 'learner'];

  return (
    <>
      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive =
            item.href === `/dashboard/${user?.role}`
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + '/');

          const isChat = item.href === '/chat';

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                // Reset chat badge when navigating to chat
                if (isChat) resetMessageCount();
                onNavClick?.();
              }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              } ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? item.label : ''}
            >
              {/* Icon with badge for chat */}
              <span
                className={`relative ${isActive ? 'text-indigo-600' : 'text-gray-400'}`}
              >
                {item.icon}
                {isChat && unreadMessageCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                    {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                  </span>
                )}
              </span>

              {/* Label + inline badge when expanded */}
              {!collapsed && (
                <span className="flex items-center gap-2 flex-1">
                  {item.label}
                  {isChat && unreadMessageCount > 0 && (
                    <span className="ml-auto min-w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                      {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                    </span>
                  )}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Profile + Logout */}
      <div className="px-3 py-4 border-t border-gray-200 flex flex-col gap-1">
        <Link
          href="/profile"
          onClick={onNavClick}
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
          onClick={() => {
            logout();
            onNavClick?.();
          }}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all cursor-pointer w-full ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? 'Logout' : ''}
        >
          <LogOut size={18} />
          {!collapsed && 'Logout'}
        </button>
      </div>
    </>
  );
};

// ─── Main Sidebar ─────────────────────────────────────────────────────────────

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const timer = setTimeout(() => {
      setMobileOpen(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 w-9 h-9 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-600 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
      >
        <Menu size={18} />
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`md:hidden fixed top-0 left-0 z-50 h-full w-72 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <Link
            href="/"
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
            onClick={() => setMobileOpen(false)}
          >
            <Image src="/mentra_logo.svg" alt="Mentra" width={32} height={32} />
            <span
              className="font-bold text-lg text-indigo-600"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              Mentra
            </span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
        <NavContent collapsed={false} onNavClick={() => setMobileOpen(false)} />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex relative flex-col bg-white border-r border-gray-200 transition-all duration-300 ${
          collapsed ? 'w-17' : 'w-60'
        }`}
      >
        <Link
          href="/"
          className={`flex items-center gap-2.5 p-4 border-b border-gray-200 hover:opacity-80 transition-opacity ${
            collapsed ? 'justify-center' : ''
          }`}
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

        <NavContent collapsed={collapsed} />

        <button
          onClick={() => setCollapsed((p) => !p)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:border-indigo-300 transition-all cursor-pointer z-10"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>
    </>
  );
};

export default Sidebar;
