import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css'; // Import the default styles

export function StoreDashboardSkeleton() {
  return (
    <>
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Skeleton circle={true} height={24} width={24} />
                <Skeleton height={12} width={80} />
              </div>
              <Skeleton height={32} width={160} className="mb-2" />
              <Skeleton height={12} width={256} />
            </div>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <Skeleton key={i} height={40} width={56} />
              ))}
              <Skeleton height={40} width={112} className="ml-2" />
            </div>
          </div>
        </div>

        {/* Top Stats Row Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>

        {/* Second Stats Row Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>

        {/* Charts Row Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <SkeletonChart />
          <SkeletonChart />
        </div>

        {/* Bottom Section Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <Skeleton height={20} width={144} className="mb-4" />
            <Skeleton height={192} />
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <Skeleton height={20} width={144} className="mb-4" />
            <Skeleton height={192} />
          </div>
        </div>

        {/* Recent Orders Skeleton */}
        <div className="mt-6 bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Skeleton height={20} width={128} className="mb-2" />
              <Skeleton height={12} width={192} />
            </div>
            <Skeleton height={16} width={64} />
          </div>
          <Skeleton height={128} />
        </div>
      </div>
    </>
  );
}

// Placeholder components (replace with actual implementations if needed)
export function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <Skeleton height={12} width={64} className="mb-3 opacity-70" />
      <Skeleton height={32} width={96} className="mb-2" />
      <Skeleton height={8} width={160} className="opacity-70" />
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <Skeleton height={20} width={144} className="mb-4" />
      <Skeleton height={192} />
    </div>
  );
}