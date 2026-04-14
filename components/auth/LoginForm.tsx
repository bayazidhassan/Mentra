'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { authService } from '../../services/auth';
import useUserStore from '../../store/useUserStore';

const loginSchema = z.object({
  email: z.string().check(z.email('Enter a valid email')),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

const inputBase =
  'w-full h-11 pl-9 pr-3 border-[1.5px] rounded-xl text-sm outline-none transition-all bg-white';
const inputNormal = `${inputBase} border-gray-200 focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(79,70,229,0.08)]`;
const inputError = `${inputBase} border-red-400 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.08)]`;

const LoginForm = () => {
  const [showPw, setShowPw] = useState(false);
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const safeRedirect =
    redirect && redirect.startsWith('/') ? redirect : '/dashboard/learner';
  const router = useRouter();
  const { setUser } = useUserStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await authService.login({
        email: data.email,
        password: data.password,
      });

      if (response.success && response.data) {
        setUser(response.data);
        toast.success(response.message);
        router.push(safeRedirect);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || 'Something went wrong';
        toast.error(message);
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
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
            Welcome Back
          </span>
          <h1 className="text-4xl font-bold text-white mt-5 mb-3 leading-tight">
            Your growth
            <br />
            journey <span className="text-violet-300">continues</span>
            <br />
            here.
          </h1>
          <p className="text-white/60 text-sm leading-relaxed">
            Sign in to access your personalized roadmaps, connect with mentors,
            and keep building momentum.
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
              Welcome back 👋
            </h2>
            <p className="text-sm text-gray-500">
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="text-indigo-600 font-medium hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>

          {/* Google */}
          <GoogleLogin
            onSuccess={async (response) => {
              try {
                const result = await authService.googleLogin(
                  response.credential as string,
                );
                if (result.success && result.data) {
                  setUser(result.data);
                  toast.success(result.message);
                  //redirect to role selection if new user
                  if (result.data.isNewUser) {
                    router.push('/selectRole');
                  } else {
                    router.push(safeRedirect);
                  }
                }
              } catch (error: unknown) {
                if (axios.isAxiosError(error)) {
                  const message =
                    error.response?.data?.message || 'Google login failed';
                  toast.error(message);
                }
              }
            }}
            onError={() => toast.error('Google login failed')}
          />

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or sign in with email</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={errors.email ? inputError : inputNormal}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-gray-700">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-indigo-600 font-medium hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register('password')}
                  type={showPw ? 'text' : 'password'}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className={`${errors.password ? inputError : inputNormal} pr-9`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="rememberMe"
                {...register('rememberMe')}
                className="accent-indigo-600 cursor-pointer"
              />
              <label
                htmlFor="rememberMe"
                className="text-xs text-gray-500 cursor-pointer"
              >
                Remember me for 30 days
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-xl text-white text-sm font-medium transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-200 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
              }}
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
