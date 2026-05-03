// Reusable skeleton pulse block
const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
);

// ─── Stat card skeleton ───────────────────────────────────────────────────────

const StatCardSkeleton = () => (
  <div className="bg-white border border-gray-200 rounded-2xl p-5">
    <Skeleton className="w-9 h-9 rounded-xl mb-3" />
    <Skeleton className="h-8 w-16 mb-2" />
    <Skeleton className="h-3 w-24" />
  </div>
);

// ─── Session card skeleton ────────────────────────────────────────────────────

const SessionCardSkeleton = () => (
  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-3 w-1/2" />
    <div className="flex items-center gap-2">
      <Skeleton className="w-5 h-5 rounded-full" />
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-5 w-16 ml-auto rounded-full" />
    </div>
  </div>
);

// ─── Mentor card skeleton ─────────────────────────────────────────────────────

const MentorCardSkeleton = () => (
  <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-100">
    <Skeleton className="w-10 h-10 rounded-full shrink-0" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-3 w-20" />
    </div>
    <Skeleton className="h-7 w-14 rounded-lg" />
  </div>
);

// ─── Roadmap step skeleton ────────────────────────────────────────────────────

const RoadmapStepSkeleton = () => (
  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
    <Skeleton className="w-5 h-5 rounded-full shrink-0" />
    <Skeleton className="h-4 flex-1" />
  </div>
);

// ─── Recent session row skeleton (mentor dashboard) ───────────────────────────

const RecentSessionRowSkeleton = () => (
  <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
    <Skeleton className="w-9 h-9 rounded-full shrink-0" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-3 w-32" />
    </div>
    <Skeleton className="h-4 w-12" />
    <Skeleton className="h-6 w-20 rounded-full" />
  </div>
);

// ─── Learner Dashboard Skeleton ───────────────────────────────────────────────

export const LearnerDashboardSkeleton = () => (
  <div className="max-w-7xl mx-auto space-y-6">
    {/* Header */}
    <div className="space-y-2">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-80" />
    </div>

    {/* Stats */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Roadmap */}
      <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-4 w-16" />
        </div>
        {/* Progress bar */}
        <div className="mb-5">
          <div className="flex justify-between mb-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-10" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
          <Skeleton className="h-3 w-40 mt-1" />
        </div>
        {/* Steps */}
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <RoadmapStepSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Sessions */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SessionCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>

    {/* Mentors */}
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <MentorCardSkeleton key={i} />
        ))}
      </div>
    </div>
  </div>
);

// ─── Mentor Dashboard Skeleton ────────────────────────────────────────────────

export const MentorDashboardSkeleton = () => (
  <div className="max-w-7xl mx-auto space-y-6">
    {/* Header */}
    <div className="space-y-2">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-72" />
    </div>

    {/* Primary stats */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>

    {/* Secondary stats */}
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>

    {/* Recent sessions */}
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <RecentSessionRowSkeleton key={i} />
        ))}
      </div>
    </div>

    {/* Quick links */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-2xl"
        >
          <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-36" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─── Admin Dashboard Skeleton ─────────────────────────────────────────────────

export const AdminDashboardSkeleton = () => (
  <div className="max-w-7xl mx-auto space-y-6">
    {/* Header */}
    <div className="space-y-2">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-72" />
    </div>

    {/* Stats */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>

    {/* Recent sessions */}
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <RecentSessionRowSkeleton key={i} />
        ))}
      </div>
    </div>

    {/* Quick links */}
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-2xl"
        >
          <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      ))}
    </div>
  </div>
);
