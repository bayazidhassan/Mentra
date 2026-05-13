'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { authService } from '../../lib/services/auth';

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
  const router = useRouter();

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
      const response = await authService.register({
        name: data.name,
        email: data.email,
        role: data.role,
        password: data.password,
      });

      if (response.success) {
        toast.success(response.message);
        router.push('/login');
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong.';
      toast.error(message);
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
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
