'use client';

import axios from 'axios';
import { Brain, Search, Sparkles, Star, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useDebounce } from 'use-debounce';
import BookSessionModal from '../../../components/modal/BookSessionModal';
import {
  mentorService,
  TMentor,
  TSuggestedMentor,
} from '../../../services/mentor';

type TMode = 'manual' | 'ai';

const MentorsPage = () => {
  const [mode, setMode] = useState<TMode>('manual');

  // ── Manual search state ────────────────────────────────────────────────────
  const [mentors, setMentors] = useState<TMentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 500);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [bookingMentor, setBookingMentor] = useState<TMentor | null>(null);

  // ── AI suggestion state ────────────────────────────────────────────────────
  const [suggested, setSuggested] = useState<TSuggestedMentor[]>([]);
  const [suggesting, setSuggesting] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  // ── Manual fetch ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (mode !== 'manual') return;
    const fetchMentors = async () => {
      setLoading(true);
      try {
        const data = await mentorService.getMentors({
          search: debouncedSearch,
          page,
          limit: 9,
        });
        setMentors(data.mentors);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      } catch {
        setMentors([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMentors();
  }, [debouncedSearch, page, mode]);

  // Reset page on search change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // ── AI suggestion fetch ────────────────────────────────────────────────────
  const handleGetSuggestions = async () => {
    setSuggesting(true);
    try {
      const data = await mentorService.getSuggestedMentors();
      setSuggested(data);
      setHasFetched(true);
      if (data.length === 0) {
        toast.info(
          'No mentors matched your roadmap goal. Try browsing manually.',
        );
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(
          err.response?.data?.message || 'Failed to get suggestions.',
        );
      } else {
        toast.error('Failed to get suggestions.');
      }
    } finally {
      setSuggesting(false);
    }
  };

  // ── Shared mentor card ─────────────────────────────────────────────────────
  const MentorCard = ({
    mentor,
    matchScore,
    matchReason,
  }: {
    mentor: TMentor;
    matchScore?: number;
    matchReason?: string;
  }) => (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-indigo-200 hover:-translate-y-1 transition-all duration-200 flex flex-col">
      {/* Avatar + name */}
      <div className="flex items-center gap-3 mb-4">
        {mentor.profileImage ? (
          <Image
            src={mentor.profileImage}
            alt={mentor.name}
            width={48}
            height={48}
            className="w-12 h-12 rounded-full object-cover shrink-0"
          />
        ) : (
          <div
            className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg shrink-0"
            style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
          >
            {mentor.name[0].toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {mentor.name}
          </h3>
          <p className="text-xs text-gray-400 truncate">{mentor.email}</p>
        </div>

        {/* AI match score badge */}
        {matchScore !== undefined && (
          <div className="ml-auto shrink-0 flex items-center gap-1 bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full">
            <Star size={11} className="fill-indigo-400 text-indigo-400" />
            <span className="text-xs font-semibold">{matchScore}/10</span>
          </div>
        )}
      </div>

      {/* AI match reason */}
      {matchReason && (
        <div className="mb-4 flex items-start gap-2 bg-indigo-50 rounded-xl px-3 py-2">
          <Sparkles size={13} className="text-indigo-400 mt-0.5 shrink-0" />
          <p className="text-xs text-indigo-700 leading-relaxed">
            {matchReason}
          </p>
        </div>
      )}

      {/* Bio */}
      {mentor.bio && (
        <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-2 flex-1">
          {mentor.bio}
        </p>
      )}

      {/* Meta row */}
      <div className="flex items-center gap-3 mb-4 text-xs text-gray-400">
        {mentor.rating > 0 && (
          <span className="flex items-center gap-1">
            <Star size={11} className="fill-yellow-400 text-yellow-400" />
            {mentor.rating.toFixed(1)}
            {mentor.totalReviews > 0 && ` (${mentor.totalReviews})`}
          </span>
        )}
        {mentor.hourlyRate !== undefined && (
          <span className="text-gray-400">${mentor.hourlyRate}/hr</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        <Link
          href={`/mentors/${mentor._id}`}
          className="flex-1 text-center py-2 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-xl hover:bg-indigo-50 transition-all"
        >
          View profile
        </Link>
        <button
          onClick={() => setBookingMentor(mentor)}
          className="flex-1 text-center py-2 text-xs font-medium text-white rounded-xl transition-all hover:opacity-90 cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
        >
          Book session
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-bold text-gray-900"
          style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
        >
          Find mentors
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Browse mentors or let AI match you based on your roadmap.
        </p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setMode('manual')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
            mode === 'manual'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Search size={15} />
          Browse mentors
        </button>
        <button
          onClick={() => setMode('ai')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
            mode === 'ai'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Brain size={15} />
          Suggested by AI
        </button>
      </div>

      {/* ── MANUAL MODE ───────────────────────────────────────────────────── */}
      {mode === 'manual' && (
        <>
          {/* Search + count */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full h-11 pl-9 pr-4 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(79,70,229,0.08)] transition-all bg-white"
              />
            </div>
            {!loading && (
              <p className="text-sm text-gray-500 shrink-0">
                {total > 0 ? `${total} mentors available` : 'No mentors found'}
              </p>
            )}
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Empty */}
          {!loading && mentors.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
                <Users size={24} className="text-indigo-400" />
              </div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                No mentors found
              </p>
              <p className="text-xs text-gray-400">
                {search
                  ? 'Try a different search term'
                  : 'No mentors available yet'}
              </p>
            </div>
          )}

          {/* Grid */}
          {!loading && mentors.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {mentors.map((mentor) => (
                <MentorCard key={mentor._id} mentor={mentor} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 text-sm font-medium rounded-xl transition-all cursor-pointer ${
                    page === p
                      ? 'text-white'
                      : 'text-gray-600 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
                  }`}
                  style={
                    page === p
                      ? {
                          background:
                            'linear-gradient(135deg, #4F46E5, #7C3AED)',
                        }
                      : {}
                  }
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* ── AI MODE ───────────────────────────────────────────────────────── */}
      {mode === 'ai' && (
        <>
          {/* Prompt card */}
          {!hasFetched && (
            <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center max-w-lg mx-auto">
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Brain size={26} className="text-indigo-500" />
              </div>
              <h2
                className="text-lg font-bold text-gray-900 mb-2"
                style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
              >
                AI Mentor Matching
              </h2>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                AI will analyze your active roadmap goal and match you with
                mentors whose experience aligns with what you want to learn.
              </p>
              <button
                onClick={handleGetSuggestions}
                disabled={suggesting}
                className="w-full h-11 flex items-center justify-center gap-2 text-sm font-medium text-white rounded-xl disabled:opacity-60 disabled:cursor-not-allowed transition-all hover:opacity-90"
                style={{
                  background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                }}
              >
                {suggesting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Analyzing your roadmap...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Get AI suggestions
                  </>
                )}
              </button>
            </div>
          )}

          {/* Loading state after first fetch */}
          {suggesting && hasFetched && (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Results */}
          {hasFetched && !suggesting && (
            <>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2
                    className="text-sm font-semibold text-gray-900"
                    style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
                  >
                    {suggested.length > 0
                      ? `${suggested.length} mentor${suggested.length !== 1 ? 's' : ''} matched your roadmap`
                      : 'No matches found'}
                  </h2>
                  {suggested.length > 0 && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Ranked by match score · based on your active roadmap
                    </p>
                  )}
                </div>
                <button
                  onClick={handleGetSuggestions}
                  disabled={suggesting}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-xl hover:bg-indigo-50 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Sparkles size={13} />
                  Refresh suggestions
                </button>
              </div>

              {/* Empty */}
              {suggested.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                    <Users size={24} className="text-gray-300" />
                  </div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    No mentor matches found
                  </p>
                  <p className="text-xs text-gray-400 mb-4">
                    No mentors scored high enough for your current roadmap goal.
                  </p>
                  <button
                    onClick={() => setMode('manual')}
                    className="text-xs text-indigo-600 font-medium hover:underline"
                  >
                    Browse all mentors instead
                  </button>
                </div>
              )}

              {/* Suggested grid */}
              {suggested.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {suggested.map((mentor) => (
                    <MentorCard
                      key={mentor._id}
                      mentor={mentor}
                      matchScore={mentor.matchScore}
                      matchReason={mentor.matchReason}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {bookingMentor && (
        <BookSessionModal
          mentorProfileId={bookingMentor._id}
          mentorName={bookingMentor.name}
          onClose={() => setBookingMentor(null)}
          onSuccess={() => setBookingMentor(null)}
        />
      )}
    </div>
  );
};

export default MentorsPage;
