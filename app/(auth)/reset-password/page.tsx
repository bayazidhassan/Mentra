'use client';

import axios from 'axios';
import { Eye, EyeOff, Lock } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { authService } from '../../../services/auth';

const inputBase =
  'w-full h-11 pl-9 pr-3 border-[1.5px] rounded-xl text-sm outline-none transition-all bg-white';

const inputNormal =
  'border-gray-200 focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(79,70,229,0.08)]';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.resetPassword(token!, password);
      if (response.success && response.message) {
        toast.success(response.message || 'Password reset successful!');
        router.replace('/login');
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel (same style as login) */}
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
            Secure Reset
          </span>

          <h1 className="text-4xl font-bold text-white mt-5 mb-3 leading-tight">
            Set a new
            <br />
            password 🔐
          </h1>

          <p className="text-white/60 text-sm leading-relaxed">
            Choose a strong password to secure your Mentra account.
          </p>
        </div>

        <div className="text-white/50 text-xs">
          Secure • Encrypted • Protected
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-105">
          <div className="mb-7">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Reset your password 🔑
            </h2>

            <p className="text-sm text-gray-500">
              Back to{' '}
              <Link
                href="/login"
                className="text-indigo-600 font-medium hover:underline"
              >
                login
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                New password
              </label>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                <input
                  type={show ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputBase} ${inputNormal} pr-10`}
                />

                <button
                  type="button"
                  onClick={() => setShow((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Confirm password
              </label>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                <input
                  type={show ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`${inputBase} ${inputNormal}`}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl text-white text-sm font-medium transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-200 disabled:opacity-60"
              style={{
                background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
              }}
            >
              {loading ? 'Updating...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
