'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const registerSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().check(z.email('Enter a valid email')),
    role: z.enum(['learner', 'mentor']),
    password: z.string().min(8, 'Min. 8 characters'),
    confirmPassword: z.string(),
    terms: z.boolean().refine((val) => val, 'You must accept the terms'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const inputBase =
  'w-full h-11 pl-9 pr-3 border-[1.5px] rounded-xl text-sm outline-none transition-all bg-white';
const inputNormal = `${inputBase} border-gray-200 focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(79,70,229,0.08)]`;
const inputError = `${inputBase} border-red-400 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.08)]`;

const RegisterForm = () => {
  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'learner' | 'mentor'>(
    'learner',
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'learner' },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      console.log(data);
      // await registerUser(data); ← wire up your service here
    } catch (error) {
      console.error(error);
    }
  };

  const handleRoleSelect = (role: 'learner' | 'mentor') => {
    setSelectedRole(role);
    setValue('role', role);
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
            AI-Powered Learning & Mentorship Platform
          </span>
          <h1 className="text-4xl font-bold text-white mt-5 mb-3 leading-tight">
            Learn smarter.
            <br />
            Grow <span className="text-violet-300">faster.</span>
            <br />
            Connect deeper.
          </h1>
          <p className="text-white/60 text-sm leading-relaxed">
            Join thousands of learners and mentors building real skills
            together.
          </p>
        </div>

        <div className="space-y-3">
          {[
            {
              icon: '🗺️',
              title: 'AI Learning Roadmaps',
              desc: 'Personalized plans built for your goals',
            },
            {
              icon: '💬',
              title: 'Real-time Mentorship',
              desc: 'Connect and chat with expert mentors',
            },
            {
              icon: '📅',
              title: 'Session Booking',
              desc: 'Schedule 1-on-1 sessions with ease',
            },
          ].map((f) => (
            <div
              key={f.title}
              className="flex items-center gap-3 bg-white/10 border border-white/10 rounded-xl p-3"
            >
              <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center text-base">
                {f.icon}
              </div>
              <div>
                <p className="text-white text-sm font-medium">{f.title}</p>
                <p className="text-white/60 text-xs">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-110">
          <div className="mb-7">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Create your account
            </h2>
            <p className="text-sm text-gray-500">
              Already have one?{' '}
              <Link
                href="/login"
                className="text-indigo-600 font-medium hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-2 mb-5">
            {(['learner', 'mentor'] as const).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => handleRoleSelect(role)}
                className={`flex items-center gap-2 p-3 rounded-xl border-[1.5px] transition-all text-left ${
                  selectedRole === role
                    ? 'border-indigo-500 bg-indigo-50 shadow-[0_0_0_3px_rgba(79,70,229,0.08)]'
                    : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-base ${
                    selectedRole === role ? 'bg-indigo-600' : 'bg-gray-100'
                  }`}
                >
                  {role === 'learner' ? '🎓' : '🧑‍🏫'}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800 capitalize">
                    {role}
                  </p>
                  <p className="text-xs text-gray-400">
                    {role === 'learner' ? 'I want to learn' : 'I want to teach'}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Full name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register('name')}
                  placeholder="John Doe"
                  className={errors.name ? inputError : inputNormal}
                />
              </div>
              {errors.name && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Hidden role field */}
            <input type="hidden" {...register('role')} value={selectedRole} />

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
                  className={errors.email ? inputError : inputNormal}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-2 gap-3">
              {/* Password */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    {...register('password')}
                    type={showPw ? 'text' : 'password'}
                    placeholder="Min. 8 chars"
                    className={`${errors.password ? inputError : inputNormal} pr-9`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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

              {/* Confirm password */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Confirm password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    {...register('confirmPassword')}
                    type={showCPw ? 'text' : 'password'}
                    placeholder="Repeat password"
                    className={`${errors.confirmPassword ? inputError : inputNormal} pr-9`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCPw((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                {...register('terms')}
                className="mt-0.5 accent-indigo-600"
              />
              <label
                htmlFor="terms"
                className="text-xs text-gray-500 leading-relaxed cursor-pointer"
              >
                I agree to the{' '}
                <Link href="/terms" className="text-indigo-600 font-medium">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-indigo-600 font-medium">
                  Privacy Policy
                </Link>
              </label>
            </div>
            {errors.terms && (
              <p className="text-xs text-red-500">{errors.terms.message}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="cursor-pointer w-full h-12 rounded-xl text-white text-sm font-medium transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-200 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
              }}
            >
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or continue with</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Google */}
          <button className="cursor-pointer w-full h-11 border-[1.5px] border-gray-200 bg-white rounded-xl flex items-center justify-center gap-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
