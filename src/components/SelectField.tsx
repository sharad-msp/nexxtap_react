import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/utils';

interface Option {
  value: string | number;
  label: string;
}

interface SelectFieldProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  error?: string;
  helperText?: string;
  options: Option[];
  placeholder?: string;
  onChange?: (value: string) => void;
  variant?: 'default' | 'filled' | 'outlined';
}

export function SelectField({
  label,
  error,
  options,
  placeholder = 'Select an option',
  onChange,
  helperText,
  className,
  id,
  variant = 'default',
  disabled = false,
  ...props
}: SelectFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleOptionSelect = (optionValue: string | number) => {
    if (onChange) {
      onChange(optionValue.toString());
    }
    setIsOpen(false);
  };

  const selectedOption = options.find(option => option.value.toString() === props.value?.toString());
  const displayText = selectedOption ? selectedOption.label : (props.value ? `Option ${props.value}` : placeholder);

  const variantClasses = {
    default: 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500',
    filled: 'border-gray-300 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500',
    outlined: 'border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
  };

  const errorClasses = 'border-red-300 focus:border-red-500 focus:ring-red-500';

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-semibold text-gray-700">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className={cn(
            'w-full text-left border rounded-lg h-10 px-4',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white cursor-pointer',
            isOpen ? 'ring-2 ring-indigo-500 border-indigo-500' : '',
            variantClasses[variant],
            error && errorClasses,
            className
          )}
        >
          <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
            {displayText}
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg
              className={cn(
                'h-5 w-5 text-gray-400 transition-transform',
                isOpen ? 'rotate-180' : ''
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
            <div className="max-h-60 overflow-y-auto">
              {options.length > 0 ? (
                options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleOptionSelect(option.value)}
                    className={cn(
                      'w-full px-3 py-2 text-left text-sm hover:bg-indigo-50 focus:bg-indigo-50 focus:outline-none',
                      props.value === option.value ? 'bg-indigo-100 text-indigo-900' : 'text-gray-900'
                    )}
                  >
                    {option.label}
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-center text-sm text-gray-500">
                  No options available
                </div>
              )}
            </div>
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
