'use client';

import { Ban, CheckCircle, Search, UserCheck } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useDebounce } from 'use-debounce';
import { adminService, TAdminMentor } from '../../../../../services/admin';

type TTab = 'pending' | 'approved';

const AdminMentorsPage = () => {
  const [activeTab, setActiveTab] = useState<TTab>('pending');
  const [mentors, setMentors] = useState<TAdminMentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 500);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchMentors = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getMentors({
        search: debouncedSearch,
        approved: activeTab === 'approved',
        page,
        limit: 10,
      });

      setMentors(data.mentors);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      setMentors([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, activeTab, page]);

  useEffect(() => {
    fetchMentors();
  }, [fetchMentors]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, activeTab]);

  const handleApprove = async (mentor: TAdminMentor) => {
    if (!mentor.mentorProfileId) return;

    setActionLoading(mentor._id);

    // Optimistic update (instant UI)
    const removedMentor = mentor;

    setMentors((prev) => prev.filter((m) => m._id !== mentor._id));
    setTotal((prev) => Math.max(0, prev - 1));

    try {
      await adminService.approveMentor(mentor.mentorProfileId);
      toast.success(`${mentor.name} has been approved as a mentor.`);

      // Background sync
      fetchMentors();
    } catch (err: unknown) {
      // Rollback if failed
      setMentors((prev) => [removedMentor, ...prev]);
      setTotal((prev) => prev + 1);

      const message = err instanceof Error ? err.message : 'Failed to approve.';
      toast.error(message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleBan = async (mentor: TAdminMentor) => {
    const action = mentor.isBanned ? 'unban' : 'ban';
    if (!confirm(`Are you sure you want to ${action} ${mentor.name}?`)) return;
    setActionLoading(mentor._id);
    try {
      if (mentor.isBanned) {
        await adminService.unbanMentor(mentor._id);
      } else {
        await adminService.banMentor(mentor._id);
      }
      setMentors((prev) =>
        prev.map((m) =>
          m._id === mentor._id ? { ...m, isBanned: !m.isBanned } : m,
        ),
      );
      toast.success(`Mentor ${action}ned successfully.`);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : `Failed to ${action}.`;
      toast.error(message);
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
          Mentors
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Approve pending mentors and manage approved mentor accounts.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {(['pending', 'approved'] as TTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer capitalize ${
              activeTab === tab
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'pending' ? 'Pending approval' : 'Approved'}
          </button>
        ))}
      </div>

      {/* Search */}
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
            {total} mentor{total !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center h-48">
          <div className="w-7 h-7 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && mentors.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
            <UserCheck size={24} className="text-gray-300" />
          </div>
          <p className="text-sm text-gray-500">
            {activeTab === 'pending'
              ? 'No pending mentor applications'
              : 'No approved mentors found'}
          </p>
        </div>
      )}

      {!loading && mentors.length > 0 && (
        <>
          <div className="space-y-3">
            {mentors.map((mentor) => (
              <div
                key={mentor._id}
                className={`flex items-center gap-4 bg-white border rounded-2xl p-5 transition-all ${
                  mentor.isBanned
                    ? 'border-red-200 bg-red-50/30'
                    : 'border-gray-200'
                }`}
              >
                {mentor.profileImage ? (
                  <div className="w-11 h-11 rounded-full overflow-hidden shrink-0">
                    <Image
                      src={mentor.profileImage}
                      alt={mentor.name}
                      width={44}
                      height={44}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-11 h-11 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-base shrink-0">
                    {mentor.name[0].toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {mentor.name}
                    </p>
                    {mentor.isBanned && (
                      <span className="text-xs font-medium bg-red-100 text-red-600 px-2 py-0.5 rounded-full shrink-0">
                        Banned
                      </span>
                    )}
                    {mentor.rating > 0 && (
                      <span className="text-xs text-yellow-600 shrink-0">
                        ★ {mentor.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 truncate">
                    {mentor.email}
                  </p>
                  {mentor.experience && (
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {mentor.experience}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {activeTab === 'pending' && (
                    <button
                      onClick={() => handleApprove(mentor)}
                      disabled={actionLoading === mentor._id}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-green-600 border border-green-200 rounded-xl hover:bg-green-50 disabled:opacity-50 transition-all cursor-pointer"
                    >
                      <CheckCircle size={13} />
                      {actionLoading === mentor._id
                        ? 'Approving...'
                        : 'Approve'}
                    </button>
                  )}
                  {activeTab === 'approved' && (
                    <button
                      onClick={() => handleBan(mentor)}
                      disabled={actionLoading === mentor._id}
                      className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border disabled:opacity-50 transition-all cursor-pointer ${
                        mentor.isBanned
                          ? 'text-green-600 border-green-200 hover:bg-green-50'
                          : 'text-red-600 border-red-200 hover:bg-red-50'
                      }`}
                    >
                      <Ban size={13} />
                      {actionLoading === mentor._id
                        ? 'Loading...'
                        : mentor.isBanned
                          ? 'Unban'
                          : 'Ban'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
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
                className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
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

export default AdminMentorsPage;
