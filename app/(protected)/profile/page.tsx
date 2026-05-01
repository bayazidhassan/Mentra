'use client';

import useUserStore, { TUser } from '@/store/useUserStore';
import axios from 'axios';
import {
  Camera,
  Eye,
  EyeOff,
  Lock,
  Plus,
  Save,
  Settings,
  Shield,
  Trash2,
  User,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { userService } from '../../../services/user';

type TTab = 'profile' | 'password' | 'settings';

const inputClass =
  'w-full h-11 border border-gray-200 rounded-xl px-3 text-sm outline-none focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(79,70,229,0.08)] transition-all bg-white';

const ProfilePage = () => {
  const { user, setUser } = useUserStore();
  const [activeTab, setActiveTab] = useState<TTab>('profile');
  const isLearner = user?.role === 'learner';
  const isMentor = user?.role === 'mentor';

  // user fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // learner fields
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');

  // mentor fields
  const [bio, setBio] = useState('');
  const [experience, setExperience] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [availability, setAvailability] = useState<
    { day: string; startTime: string; endTime: string }[]
  >([]);

  // password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const [initialData, setInitialData] = useState<TUser | null>(null);
  useEffect(() => {
    if (user) {
      setInitialData(user);

      setName(user.name ?? '');
      setPhone(user.phone ?? '');
      setSkills(user.skills ?? []);
      setBio(user.bio ?? '');
      setExperience(user.experience ?? '');
      setHourlyRate(user.hourlyRate?.toString() ?? '');
      setAvailability(user.availability ?? []);
    }
  }, [user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ✅ check type
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed.');
      return;
    }

    // ✅ optional: check size (e.g. max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB.');
      return;
    }

    setImageFile(file);

    // preview
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    if (skills.includes(trimmed)) {
      toast.error('Skill already added.');
      return;
    }
    setSkills((prev) => [...prev, trimmed]);
    setSkillInput('');
  };

  const removeSkill = (skill: string) => {
    setSkills((prev) => prev.filter((s) => s !== skill));
  };

  const addAvailability = () => {
    setAvailability((prev) => [
      ...prev,
      { day: 'Mon', startTime: '09:00', endTime: '17:00' },
    ]);
  };

  const removeAvailability = (index: number) => {
    setAvailability((prev) => prev.filter((_, i) => i !== index));
  };

  const updateAvailability = (
    index: number,
    field: 'day' | 'startTime' | 'endTime',
    value: string,
  ) => {
    setAvailability((prev) =>
      prev.map((a, i) => (i === index ? { ...a, [field]: value } : a)),
    );
  };

  const handleProfileSave = async () => {
    if (!name.trim()) {
      toast.error('Name is required.');
      return;
    }
    setSavingProfile(true);
    try {
      const formData = new FormData();

      if (!initialData) return;

      // user
      if (name !== initialData.name) {
        formData.append('name', name);
      }
      if (phone !== (initialData.phone ?? '')) {
        formData.append('phone', phone);
      }
      if (imageFile) {
        formData.append('profileImage', imageFile);
      }

      // learner
      if (isLearner) {
        const oldSkills = JSON.stringify(initialData.skills ?? []);
        const newSkills = JSON.stringify(skills);
        if (oldSkills !== newSkills) {
          formData.append('skills', newSkills);
        }
      }

      // mentor
      if (isMentor) {
        if (bio !== (initialData.bio ?? '')) {
          formData.append('bio', bio);
        }
        if (experience !== (initialData.experience ?? '')) {
          formData.append('experience', experience);
        }
        if (hourlyRate !== (initialData.hourlyRate?.toString() ?? '')) {
          formData.append('hourlyRate', hourlyRate);
        }
        const oldAvailability = JSON.stringify(initialData.availability ?? []);
        const newAvailability = JSON.stringify(availability);
        if (oldAvailability !== newAvailability) {
          formData.append('availability', newAvailability);
        }
      }

      if ([...formData.keys()].length === 0) {
        toast.info('No changes detected.');
        return;
      }

      const res = await userService.updateProfile(formData);
      if (res.success && res.data) {
        setUser((prev) => ({
          ...prev!,
          ...res.data,
        }));
        toast.success('Profile updated successfully.');
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || 'Failed to update profile.');
      } else {
        toast.error('Failed to update profile.');
      }
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('All fields are required.');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match.");
      return;
    }
    setSavingPassword(true);
    try {
      const res = await userService.changePassword({
        currentPassword,
        newPassword,
      });

      if (res.success) {
        toast.success(res.message || 'Password changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(
          err.response?.data?.message || 'Failed to change password.',
        );
      } else {
        toast.error('Failed to change password.');
      }
    } finally {
      setSavingPassword(false);
    }
  };

  const tabs: { key: TTab; label: string; icon: React.ReactNode }[] = [
    { key: 'profile', label: 'Edit profile', icon: <User size={15} /> },
    { key: 'password', label: 'Change password', icon: <Lock size={15} /> },
    { key: 'settings', label: 'Settings', icon: <Settings size={15} /> },
  ];

  const hasChanges = useMemo(() => {
    if (!initialData) return false;
    if (name !== initialData.name) return true;
    if (phone !== (initialData.phone ?? '')) return true;
    if (imageFile) return true;
    if (isLearner) {
      if (JSON.stringify(skills) !== JSON.stringify(initialData.skills ?? [])) {
        return true;
      }
    }
    if (isMentor) {
      if (bio !== (initialData.bio ?? '')) return true;
      if (experience !== (initialData.experience ?? '')) return true;
      if (hourlyRate !== (initialData.hourlyRate?.toString() ?? '')) {
        return true;
      }
      if (
        JSON.stringify(availability) !==
        JSON.stringify(initialData.availability ?? [])
      ) {
        return true;
      }
    }
    return false;
  }, [
    name,
    phone,
    imageFile,
    skills,
    bio,
    experience,
    hourlyRate,
    availability,
    initialData,
    isLearner,
    isMentor,
  ]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16">
          {preview || user?.profileImage ? (
            <Image
              src={preview || user!.profileImage!}
              alt={user!.name}
              fill
              className="rounded-2xl object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-2xl font-bold">
              {user?.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
          )}
          {/* Upload button */}
          <label className="group absolute -bottom-1 -right-1 bg-white border border-gray-200 rounded-full p-1.5 cursor-pointer shadow-sm hover:bg-gray-50">
            <Camera size={18} />

            {/* Tooltip */}
            <span className="absolute bottom-full right-1/2 translate-x-1/2 mb-2 whitespace-nowrap text-xs bg-gray-900 text-white px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
              Upload profile image
            </span>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        </div>
        <div>
          <h1
            className="text-2xl font-bold text-gray-900"
            style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
          >
            {user?.name}
          </h1>
          <p className="text-sm text-gray-400 capitalize">{user?.role}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all cursor-pointer -mb-px ${
              activeTab === tab.key
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* EDIT PROFILE TAB */}
      {activeTab === 'profile' && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Full name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className={inputClass}
            />
          </div>

          {/* Email — readonly */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Email address
            </label>
            <input
              value={user?.email ?? ''}
              disabled
              className={`${inputClass} bg-gray-50 text-gray-400 cursor-not-allowed`}
            />
            <p className="text-xs text-gray-400 mt-1">
              Email cannot be changed.
            </p>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Phone <span className="text-gray-400">(optional)</span>
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 234 567 8900"
              className={inputClass}
            />
          </div>

          {/* LEARNER SPECIFIC */}
          {isLearner && (
            <>
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                  Learning info
                </p>

                {/* Skills */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Skills
                  </label>

                  {/* Input + Add button */}
                  <div className="flex gap-2 mb-3">
                    <input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                      placeholder="e.g. React, Node.js..."
                      className={`${inputClass} flex-1`}
                    />
                    <button
                      onClick={addSkill}
                      className="px-4 h-11 text-sm font-medium text-white rounded-xl cursor-pointer hover:opacity-90 transition-all shrink-0 flex items-center gap-1.5"
                      style={{
                        background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                      }}
                    >
                      <Plus size={14} /> Add
                    </button>
                  </div>

                  {/* Skills container box */}
                  {skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2 p-3 border border-gray-200 rounded-xl bg-gray-50 min-h-12">
                      {skills.map((skill) => (
                        <span
                          key={skill}
                          className="flex items-center gap-1.5 text-xs font-semibold bg-white border border-indigo-200 text-indigo-700 px-3 py-1.5 rounded-lg shadow-sm"
                        >
                          {skill}
                          <button
                            onClick={() => removeSkill(skill)}
                            className="text-indigo-300 hover:text-red-400 cursor-pointer transition-colors"
                          >
                            <X size={11} />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center p-4 border border-dashed border-gray-200 rounded-xl bg-gray-50">
                      <p className="text-xs text-gray-400">
                        No skills added yet. Type a skill and press Add.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* MENTOR SPECIFIC */}
          {isMentor && (
            <div className="pt-2 border-t border-gray-100 space-y-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Mentor info
              </p>

              {/* Bio */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell learners about yourself..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-500 transition-all resize-none"
                />
              </div>

              {/* Experience */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Experience
                </label>
                <input
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="e.g. 5 years of full-stack development"
                  className={inputClass}
                />
              </div>

              {/* Hourly rate */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Hourly rate (USD)
                </label>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  placeholder="e.g. 80"
                  min={0}
                  className={inputClass}
                />
              </div>

              {/* Availability */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-gray-700">
                    Availability
                  </label>
                  <button
                    onClick={addAvailability}
                    className="flex items-center gap-1 text-xs text-indigo-600 font-medium hover:underline cursor-pointer"
                  >
                    <Plus size={12} /> Add slot
                  </button>
                </div>
                {availability.length === 0 && (
                  <p className="text-xs text-gray-400">
                    No availability slots added yet.
                  </p>
                )}
                <div className="space-y-2">
                  {availability.map((slot, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-3 border border-gray-200 rounded-xl"
                    >
                      <select
                        value={slot.day}
                        onChange={(e) =>
                          updateAvailability(index, 'day', e.target.value)
                        }
                        className="h-9 border border-gray-200 rounded-lg px-2 text-xs outline-none focus:border-indigo-500 transition-all cursor-pointer"
                      >
                        {days.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                      <input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) =>
                          updateAvailability(index, 'startTime', e.target.value)
                        }
                        className="h-9 border border-gray-200 rounded-lg px-2 text-xs outline-none focus:border-indigo-500 transition-all"
                      />
                      <span className="text-xs text-gray-400">to</span>
                      <input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) =>
                          updateAvailability(index, 'endTime', e.target.value)
                        }
                        className="h-9 border border-gray-200 rounded-lg px-2 text-xs outline-none focus:border-indigo-500 transition-all"
                      />
                      <button
                        onClick={() => removeAvailability(index)}
                        className="text-gray-300 hover:text-red-400 cursor-pointer transition-colors ml-auto"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleProfileSave}
            disabled={savingProfile || !hasChanges}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white rounded-xl disabled:opacity-60 disabled:cursor-not-allowed transition-all hover:opacity-90 cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
          >
            <Save size={15} />
            {savingProfile ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      )}

      {/* CHANGE PASSWORD TAB */}
      {activeTab === 'password' && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
          <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <Shield size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              If you signed up with Google, you may not have a password set.
              Password change will not work in that case.
            </p>
          </div>

          {/* Current password */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Current password
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className={`${inputClass} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowCurrent((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              New password
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className={`${inputClass} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowNew((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Confirm new password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className={`${inputClass} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            onClick={handlePasswordChange}
            disabled={savingPassword}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white rounded-xl disabled:opacity-60 disabled:cursor-not-allowed transition-all hover:opacity-90 cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
          >
            <Lock size={15} />
            {savingPassword ? 'Changing...' : 'Change password'}
          </button>
        </div>
      )}

      {/* SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
          <div>
            <h2
              className="text-base font-semibold text-gray-900 mb-1"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              Account settings
            </h2>
            <p className="text-xs text-gray-400">
              Manage your account preferences.
            </p>
          </div>

          {/* Email notifications */}
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-800">
                Email notifications
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Receive emails about sessions and updates
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-10 h-5 bg-gray-200 peer-checked:bg-indigo-600 rounded-full transition-colors" />
              <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
            </label>
          </div>

          {/* Session reminders */}
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-800">
                Session reminders
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Get reminded 1 hour before sessions
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-10 h-5 bg-gray-200 peer-checked:bg-indigo-600 rounded-full transition-colors" />
              <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
            </label>
          </div>

          {/* Danger zone */}
          <div className="pt-4">
            <p className="text-xs font-medium text-red-500 uppercase tracking-wider mb-3">
              Danger zone
            </p>
            <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition-all cursor-pointer">
              <Trash2 size={15} />
              Delete account
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
