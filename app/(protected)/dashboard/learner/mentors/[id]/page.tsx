import { cookies } from 'next/headers';
import MentorProfileClientPage from '../../../../../../components/dashboard/learner/MentorProfileClientPage';
import MentorProfilePage from './MentorProfilePage';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const MentorProfilePage = async ({ params }: { params: { id: string } }) => {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  const res = await fetch(`${BASE_URL}/api/v1/mentor/${params.id}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: 'no-store',
  }).catch(() => null);

  const json = res ? await res.json().catch(() => null) : null;
  const mentor = json?.data ?? null;

  return <MentorProfileClientPage mentor={mentor} />;
};

export default MentorProfilePage;
