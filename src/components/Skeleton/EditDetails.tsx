import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export function EditPageSkeleton() {
  return (
    <>
      <div className="space-y-6">
        {/* Header Card */}
        <div className="flex justify-between items-center mb-8 p-4 bg-gray-50 rounded-lg border border-gray-100 animate-fade">
          <div className="flex items-center gap-2">
            <Skeleton circle={true} height={24} width={24} /> {/* Back Icon */}
            <Skeleton height={24} width={160} /> {/* Product Name */}
          </div>
          <Skeleton height={32} width={80} className="bg-blue-100" /> {/* Save Button */}
        </div>

        {/* Basic Information Card */}
        <div className="p-6 bg-gray-50 rounded-lg mb-8 border border-gray-100 animate-fade">
          <Skeleton height={20} width="40%" className="mb-4" /> {/* Basic Information Title */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Skeleton height={16} width="30%" className="mb-2 text-gray-500" /> {/* Product Name Label */}
              <Skeleton height={32} className="mb-4" /> {/* Product Name Input */}
              <Skeleton height={16} width="40%" className="mb-2 text-gray-500" /> {/* Base Price Label */}
              <Skeleton height={32} className="mb-4" /> {/* Base Price Input */}
              <Skeleton height={16} width="30%" className="mb-2 text-gray-500" /> {/* Description Label */}
              <Skeleton height={32} /> {/* Description Input */}
            </div>
            <div>
              <Skeleton height={16} width="40%" className="mb-2 text-gray-500" /> {/* Category Label */}
              <Skeleton height={32} className="mb-4" /> {/* Category Input */}
              <Skeleton height={16} width="30%" className="mb-2 text-gray-500" /> {/* Status Label */}
              <Skeleton height={32} /> {/* Status Input */}
            </div>
          </div>
        </div>

        {/* Tax & Pricing Card */}
        <div className="p-6 bg-gray-50 rounded-lg mb-8 border border-gray-100 animate-fade">
          <Skeleton height={20} width="40%" className="mb-4" /> {/* Tax & Pricing Title */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Skeleton height={16} width="30%" className="mb-2 text-gray-500" /> {/* Base Price Label */}
              <Skeleton height={32} className="mb-4" /> {/* Base Price Input */}
              <Skeleton height={16} width="40%" className="mb-2 text-gray-500" /> {/* VAT Label */}
              <div className="flex items-center gap-4">
                <Skeleton height={32} width="70%" /> {/* VAT Input */}
                <Skeleton height={16} width="20%" className="text-gray-400" /> {/* Excluded */}
              </div>
              <Skeleton height={16} width="40%" className="mt-4 mb-2 text-gray-500" /> {/* Sales Tax Label */}
              <div className="flex items-center gap-4">
                <Skeleton height={32} width="70%" /> {/* Sales Tax Input */}
                <Skeleton height={16} width="20%" className="text-gray-400" /> {/* Excluded */}
              </div>
            </div>
            <div>
              {/* Empty space to match layout */}
              <div className="h-24 bg-transparent"></div>
            </div>
          </div>
        </div>

        {/* Product Statistics Card */}
        <div className="p-6 bg-gray-50 rounded-lg mb-8 border border-gray-100 animate-fade w-1/3 float-right">
          <Skeleton height={20} width="60%" className="mb-4" /> {/* Product Statistics Title */}
          <div className="space-y-4">
            <div>
              <Skeleton height={16} width="40%" className="mb-2 text-gray-500" /> {/* Total Options Label */}
              <Skeleton height={28} /> {/* Total Options Value */}
            </div>
            <div>
              <Skeleton height={16} width="40%" className="mb-2 text-gray-500" /> {/* Created Label */}
              <Skeleton height={28} /> {/* Created Value */}
            </div>
            <div>
              <Skeleton height={16} width="40%" className="mb-2 text-gray-500" /> {/* Last Updated Label */}
              <Skeleton height={28} /> {/* Last Updated Value */}
            </div>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="p-6 bg-gray-50 rounded-lg clear-right border border-gray-100 animate-fade">
          <Skeleton height={20} width="40%" className="mb-4" /> {/* Quick Actions Title */}
          <div className="space-y-4">
            <Skeleton height={40} width="30%" className="bg-blue-100 rounded-lg" /> {/* Save Button */}
            <Skeleton height={40} width="25%" className="bg-gray-200 rounded-lg" /> {/* Cancel Button */}
          </div>
        </div>
      </div>
    </>
  );
}