import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

type ResetPasswordPageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};

const ResetPasswordPage = async ({ searchParams }: ResetPasswordPageProps) => {
  const { token } = await searchParams;

  return <ResetPasswordForm token={token} />;
};

export default ResetPasswordPage;
