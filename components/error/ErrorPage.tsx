'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';
import Image from 'next/image';

type Props = {
  error?: (Error & { digest?: string }) | null;
  onReset?: () => void;
};

export default function ErrorPage({ error, onReset }: Props) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image src="/mentra_logo.svg" alt="Mentra" width={48} height={48} />
        </div>

        {/* Error icon */}
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={28} className="text-red-500" />
        </div>

        {/* Message */}
        <h1
          className="text-2xl font-bold text-gray-900 mb-3"
          style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
        >
          Something went wrong
        </h1>

        <p className="text-sm text-gray-500 mb-6">
          An unexpected error occurred. Please try again.
        </p>

        {/* DEV ERROR DEBUG */}
        {process.env.NODE_ENV === 'development' && error && (
          <div className="mt-4 mb-6 text-left bg-gray-900 text-white p-4 rounded-xl overflow-auto max-h-48">
            {/* Error name */}
            <p className="text-red-400 text-xs font-mono mb-2">{error.name}</p>

            {/* Error message */}
            <p className="text-xs font-mono break-all">{error.message}</p>

            {/* Next.js digest */}
            {'digest' in error && error.digest && (
              <p className="text-gray-400 text-xs mt-2">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onReset && (
            <button
              onClick={onReset}
              className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white rounded-xl transition-all hover:opacity-90"
              style={{
                background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
              }}
            >
              <RefreshCw size={15} />
              Try again
            </button>
          )}

          <button
            onClick={() => (window.location.href = '/')}
            className="flex items-center justify-center px-6 py-3 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 transition-all"
          >
            Go to homepage
          </button>
        </div>
      </div>
    </div>
  );
}
