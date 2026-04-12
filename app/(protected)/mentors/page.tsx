'use client';

import { Search, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { mentorService, TMentor } from '../../../services/mentor';

const MentorsPage = () => {
  const [mentors, setMentors] = useState<TMentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 500);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
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
  }, [debouncedSearch, page]);

  // reset page on search
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-gray-900"
            style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
          >
            Find mentors
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {total > 0 ? `${total} mentors available` : 'No mentors found'}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search mentors by name or email..."
          className="w-full h-11 pl-9 pr-4 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(79,70,229,0.08)] transition-all bg-white"
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Empty state */}
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

      {/* Mentors grid */}
      {!loading && mentors.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {mentors.map((mentor) => (
            <div
              key={mentor._id}
              className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-indigo-200 hover:-translate-y-1 transition-all duration-200"
            >
              {/* Avatar */}
              <div className="flex items-center gap-3 mb-4">
                {mentor.profileImage ? (
                  <Image
                    src={mentor.profileImage}
                    alt={mentor.name}
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
                  <p className="text-xs text-gray-400 truncate">
                    {mentor.email}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Link
                  href={`/mentors/${mentor._id}`}
                  className="flex-1 text-center py-2 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-xl hover:bg-indigo-50 transition-all"
                >
                  View profile
                </Link>
                <Link
                  href={`/sessions/book/${mentor._id}`}
                  className="flex-1 text-center py-2 text-xs font-medium text-white rounded-xl transition-all hover:opacity-90"
                  style={{
                    background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                  }}
                >
                  Book session
                </Link>
              </div>
            </div>
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
                  ? { background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }
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
    </div>
  );
};

export default MentorsPage;
