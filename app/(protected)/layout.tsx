import DashboardNavbar from '../../components/dashboard/DashboardNavbar';
import Sidebar from '../../components/dashboard/Sidebar';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
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
