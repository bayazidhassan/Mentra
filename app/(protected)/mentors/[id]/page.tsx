'use client';

import { ArrowLeft, Calendar, Mail, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { mentorService, TMentor } from '../../../../services/mentor';

const MentorProfilePage = () => {
  const { id } = useParams() as { id: string };
  const [mentor, setMentor] = useState<TMentor | null>(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back button */}
      <Link
        href="/mentors"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft size={16} /> Back to mentors
      </Link>

      {/* Profile card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-8">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          {mentor.profileImage ? (
            <Image
              src={mentor.profileImage}
              alt={mentor.name}
              className="w-20 h-20 rounded-2xl object-cover shrink-0"
            />
          ) : (
            <div
              className="w-20 h-20 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-3xl font-bold shrink-0"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              {mentor.name[0].toUpperCase()}
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1
              className="text-2xl font-bold text-gray-900 mb-1"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              {mentor.name}
            </h1>
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
              <Mail size={14} />
              {mentor.email}
            </div>
            <span className="inline-flex items-center text-xs font-medium bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full">
              Mentor
            </span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href={`/sessions/book/${mentor._id}`}
          className="flex items-center justify-center gap-2 py-3.5 text-sm font-medium text-white rounded-xl transition-all hover:opacity-90 hover:-translate-y-0.5"
          style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
        >
          <Calendar size={16} />
          Book a session
        </Link>
        <Link
          href={`/chat?mentorId=${mentor._id}`}
          className="flex items-center justify-center gap-2 py-3.5 text-sm font-medium text-indigo-600 border border-indigo-200 rounded-xl hover:bg-indigo-50 transition-all"
        >
          <MessageSquare size={16} />
          Send a message
        </Link>
      </div>
    </div>
  );
};

export default MentorProfilePage;
