import { cookies } from 'next/headers';
import AdminDashboardClientPage from '../../../../components/dashboard/admin/AdminDashboard';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const getAuthHeader = async (): Promise<Record<string, string>> => {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const AdminDashboardPage = async () => {
  const headers = await getAuthHeader();

  const res = await fetch(`${BASE_URL}/api/v1/admin/stats`, {
    headers,
    cache: 'no-store',
  })
    .then((r) => r.json())
    .catch(() => ({ data: null }));

  const stats = res.data?.stats ?? null;
  const recentSessions = res.data?.recentSessions ?? [];

  return (
    <AdminDashboardClientPage stats={stats} recentSessions={recentSessions} />
  );
};

export default AdminDashboardPage;
