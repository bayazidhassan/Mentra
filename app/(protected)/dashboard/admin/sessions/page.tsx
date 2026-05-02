'use client';

import { Calendar, Clock, DollarSign, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { adminService, TAdminSession } from '../../../../../services/admin';

const statusConfig: Record<
  string,
  { label: string; bg: string; color: string }
> = {
  pending: { label: 'Pending', bg: 'bg-yellow-50', color: 'text-yellow-700' },
  accepted: { label: 'Confirmed', bg: 'bg-green-50', color: 'text-green-700' },
  completed: {
    label: 'Completed',
    bg: 'bg-indigo-50',
    color: 'text-indigo-700',
  },
  cancelled: { label: 'Cancelled', bg: 'bg-red-50', color: 'text-red-600' },
};

const STATUS_FILTERS = ['all', 'pending', 'accepted', 'completed', 'cancelled'];

const AdminSessionsPage = () => {
  const [sessions, setSessions] = useState<TAdminSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 500);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await adminService.getSessions({
          search: debouncedSearch,
          status: statusFilter === 'all' ? undefined : statusFilter,
          page,
          limit: 10,
        });
        setSessions(data.sessions);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      } catch {
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [debouncedSearch, statusFilter, page]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1
          className="text-2xl font-bold text-gray-900"
          style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
        >
          Sessions
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Overview of all sessions on the platform.
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, learner, mentor..."
            className="w-full h-11 pl-9 pr-4 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500 transition-all bg-white"
          />
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl flex-wrap">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer capitalize ${
                statusFilter === s
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {!loading && (
          <p className="text-sm text-gray-500 ml-auto shrink-0">
            {total} session{total !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center h-48">
          <div className="w-7 h-7 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && sessions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
            <Calendar size={24} className="text-gray-300" />
          </div>
          <p className="text-sm text-gray-500">No sessions found</p>
        </div>
      )}

      {!loading && sessions.length > 0 && (
        <>
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-12 gap-3 px-5 py-3 bg-gray-50 border-b border-gray-100">
              <p className="col-span-3 text-xs font-medium text-gray-500">
                Session
              </p>
              <p className="col-span-4 text-xs font-medium text-gray-500">
                Learner → Mentor
              </p>
              <p className="col-span-2 text-xs font-medium text-gray-500">
                Date
              </p>
              <p className="col-span-1 text-xs font-medium text-gray-500">
                Price
              </p>
              <p className="col-span-2 text-xs font-medium text-gray-500">
                Status
              </p>
            </div>

            {/* Rows */}
            <div className="divide-y divide-gray-50">
              {sessions.map((session) => {
                const cfg =
                  statusConfig[session.status] ?? statusConfig.pending;
                return (
                  <div
                    key={session._id}
                    className="grid grid-cols-12 gap-3 px-5 py-4 hover:bg-gray-50 transition-colors items-center"
                  >
                    {/* Title + duration */}
                    <div className="col-span-3 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {session.title}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                        <Clock size={11} />
                        {session.durationMinutes} min
                        {session.paymentStatus === 'paid' && (
                          <>
                            <span className="text-gray-300 mx-1">·</span>
                            <span className="text-green-600">Paid</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Learner → Mentor */}
                    <div className="col-span-4 min-w-0">
                      <p className="text-xs text-gray-700 truncate">
                        {session.learnerName}
                        {' . '}
                        {session.learnerEmail}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        → {session.mentorName}
                        {' . '}
                        {session.mentorEmail}
                      </p>
                    </div>

                    {/* Date */}
                    <div className="col-span-2">
                      <p className="text-xs text-gray-600">
                        {new Date(session.scheduledAt).toLocaleDateString(
                          undefined,
                          {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          },
                        )}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="col-span-1">
                      {session.price !== undefined ? (
                        <div className="flex items-center gap-0.5 text-xs font-medium text-gray-700">
                          <DollarSign size={11} />
                          {session.price}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400">—</p>
                      )}
                    </div>

                    {/* Status */}
                    <div className="col-span-2">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${cfg.bg} ${cfg.color}`}
                      >
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
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

export default AdminSessionsPage;
