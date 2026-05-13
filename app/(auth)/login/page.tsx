import LoginForm from '../../../components/auth/LoginForm';

type LoginPageProps = {
  searchParams: Promise<{
    redirect?: string;
  }>;
};

const LoginPage = async ({ searchParams }: LoginPageProps) => {
  const { redirect } = await searchParams;

  return <LoginForm redirect={redirect} />;
};

export default LoginPage;
