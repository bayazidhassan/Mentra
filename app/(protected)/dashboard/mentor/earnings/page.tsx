import { cookies } from 'next/headers';
import EarningsClientPage from '../../../../../components/dashboard/mentor/EarningsClientPage';
import { TEarningPayment } from '../../../../../lib/services/payment';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const EarningsPage = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  const res = await fetch(`${BASE_URL}/api/v1/payment/earnings`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: 'no-store',
  })
    .then((r) => r.json())
    .catch(() => ({ data: null }));

  const payments: TEarningPayment[] = res.data?.payments ?? [];
  const totalEarnings: number = res.data?.totalEarnings ?? 0;
  const totalPayments: number = res.data?.totalPayments ?? 0;

  return (
    <EarningsClientPage
      payments={payments}
      totalEarnings={totalEarnings}
      totalPayments={totalPayments}
    />
  );
};

export default EarningsPage;
