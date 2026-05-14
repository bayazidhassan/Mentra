'use client';

import {
  ArrowLeft,
  Briefcase,
  Calendar,
  Clock,
  DollarSign,
  Mail,
  Star,
  UserRound,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { TMentor } from '../../../lib/services/mentor';
import BookSessionModal from '../../modal/BookSessionModal';

const DAYS_ORDER = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const formatAvailTime = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
};

type Props = { mentor: TMentor | null };

const MentorProfileClientPage = ({ mentor }: Props) => {
  const [showBookModal, setShowBookModal] = useState(false);

  if (!mentor) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-sm font-medium text-gray-700 mb-1">
          Mentor not found
        </p>
        <Link
          href="/dashboard/learner/mentors"
          className="text-xs text-indigo-600 hover:underline"
        >
          Back to mentors
        </Link>
      </div>
    );
  }

  const sortedAvailability = mentor.availability
    ? [...mentor.availability].sort(
        (a, b) => DAYS_ORDER.indexOf(a.day) - DAYS_ORDER.indexOf(b.day),
      )
    : [];

  return (
    <>
      <div className="max-w-2xl mx-auto space-y-5 pb-10">
        {/* Back */}
        <Link
          href="/dashboard/learner/mentors"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-indigo-600 transition-colors group"
        >
          <ArrowLeft
            size={15}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          Back to mentors
        </Link>

        {/* ── Profile Header ── */}
        <div className="flex items-center gap-4">
          {mentor.profileImage ? (
            <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-gray-100">
              <Image
                src={mentor.profileImage}
                alt={mentor.name}
                width={56}
                height={56}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-xl shrink-0 bg-indigo-50 flex items-center justify-center text-xl font-bold text-indigo-600 border border-indigo-100">
              {mentor.name[0].toUpperCase()}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-gray-900 leading-tight">
              {mentor.name}
            </h1>
            <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
              <Mail size={11} />
              <span className="truncate">{mentor.email}</span>
            </div>
            <div className="mt-2 flex items-center gap-3 flex-wrap">
              <span className="text-[11px] font-semibold text-white px-2.5 py-0.5 rounded-full tracking-wide bg-linear-to-r from-indigo-600 to-violet-600">
                MENTOR
              </span>
              {mentor.rating > 0 && (
                <span className="inline-flex items-center gap-1 text-[11px] text-amber-500 font-medium">
                  <Star size={10} className="fill-amber-400 text-amber-400" />
                  {mentor.rating.toFixed(1)}
                  {mentor.totalReviews > 0 && (
                    <span className="text-gray-400">
                      · {mentor.totalReviews}{' '}
                      {mentor.totalReviews === 1 ? 'review' : 'reviews'}
                    </span>
                  )}
                </span>
              )}
              {!!mentor.hourlyRate && (
                <span className="inline-flex items-center gap-0.5 text-[11px] text-green-600 font-medium">
                  <DollarSign size={10} />
                  {mentor.hourlyRate}/hr
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Book Button ── */}
        <button
          onClick={() => setShowBookModal(true)}
          className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white rounded-xl transition-all cursor-pointer hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
        >
          <Calendar size={15} />
          Book a Session
        </button>

        {/* ── About ── */}
        {mentor.bio && (
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-100">
              <UserRound size={14} className="text-indigo-500" />
              <h2 className="text-sm font-semibold text-gray-800">Bio</h2>
            </div>
            <div className="px-5 py-4">
              <p className="text-sm text-gray-600 leading-relaxed">
                {mentor.bio}
              </p>
            </div>
          </div>
        )}

        {/* ── Experience ── */}
        {mentor.experience && (
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-100">
              <Briefcase size={14} className="text-indigo-500" />
              <h2 className="text-sm font-semibold text-gray-800">
                Experience
              </h2>
            </div>
            <div className="px-5 py-4">
              <p className="text-sm text-gray-600 leading-relaxed">
                {mentor.experience}
              </p>
            </div>
          </div>
        )}

        {/* ── Availability ── */}
        {sortedAvailability.length > 0 && (
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-100">
              <Clock size={14} className="text-indigo-500" />
              <h2 className="text-sm font-semibold text-gray-800">
                Weekly Availability
              </h2>
              <span className="ml-auto text-[11px] text-gray-400">
                {sortedAvailability.length} day
                {sortedAvailability.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="px-5 py-3 space-y-1.5">
              {sortedAvailability.map((slot, i) => {
                const [sh, sm] = slot.startTime.split(':').map(Number);
                const [eh, em] = slot.endTime.split(':').map(Number);
                const mins = eh * 60 + em - (sh * 60 + sm);
                const hours = mins / 60;
                const duration = Number.isInteger(hours)
                  ? `${hours}h`
                  : `${hours.toFixed(1)}h`;
                return (
                  <div
                    key={i}
                    className="flex items-center border border-indigo-100 gap-3 py-2 px-3 rounded-lg bg-gray-50 hover:bg-indigo-50 transition-colors"
                  >
                    <span className="w-10 text-center text-[11px] font-bold text-indigo-600 bg-indigo-100 rounded-md py-1">
                      {slot.day}
                    </span>
                    <span className="text-sm text-gray-700">
                      {formatAvailTime(slot.startTime)}
                      <span className="mx-1.5 text-gray-300">→</span>
                      {formatAvailTime(slot.endTime)}
                    </span>
                    <span className="ml-auto text-[11px] text-gray-400">
                      {duration}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {showBookModal && (
        <BookSessionModal
          mentorProfileId={mentor._id}
          mentorName={mentor.name}
          onClose={() => setShowBookModal(false)}
          onSuccess={() => setShowBookModal(false)}
        />
      )}
    </>
  );
};

export default MentorProfileClientPage;
