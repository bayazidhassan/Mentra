'use client';

import useRefreshToken from '../../hooks/useRefreshToken';

const RefreshTokenProvider = ({ children }: { children: React.ReactNode }) => {
  useRefreshToken();

  return <>{children}</>;
};

export default RefreshTokenProvider;
