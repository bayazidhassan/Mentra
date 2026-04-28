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

const formatAvailTime = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
};

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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;500;600;700;800&display=swap');

        .mentor-hero {
          background: linear-gradient(135deg, #f0f0ff 0%, #faf5ff 50%, #f0f9ff 100%);
          position: relative;
          overflow: hidden;
        }
        .mentor-hero::before {
          content: '';
          position: absolute;
          top: -60px;
          right: -60px;
          width: 240px;
          height: 240px;
          background: radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%);
          border-radius: 50%;
        }
        .mentor-hero::after {
          content: '';
          position: absolute;
          bottom: -40px;
          left: -40px;
          width: 180px;
          height: 180px;
          background: radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%);
          border-radius: 50%;
        }
        .book-btn {
          position: relative;
          overflow: hidden;
        }
        .book-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
          pointer-events: none;
        }
        .day-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.02em;
        }
        .section-card {
          background: white;
          border: 1px solid #ebebf5;
          border-radius: 20px;
          overflow: hidden;
        }
        .section-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 20px 24px 16px;
          border-bottom: 1px solid #f0f0f8;
        }
        .section-icon {
          width: 32px;
          height: 32px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #ede9fe, #dbeafe);
        }
        .avatar-ring {
          background: linear-gradient(135deg, #4F46E5, #7C3AED);
          padding: 3px;
          border-radius: 22px;
        }
      `}</style>

      <div className="max-w-2xl mx-auto space-y-4 pb-10">
        {/* Back */}
        <Link
          href="/mentors"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-indigo-600 transition-colors group"
        >
          <ArrowLeft
            size={15}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          Back to mentors
        </Link>

        {/* ── Hero Card ── */}
        <div className="mentor-hero section-card">
          <div className="p-7 relative z-10">
            <div className="flex items-start gap-5">
              {/* Avatar */}
              {mentor.profileImage ? (
                <div className="avatar-ring shrink-0">
                  <div className="w-18 h-18 rounded-[18px] overflow-hidden">
                    <Image
                      src={mentor.profileImage}
                      alt={mentor.name}
                      width={72}
                      height={72}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              ) : (
                <div className="avatar-ring shrink-0">
                  <div
                    className="w-18 h-18 rounded-[18px] bg-white flex items-center justify-center text-2xl font-bold text-indigo-600"
                    style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
                  >
                    {mentor.name[0].toUpperCase()}
                  </div>
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0 pt-1">
                <h1
                  className="text-xl font-bold text-gray-900 leading-tight mb-1"
                  style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
                >
                  {mentor.name}
                </h1>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
                  <Mail size={12} />
                  <span className="truncate">{mentor.email}</span>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center text-[11px] font-semibold bg-indigo-600 text-white px-2.5 py-1 rounded-full tracking-wide">
                    MENTOR
                  </span>
                  {mentor.rating > 0 && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-white border border-amber-200 text-amber-600 px-2.5 py-1 rounded-full shadow-sm">
                      <Star
                        size={10}
                        className="fill-amber-400 text-amber-400"
                      />
                      {mentor.rating.toFixed(1)}
                      {mentor.totalReviews > 0 && (
                        <span className="text-amber-400 ml-0.5">
                          · {mentor.totalReviews} reviews
                        </span>
                      )}
                    </span>
                  )}
                  {mentor.hourlyRate !== undefined && (
                    <span className="inline-flex items-center gap-0.5 text-[11px] font-medium bg-white border border-green-200 text-green-600 px-2.5 py-1 rounded-full shadow-sm">
                      <DollarSign size={10} />
                      {mentor.hourlyRate}
                      <span className="text-green-400">/hr</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Book Button ── */}
        <button
          onClick={() => setShowBookModal(true)}
          className="book-btn w-full flex items-center justify-center gap-2 py-3.5 text-sm font-semibold text-white rounded-2xl transition-all hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shadow-lg shadow-indigo-200"
          style={{
            background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
          }}
        >
          <Calendar size={16} />
          Book a Session
        </button>

        {/* ── About ── */}
        {mentor.bio && (
          <div className="section-card">
            <div className="section-header">
              <div className="section-icon">
                <Users size={15} className="text-indigo-600" />
              </div>
              <h2
                className="text-sm font-semibold text-gray-800"
                style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
              >
                About
              </h2>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-gray-600 leading-relaxed">
                {mentor.bio}
              </p>
            </div>
          </div>
        )}

        {/* ── Experience ── */}
        {mentor.experience && (
          <div className="section-card">
            <div className="section-header">
              <div className="section-icon">
                <Briefcase size={15} className="text-indigo-600" />
              </div>
              <h2
                className="text-sm font-semibold text-gray-800"
                style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
              >
                Experience
              </h2>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-gray-600 leading-relaxed">
                {mentor.experience}
              </p>
            </div>
          </div>
        )}

        {/* ── Availability ── */}
        {sortedAvailability.length > 0 && (
          <div className="section-card">
            <div className="section-header">
              <div className="section-icon">
                <Clock size={15} className="text-indigo-600" />
              </div>
              <h2
                className="text-sm font-semibold text-gray-800"
                style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
              >
                Weekly Availability
              </h2>
              <span className="ml-auto text-[11px] text-gray-400 font-medium">
                {sortedAvailability.length} day
                {sortedAvailability.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="px-6 py-4 space-y-2">
              {sortedAvailability.map((slot, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 py-2.5 px-3.5 rounded-xl bg-gray-50 hover:bg-indigo-50 transition-colors"
                >
                  <div className="day-pill bg-indigo-100 text-indigo-600">
                    {slot.day}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 text-sm text-gray-700 font-medium">
                      <span>{formatAvailTime(slot.startTime)}</span>
                      <span className="text-gray-300">→</span>
                      <span>{formatAvailTime(slot.endTime)}</span>
                    </div>
                  </div>
                  <div className="text-[11px] text-gray-400 font-medium">
                    {(() => {
                      const [sh, sm] = slot.startTime.split(':').map(Number);
                      const [eh, em] = slot.endTime.split(':').map(Number);
                      const mins = eh * 60 + em - (sh * 60 + sm);
                      return `${mins / 60}h`;
                    })()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

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
