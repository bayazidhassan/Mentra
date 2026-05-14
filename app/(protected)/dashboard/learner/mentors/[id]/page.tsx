import MentorProfileClientPage from '../../../../../../components/dashboard/learner/MentorProfileClientPage';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// Pre-build first 3 mentor pages at deploy time
export const generateStaticParams = async () => {
  const res = await fetch(`${BASE_URL}/api/v1/mentor?page=1&limit=3`).catch(
    () => null,
  );

  const json = res ? await res.json().catch(() => null) : null;
  const mentors = json?.data?.mentors ?? [];

  return mentors.map((mentor: { _id: string }) => ({ id: mentor._id }));
};

const MentorProfilePage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  const res = await fetch(`${BASE_URL}/api/v1/mentor/${id}`, {
    next: { revalidate: 60 * 60 },
  }).catch(() => null);

  const json = res ? await res.json().catch(() => null) : null;
  const mentor = json?.data ?? null;

  return <MentorProfileClientPage mentor={mentor} />;
};

export default MentorProfilePage;
