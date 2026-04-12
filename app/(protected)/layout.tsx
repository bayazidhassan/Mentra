'use client';

import DashboardNavbar from '../../components/dashboard/DashboardNavbar';
import Sidebar from '../../components/dashboard/Sidebar';
import useMe from '../../hooks/useMe';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  useMe(); //fetches and syncs user on every dashboard page load

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar></Sidebar>
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardNavbar></DashboardNavbar>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
