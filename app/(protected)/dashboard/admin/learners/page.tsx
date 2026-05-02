'use client';

import axios from 'axios';
import { Ban, Search, Users } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useDebounce } from 'use-debounce';
import { adminService, TAdminLearner } from '../../../../../services/admin';

const AdminLearnersPage = () => {
  const [learners, setLearners] = useState<TAdminLearner[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 500);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await adminService.getLearners({
          search: debouncedSearch,
          page,
          limit: 10,
        });
        setLearners(data.learners);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      } catch {
        setLearners([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [debouncedSearch, page]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const handleBan = async (learner: TAdminLearner) => {
    const action = learner.isBanned ? 'unban' : 'ban';
    if (!confirm(`Are you sure you want to ${action} ${learner.name}?`)) return;
    setActionLoading(learner._id);
    try {
      if (learner.isBanned) {
        await adminService.unbanUser(learner._id);
      } else {
        await adminService.banUser(learner._id);
      }
      setLearners((prev) =>
        prev.map((l) =>
          l._id === learner._id ? { ...l, isBanned: !l.isBanned } : l,
        ),
      );
      toast.success(`User ${action}ned successfully.`);
    } catch (err: unknown) {
      toast.error(
        axios.isAxiosError(err)
          ? err.response?.data?.message || `Failed to ${action}.`
          : `Failed to ${action}.`,
      );
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1
          className="text-2xl font-bold text-gray-900"
          style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
        >
          Learners
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage all learner accounts on the platform.
        </p>
      </div>

      {/* Search + count */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full h-11 pl-9 pr-4 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500 transition-all bg-white"
          />
        </div>
        {!loading && (
          <p className="text-sm text-gray-500 shrink-0">
            {total} learner{total !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center h-48">
          <div className="w-7 h-7 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && learners.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
            <Users size={24} className="text-gray-300" />
          </div>
          <p className="text-sm text-gray-500">No learners found</p>
        </div>
      )}

      {!loading && learners.length > 0 && (
        <>
          <div className="space-y-3">
            {learners.map((learner) => (
              <div
                key={learner._id}
                className={`flex items-center gap-4 bg-white border rounded-2xl p-5 transition-all ${
                  learner.isBanned
                    ? 'border-red-200 bg-red-50/30'
                    : 'border-gray-200'
                }`}
              >
                {learner.profileImage ? (
                  <div className="w-11 h-11 rounded-full overflow-hidden shrink-0">
                    <Image
                      src={learner.profileImage}
                      alt={learner.name}
                      width={44}
                      height={44}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-11 h-11 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-base shrink-0">
                    {learner.name[0].toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {learner.name}
                    </p>
                    {learner.isBanned && (
                      <span className="text-xs font-medium bg-red-100 text-red-600 px-2 py-0.5 rounded-full shrink-0">
                        Banned
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 truncate">
                    {learner.email}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Joined{' '}
                    {new Date(learner.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <button
                  onClick={() => handleBan(learner)}
                  disabled={actionLoading === learner._id}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border transition-all cursor-pointer disabled:opacity-50 shrink-0 ${
                    learner.isBanned
                      ? 'text-green-600 border-green-200 hover:bg-green-50'
                      : 'text-red-600 border-red-200 hover:bg-red-50'
                  }`}
                >
                  <Ban size={13} />
                  {actionLoading === learner._id
                    ? 'Loading...'
                    : learner.isBanned
                      ? 'Unban'
                      : 'Ban'}
                </button>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:border-indigo-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 text-sm font-medium rounded-xl transition-all cursor-pointer ${page === p ? 'text-white' : 'text-gray-600 border border-gray-200'}`}
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
                className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:border-indigo-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminLearnersPage;
