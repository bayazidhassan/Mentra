'use client';

import { Search, Users } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';
import {
  learnerService,
  TAllLearner,
  TMyLearner,
} from '../../../services/learner';

type TTab = 'my' | 'all';

const LearnersPage = () => {
  const [activeTab, setActiveTab] = useState<TTab>('my');

  const [myLearners, setMyLearners] = useState<TMyLearner[]>([]);
  const [myLoading, setMyLoading] = useState(true);

  const [allLearners, setAllLearners] = useState<TAllLearner[]>([]);
  const [allLoading, setAllLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 500);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await learnerService.getMyLearners();
        setMyLearners(data);
      } catch {
        setMyLearners([]);
      } finally {
        setMyLoading(false);
      }
    };
    fetch();
  }, []);

  useEffect(() => {
    if (activeTab !== 'all') return;
    const fetch = async () => {
      setAllLoading(true);
      try {
        const data = await learnerService.getAllLearners({
          search: debouncedSearch,
          page,
          limit: 10,
        });
        setAllLearners(data.learners);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      } catch {
        setAllLearners([]);
      } finally {
        setAllLoading(false);
      }
    };
    fetch();
  }, [activeTab, debouncedSearch, page]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1
          className="text-2xl font-bold text-gray-900"
          style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
        >
          Learners
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          View your learners or browse all learners on the platform.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('my')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
            activeTab === 'my'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          My learners
          {myLearners.length > 0 && (
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                activeTab === 'my'
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {myLearners.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          All learners
        </button>
      </div>

      {/* My learners */}
      {activeTab === 'my' && (
        <>
          {myLoading && (
            <div className="flex items-center justify-center h-48">
              <div className="w-7 h-7 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {!myLoading && myLearners.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                <Users size={24} className="text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-500">
                No learners yet
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Learners who book sessions with you will appear here.
              </p>
            </div>
          )}
          {!myLoading && myLearners.length > 0 && (
            <div className="space-y-3">
              {myLearners.map((learner) => (
                <div
                  key={learner._id}
                  className="flex items-center gap-4 bg-white border border-gray-200 rounded-2xl p-5 hover:border-indigo-200 transition-all"
                >
                  {learner.profileImage ? (
                    <Image
                      src={learner.profileImage}
                      alt={learner.name}
                      width={44}
                      height={44}
                      className="rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-base shrink-0">
                      {learner.name[0].toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {learner.name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {learner.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-6 shrink-0">
                    <div className="text-center">
                      <p
                        className="text-lg font-bold text-gray-900"
                        style={{
                          fontFamily: 'Bricolage Grotesque, sans-serif',
                        }}
                      >
                        {learner.totalSessions}
                      </p>
                      <p className="text-xs text-gray-400">Sessions</p>
                    </div>
                    <div className="text-center">
                      <p
                        className="text-lg font-bold text-green-600"
                        style={{
                          fontFamily: 'Bricolage Grotesque, sans-serif',
                        }}
                      >
                        {learner.completedSessions}
                      </p>
                      <p className="text-xs text-gray-400">Completed</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* All learners */}
      {activeTab === 'all' && (
        <>
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
            {!allLoading && (
              <p className="text-sm text-gray-500 shrink-0">
                {total} learner{total !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {allLoading && (
            <div className="flex items-center justify-center h-48">
              <div className="w-7 h-7 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!allLoading && allLearners.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                <Users size={24} className="text-gray-300" />
              </div>
              <p className="text-sm text-gray-500">No learners found</p>
            </div>
          )}

          {!allLoading && allLearners.length > 0 && (
            <>
              <div className="space-y-3">
                {allLearners.map((learner) => (
                  <div
                    key={learner._id}
                    className="flex items-center gap-4 bg-white border border-gray-200 rounded-2xl p-5 hover:border-indigo-200 transition-all"
                  >
                    {learner.profileImage ? (
                      <Image
                        src={learner.profileImage}
                        alt={learner.name}
                        width={44}
                        height={44}
                        className="rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-base shrink-0">
                        {learner.name[0].toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {learner.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {learner.email}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-9 h-9 text-sm font-medium rounded-xl transition-all cursor-pointer ${
                          page === p
                            ? 'text-white'
                            : 'text-gray-600 border border-gray-200 hover:border-indigo-300'
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
                    ),
                  )}
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
        </>
      )}
    </div>
  );
};

export default LearnersPage;
