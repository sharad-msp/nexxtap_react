import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="flex flex-col items-center space-y-2">
        <Loader2 className={cn('animate-spin text-indigo-600', sizeClasses[size])} />
        {text && (
          <p className="text-sm text-gray-600">{text}</p>
        )}
      </div>
    </div>
  );
}

interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
}

export function LoadingSkeleton({ className, lines = 3 }: LoadingSkeletonProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse bg-gray-200 rounded h-4"
          style={{
            width: `${Math.random() * 40 + 60}%`,
          }}
        />
      ))}
    </div>
  );
}

interface LoadingCardProps {
  className?: string;
  title?: string;
  subtitle?: string;
}

export function LoadingCard({ className, title, subtitle }: LoadingCardProps) {
  return (
    <div className={cn('bg-white rounded-lg shadow p-6', className)}>
      {title && (
        <div className="animate-pulse mb-4">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
          {subtitle && (
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          )}
        </div>
      )}
      <LoadingSkeleton lines={4} />
    </div>
  );
}

interface LoadingTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function LoadingTable({ rows = 5, columns = 4, className }: LoadingTableProps) {
  return (
    <div className={cn('bg-white rounded-lg shadow overflow-hidden', className)}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-24 mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="flex space-x-2">
            <div className="h-8 bg-gray-200 rounded w-16"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {Array.from({ length: columns }).map((_, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  <div className="animate-pulse h-4 bg-gray-200 rounded w-20"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface LoadingGridProps {
  items?: number;
  className?: string;
}

export function LoadingGrid({ items = 6, className }: LoadingGridProps) {
  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6', className)}>
      {Array.from({ length: items }).map((_, index) => (
        <LoadingCard key={index} />
      ))}
    </div>
  );
}
