'use client';

import {
  ArrowLeft,
  Briefcase,
  Calendar,
  Clock,
  DollarSign,
  Mail,
  Star,
  Users,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import BookSessionModal from '../../../../components/modal/BookSessionModal';
import { mentorService, TMentor } from '../../../../services/mentor';

const DAYS_ORDER = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const MentorProfilePage = () => {
  const { id } = useParams() as { id: string };
  const [mentor, setMentor] = useState<TMentor | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBookModal, setShowBookModal] = useState(false);

  useEffect(() => {
    const fetchMentor = async () => {
      try {
        const data = await mentorService.getMentorById(id);
        setMentor(data);
      } catch {
        setMentor(null);
      } finally {
        setLoading(false);
      }
    };
    fetchMentor();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-sm font-medium text-gray-700 mb-1">
          Mentor not found
        </p>
        <Link
          href="/mentors"
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
      <div className="max-w-3xl mx-auto space-y-5">
        {/* Back */}
        <Link
          href="/mentors"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft size={16} /> Back to mentors
        </Link>

        {/* Profile card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8">
          <div className="flex items-start gap-6 flex-wrap sm:flex-nowrap">
            {mentor.profileImage ? (
              <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0">
                <Image
                  src={mentor.profileImage}
                  alt={mentor.name}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div
                className="w-20 h-20 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-3xl font-bold shrink-0"
                style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
              >
                {mentor.name[0].toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1
                className="text-2xl font-bold text-gray-900 mb-1"
                style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
              >
                {mentor.name}
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                <Mail size={14} />
                {mentor.email}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center text-xs font-medium bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full">
                  Mentor
                </span>
                {mentor.rating > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium bg-yellow-50 text-yellow-600 px-3 py-1 rounded-full">
                    <Star
                      size={11}
                      className="fill-yellow-400 text-yellow-400"
                    />
                    {mentor.rating.toFixed(1)}
                    {mentor.totalReviews > 0 && (
                      <span className="text-yellow-500">
                        ({mentor.totalReviews} reviews)
                      </span>
                    )}
                  </span>
                )}
                {mentor.hourlyRate !== undefined && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium bg-green-50 text-green-600 px-3 py-1 rounded-full">
                    <DollarSign size={11} />${mentor.hourlyRate}/hr
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div>
          <button
            onClick={() => setShowBookModal(true)}
            className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-medium text-white rounded-xl transition-all hover:opacity-90 hover:-translate-y-0.5 cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
          >
            <Calendar size={16} />
            Book a session
          </button>
        </div>

        {/* Bio */}
        {mentor.bio && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Users size={16} className="text-indigo-500" />
              <h2
                className="text-sm font-semibold text-gray-900"
                style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
              >
                About
              </h2>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              {mentor.bio}
            </p>
          </div>
        )}

        {/* Experience */}
        {mentor.experience && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Briefcase size={16} className="text-indigo-500" />
              <h2
                className="text-sm font-semibold text-gray-900"
                style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
              >
                Experience
              </h2>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              {mentor.experience}
            </p>
          </div>
        )}

        {/* Availability */}
        {sortedAvailability.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={16} className="text-indigo-500" />
              <h2
                className="text-sm font-semibold text-gray-900"
                style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
              >
                Availability
              </h2>
            </div>
            <div className="space-y-2">
              {sortedAvailability.map((slot, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2.5 px-4 bg-gray-50 rounded-xl"
                >
                  <span className="text-sm font-medium text-gray-700 w-12">
                    {slot.day}
                  </span>
                  <span className="text-sm text-gray-500">
                    {slot.startTime} – {slot.endTime}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Book session modal */}
      {showBookModal && (
        <BookSessionModal
          mentorProfileId={id}
          mentorName={mentor.name}
          onClose={() => setShowBookModal(false)}
          onSuccess={() => setShowBookModal(false)}
        />
      )}
    </>
  );
};

export default MentorProfilePage;
