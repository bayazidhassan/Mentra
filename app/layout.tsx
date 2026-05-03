import { GoogleOAuthProvider } from '@react-oauth/google';
import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import ErrorBoundary from '../components/error/ErrorBoundary';
import AuthProvider from '../components/providers/AuthProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mentra',
  description: 'AI-Powered Learning & Mentorship Platform.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <GoogleOAuthProvider
          clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string}
        >
          <Toaster position="top-right" richColors />
          <AuthProvider>
            {/*client component wrapper. children can still be server components */}
            <ErrorBoundary>{children}</ErrorBoundary>
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
