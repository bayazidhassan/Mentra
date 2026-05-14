import { cookies } from 'next/headers';
import AvailabilityClientPage from '../../../../../components/dashboard/mentor/AvailabilityClientPage';
import { TAvailability } from '../../../../../store/userStore';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const AvailabilityPage = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  const res = await fetch(`${BASE_URL}/api/v1/mentor/availability`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: 'no-store',
  })
    .then((r) => r.json())
    .catch(() => ({ data: null }));

  const availability: TAvailability[] = res.data?.availability ?? [];
  const hourlyRate: number | undefined = res.data?.hourlyRate;

  return (
    <AvailabilityClientPage
      initialAvailability={availability}
      initialHourlyRate={hourlyRate?.toString() ?? ''}
    />
  );
};

export default AvailabilityPage;
