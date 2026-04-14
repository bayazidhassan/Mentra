'use client';

import axiosInstance from '@/lib/axios';
import useUserStore from '@/store/useUserStore';
import axios from 'axios';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

const SelectRolePage = () => {
  const [selectedRole, setSelectedRole] = useState<'learner' | 'mentor' | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const { setUser, user } = useUserStore();
  const router = useRouter();

  const handleConfirm = async () => {
    if (!selectedRole) {
      toast.error('Please select a role.');
      return;
    }
    setLoading(true);
    try {
      const response = await axiosInstance.patch('/users/updateRole', {
        role: selectedRole,
      });

      if (response.data.success && response.data.data) {
        setUser({
          _id: response.data.data._id,
          name: response.data.data.name,
          email: response.data.data.email,
          role: response.data.data.role,
          profileImage: response.data.data.profileImage,
        });
        toast.success('Welcome to Mentra!');
        router.push(
          selectedRole === 'mentor'
            ? '/dashboard/mentor'
            : '/dashboard/learner',
        );
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || 'Failed to update role.');
      } else {
        toast.error('Failed to update role.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Image
            src="/mentra_logo.svg"
            alt="Mentra"
            width={48}
            height={48}
            className="mx-auto mb-3"
          />
          <h1
            className="text-2xl font-bold text-gray-900 mb-1"
            style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
          >
            Welcome to Mentra, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-sm text-gray-500">
            How do you want to use Mentra?
          </p>
        </div>

        {/* Role options */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => setSelectedRole('learner')}
            className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all cursor-pointer ${
              selectedRole === 'learner'
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 bg-white hover:border-indigo-300'
            }`}
          >
            <span className="text-4xl">🎓</span>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-900">Learner</p>
              <p className="text-xs text-gray-400 mt-1">
                I want to learn and grow
              </p>
            </div>
            {selectedRole === 'learner' && (
              <span className="text-xs font-medium text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                Selected
              </span>
            )}
          </button>

          <button
            onClick={() => setSelectedRole('mentor')}
            className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all cursor-pointer ${
              selectedRole === 'mentor'
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 bg-white hover:border-indigo-300'
            }`}
          >
            <span className="text-4xl">🧑‍🏫</span>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-900">Mentor</p>
              <p className="text-xs text-gray-400 mt-1">
                I want to teach and guide
              </p>
            </div>
            {selectedRole === 'mentor' && (
              <span className="text-xs font-medium text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                Selected
              </span>
            )}
          </button>
        </div>

        {/* Confirm button */}
        <button
          onClick={handleConfirm}
          disabled={!selectedRole || loading}
          className="w-full h-12 text-sm font-medium text-white rounded-xl disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
        >
          {loading ? 'Setting up your account...' : 'Get started'}
        </button>

        <p className="text-xs text-gray-400 text-center mt-4">
          You can change your role later from your profile settings.
        </p>
      </div>
    </div>
  );
};

export default SelectRolePage;
