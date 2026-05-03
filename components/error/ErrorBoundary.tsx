'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Component, ErrorInfo, ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Log to your error tracking service here (e.g. Sentry)
    console.error('ErrorBoundary caught:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="w-full max-w-md text-center">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <Image
                src="/mentra_logo.svg"
                alt="Mentra"
                width={48}
                height={48}
              />
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
            <p className="text-sm text-gray-500 mb-2">
              An unexpected error occurred. This has been logged and we&apos;ll
              look into it.
            </p>

            {/* Error detail — dev only */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-4 mb-6 text-left bg-gray-900 rounded-xl p-4 overflow-auto max-h-40">
                <p className="text-xs text-red-400 font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white rounded-xl transition-all hover:opacity-90"
                style={{
                  background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                }}
              >
                <RefreshCw size={15} />
                Reload page
              </button>
              <Link
                href="/"
                className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 transition-all"
              >
                Go to homepage
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
