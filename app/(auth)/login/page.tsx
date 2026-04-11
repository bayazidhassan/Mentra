import { Suspense } from 'react';
import LoginForm from '../../../components/auth/LoginForm';

const LoginPage = () => {
  return (
    /*
    Next.js App Router requires Suspense boundary for client hooks like useSearchParams() to prevent prerendering failure during static generation.

    here, LoginFrom contains useSearchParams()
    */
    <Suspense fallback={null}>
      <LoginForm></LoginForm>
    </Suspense>
  );
};

export default LoginPage;
