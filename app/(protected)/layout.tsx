'use client';

import DashboardNavbar from '@/components/dashboard/DashboardNavbar';
import Sidebar from '@/components/dashboard/Sidebar';
import useMe from '@/hooks/useMe';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  useMe();

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar — fixed */}
      <Sidebar />

      {/* Right side */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Navbar — fixed */}
        <DashboardNavbar />

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
