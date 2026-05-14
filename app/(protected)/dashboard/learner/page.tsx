import { cookies } from 'next/headers';
import LearnerDashboard from '../../../../components/dashboard/learner/LearnerDashboard';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const getAuthHeader = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const LearnerDashboardPage = async () => {
  const headers = await getAuthHeader();

  const [sessions, roadmap, completedRoadmaps, mentorsData] = await Promise.all(
    [
      fetch(`${BASE_URL}/api/v1/session/my-sessions`, {
        headers,
        cache: 'no-store', // SSR — always fresh
      })
        .then((res) => res.json())
        .catch(() => ({ data: [] })),

      fetch(`${BASE_URL}/api/v1/roadmap/me`, {
        headers,
        cache: 'no-store', // SSR — always fresh
      })
        .then((res) => res.json())
        .catch(() => ({ data: null })),

      fetch(`${BASE_URL}/api/v1/roadmap/completed`, {
        headers,
        cache: 'no-store', // SSR — always fresh
      })
        .then((res) => res.json())
        .catch(() => ({ data: [] })),

      fetch(`${BASE_URL}/api/v1/mentor?page=1&limit=3`, {
        next: { revalidate: 60 * 60 }, // ISR — revalidate every 1 hour
      })
        .then((res) => res.json())
        .catch(() => ({ data: { mentors: [] } })),
    ],
  );

  return (
    <LearnerDashboard
      sessions={sessions.data ?? []}
      roadmap={roadmap.data ?? null}
      completedRoadmaps={completedRoadmaps.data ?? []}
      mentors={mentorsData.data?.mentors ?? []}
    />
  );
};

export default LearnerDashboardPage;
