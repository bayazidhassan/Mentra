import { cookies } from 'next/headers';
import RevenueClientPage from '../../../../../components/dashboard/admin/RevenueClientPage';
import { TRevenue } from '../../../../../lib/services/payment';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const RevenuePage = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  const res = await fetch(`${BASE_URL}/api/v1/payment/revenue`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: 'no-store',
  })
    .then((r) => r.json())
    .catch(() => ({ data: null }));

  const payments: TRevenue[] = res.data?.payments ?? [];
  const totalRevenue: number = res.data?.totalRevenue ?? 0;
  const adminProfit: number = res.data?.adminProfit ?? 0;
  const totalPayments: number = res.data?.totalPayments ?? 0;

  return (
    <RevenueClientPage
      payments={payments}
      totalRevenue={totalRevenue}
      adminProfit={adminProfit}
      totalPayments={totalPayments}
    />
  );
};

export default RevenuePage;
