'use client';

import axios from 'axios';
import { ArrowLeft, Calendar, Clock, DollarSign } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { mentorService, TMentor } from '../../../../../services/mentor';
import { sessionService } from '../../../../../services/session';

const durations = [30, 60, 90, 120];

const BookSessionPage = () => {
  const { mentorId } = useParams() as { mentorId: string };
  const router = useRouter();
  const [mentor, setMentor] = useState<TMentor | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [duration, setDuration] = useState(60);
  const [price, setPrice] = useState('');

  useEffect(() => {
    const fetchMentor = async () => {
      try {
        const data = await mentorService.getMentorById(mentorId);
        setMentor(data);
      } catch {
        setMentor(null);
      } finally {
        setLoading(false);
      }
    };
    fetchMentor();
  }, [mentorId]);

  const handleSubmit = async () => {
    if (!title || !scheduledAt || !price) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      await sessionService.bookSession({
        mentor: mentorId,
        title,
        description,
        scheduledAt,
        duration,
        price: Number(price),
      });
      toast.success('Session booked successfully!');
      router.push('/sessions');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || 'Failed to book session.');
      } else {
        toast.error('Failed to book session.');
      }
    } finally {
      setSubmitting(false);
    }
  };

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
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back */}
      <Link
        href={`/mentors/${mentorId}`}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft size={16} /> Back to profile
      </Link>

      <h1
        className="text-2xl font-bold text-gray-900"
        style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
      >
        Book a session
      </h1>

      {/* Mentor card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3">
        {mentor.profileImage ? (
          <Image
            src={mentor.profileImage}
            alt={mentor.name}
            className="w-12 h-12 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold shrink-0">
            {mentor.name[0].toUpperCase()}
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-gray-900">{mentor.name}</p>
          <p className="text-xs text-gray-400">{mentor.email}</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
        {/* Title */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Session title <span className="text-red-400">*</span>
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. React fundamentals review"
            className="w-full h-11 border border-gray-200 rounded-xl px-3 text-sm outline-none focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(79,70,229,0.08)] transition-all"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Description <span className="text-gray-400">(optional)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What do you want to cover in this session?"
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-500 transition-all resize-none"
          />
        </div>

        {/* Date & Time */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            <span className="flex items-center gap-1">
              <Calendar size={12} /> Date & time{' '}
              <span className="text-red-400">*</span>
            </span>
          </label>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
            className="w-full h-11 border border-gray-200 rounded-xl px-3 text-sm outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Duration */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            <span className="flex items-center gap-1">
              <Clock size={12} /> Duration
            </span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {durations.map((d) => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className={`py-2 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                  duration === d
                    ? 'text-white border-transparent'
                    : 'text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
                }`}
                style={
                  duration === d
                    ? {
                        background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                      }
                    : {}
                }
              >
                {d} min
              </button>
            ))}
          </div>
        </div>

        {/* Price */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            <span className="flex items-center gap-1">
              <DollarSign size={12} /> Price (USD){' '}
              <span className="text-red-400">*</span>
            </span>
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g. 50"
            min={0}
            className="w-full h-11 border border-gray-200 rounded-xl px-3 text-sm outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full h-12 flex items-center justify-center text-sm font-medium text-white rounded-xl disabled:opacity-60 disabled:cursor-not-allowed transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
        >
          {submitting ? 'Booking...' : 'Book session'}
        </button>
      </div>
    </div>
  );
};

export default BookSessionPage;
