import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/utils';

interface Option {
  value: string | number;
  label: string;
}

interface StandardDropdownProps {
  value: string | number;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function StandardDropdown({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  disabled = false,
  className,
  size = 'md'
}: StandardDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const sizeClasses = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-4 text-base'
  };

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
    onChange(optionValue.toString());
    setIsOpen(false);
  };

  const selectedOption = options.find(option => option.value.toString() === value.toString());
  const displayText = selectedOption ? selectedOption.label : placeholder;

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      <div className="relative">
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className={cn(
            'w-full text-left border border-gray-300 rounded-lg',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
            disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white cursor-pointer',
            isOpen ? 'ring-2 ring-indigo-500 border-indigo-500' : '',
            sizeClasses[size]
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
                      value === option.value ? 'bg-indigo-100 text-indigo-900' : 'text-gray-900'
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

      {/* Hidden input for form submission */}
      <input
        type="hidden"
        value={value}
      />
    </div>
  );
}
