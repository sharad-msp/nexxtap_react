import React from 'react';
import { cn } from '@/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info' | 'primary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  dot?: boolean;
}

export function Badge({ 
  children, 
  variant = 'default', 
  size = 'md',
  className,
  dot = false
}: BadgeProps) {
  const baseClasses = 'inline-flex items-center rounded-full font-medium transition-colors';
  
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    secondary: 'bg-gray-200 text-gray-900',
    destructive: 'bg-red-100 text-red-800',
    outline: 'border border-gray-300 text-gray-700 bg-white',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-indigo-100 text-indigo-800',
    primary: 'bg-indigo-100 text-indigo-800'
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-sm'
  };

  const dotColors = {
    default: 'bg-gray-400',
    secondary: 'bg-gray-500',
    destructive: 'bg-red-400',
    outline: 'bg-gray-400',
    success: 'bg-green-400',
    warning: 'bg-yellow-400',
    info: 'bg-indigo-400',
    primary: 'bg-indigo-400'
  };

  return (
    <span
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {dot && (
        <span className={cn(
          'w-1.5 h-1.5 rounded-full mr-1.5',
          dotColors[variant]
        )} />
      )}
      {children}
    </span>
  );
}
