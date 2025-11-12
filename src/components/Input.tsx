import React from 'react';
import { cn } from '@/utils';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
  helperText?: string;
  onChange?: (value: string) => void;
  variant?: 'default' | 'filled' | 'outlined';
}

export function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconClick,
  helperText,
  className,
  id,
  onChange,
  variant = 'default',
  ...props
}: InputProps) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  const baseInputClasses = 'block w-full rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed text-sm leading-6';
  
  const variantClasses = {
    default: 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500/20',
    filled: 'border-gray-300 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500/20',
    outlined: 'border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500/20'
  };

  const errorClasses = 'border-red-300 focus:border-red-500 focus:ring-red-500/20';

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-semibold text-gray-700">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {/* {leftIcon && (
          <div className="absolute inset-y-0 left-0 flex items-center justify-center w-12 text-gray-400 z-10">
            <div className="w-5 h-5 flex items-center justify-center">
              {leftIcon}
            </div>
          </div>
        )} */}
        <input
          id={inputId}
          className={cn(
            baseInputClasses,
            variantClasses[variant],
            leftIcon && 'pl-12',
            rightIcon && 'pr-12',
            error && errorClasses,
            'h-10 px-4',
            className
          )}
          onChange={(e) => onChange?.(e.target.value)}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 flex items-center justify-center w-12 text-gray-400 z-10">
            {onRightIconClick ? (
              <button
                type="button"
                onClick={onRightIconClick}
                className="flex items-center justify-center w-5 h-5 hover:text-gray-600 transition-colors"
              >
                {rightIcon}
              </button>
            ) : (
              <div className="flex items-center justify-center w-5 h-5">
                {rightIcon}
              </div>
            )}
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </p>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
}
