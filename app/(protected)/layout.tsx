'use client';

import DashboardNavbar from '@/components/dashboard/DashboardNavbar';
import Sidebar from '@/components/dashboard/Sidebar';
import AuthProvider from '@/components/providers/AuthProvider';
import useMe from '@/hooks/useMe';

/*
DashboardContent is a separate component intentionally. useMe() must run AFTER AuthProvider finishes the silent refresh and sets the accessToken in Zustand. If useMe() were called in DashboardLayout directly, it would fire before the token is ready and getMe() would return 401.
*/

const DashboardContent = ({ children }: { children: React.ReactNode }) => {
  useMe();

  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DashboardNavbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <DashboardContent>{children}</DashboardContent>
    </AuthProvider>
  );
};

export default DashboardLayout;
