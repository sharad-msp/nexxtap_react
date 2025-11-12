import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils';

interface FullPageLoaderProps {
  isLoading: boolean;
  text?: string;
  className?: string;
  variant?: 'default' | 'minimal' | 'dark' | 'overlay';
  size?: 'sm' | 'md' | 'lg';
}

export function FullPageLoader({ 
  isLoading, 
  text = 'Loading...', 
  className,
  variant = 'default',
  size = 'md'
}: FullPageLoaderProps) {
  if (!isLoading) return null;

  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  if (variant === 'minimal') {
    return (
      <div className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm',
        className
      )}>
        <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-lg border">
          <Loader2 className={cn('animate-spin text-indigo-600', sizeClasses[size])} />
          <span className={cn('font-medium text-gray-700', textSizes[size])}>{text}</span>
        </div>
      </div>
    );
  }

  if (variant === 'dark') {
    return (
      <div className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm',
        className
      )}>
        <div className="flex flex-col items-center space-y-4 p-8 bg-gray-800 rounded-xl shadow-xl border border-gray-700">
          <div className="relative">
            <Loader2 className={cn('animate-spin text-indigo-400', sizeClasses[size])} />
            <div className="absolute inset-0 rounded-full border-4 border-indigo-800 animate-pulse"></div>
          </div>
          <div className="text-center">
            <p className={cn('font-medium text-white', textSizes[size])}>{text}</p>
            <p className="text-sm text-gray-400 mt-1">Please wait while we process your request...</p>
          </div>
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'overlay') {
    return (
      <div className={cn(
        'absolute inset-0 z-10 flex items-center justify-center bg-white/90 backdrop-blur-sm',
        className
      )}>
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className={cn('animate-spin text-indigo-600', sizeClasses[size])} />
          <p className={cn('font-medium text-gray-700', textSizes[size])}>{text}</p>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn(
      'fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm',
      className
    )}>
      <div className="flex flex-col items-center space-y-4 p-8 bg-white rounded-xl shadow-xl border">
        <div className="relative">
          <Loader2 className={cn('animate-spin text-indigo-600', sizeClasses[size])} />
          <div className="absolute inset-0 rounded-full border-4 border-indigo-200 animate-pulse"></div>
        </div>
        <div className="text-center">
          <p className={cn('font-medium text-gray-900', textSizes[size])}>{text}</p>
          <p className="text-sm text-gray-500 mt-1">Please wait while we process your request...</p>
        </div>
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}

// Legacy exports for backward compatibility
export function FullPageLoaderMinimal(props: FullPageLoaderProps) {
  return <FullPageLoader {...props} variant="minimal" />;
}

export function FullPageLoaderDark(props: FullPageLoaderProps) {
  return <FullPageLoader {...props} variant="dark" />;
}
