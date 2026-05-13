'use client';

import { Mail } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { authService } from '../../../services/auth';

const inputBase =
  'w-full h-11 pl-9 pr-3 border-[1.5px] rounded-xl text-sm outline-none transition-all bg-white';
const inputNormal =
  'border-gray-200 focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(79,70,229,0.08)]';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authService.forgotPassword(email);

      if (response.success && response.message) {
        toast.success(
          response.message || 'A reset link has been sent to your email.',
        );
        setEmail('');
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel (same as login) */}
      <div
        className="hidden lg:flex w-[42%] flex-col justify-between p-12"
        style={{
          background:
            'linear-gradient(145deg, #3730a3 0%, #4F46E5 45%, #7C3AED 100%)',
        }}
      >
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center text-white font-bold">
            ✦
          </div>
          <span className="text-white font-semibold text-xl">Mentra</span>
        </div>

        <div>
          <span className="text-xs uppercase tracking-widest text-white/70 bg-white/10 px-3 py-1 rounded-full">
            Reset Password
          </span>
          <h1 className="text-4xl font-bold text-white mt-5 mb-3 leading-tight">
            Forgot your
            <br />
            password?
          </h1>
          <p className="text-white/60 text-sm leading-relaxed">
            No worries. Enter your email and we’ll send you a link to reset your
            password.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { num: '12k+', label: 'Learners' },
            { num: '800+', label: 'Mentors' },
            { num: '95%', label: 'Satisfaction' },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white/10 border border-white/10 rounded-xl p-4 text-center"
            >
              <p className="text-white font-bold text-xl">{s.num}</p>
              <p className="text-white/55 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-105">
          <div className="mb-7">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Reset your password 🔐
            </h2>
            <p className="text-sm text-gray-500">
              Remember your password?{' '}
              <Link
                href="/login"
                className="text-indigo-600 font-medium hover:underline"
              >
                Back to login
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`${inputBase} ${inputNormal}`}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl text-white text-sm font-medium transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-200 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
              }}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
