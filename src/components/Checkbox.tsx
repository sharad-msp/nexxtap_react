import React from 'react';
import { cn } from '@/utils';

interface CheckboxProps {
  id?: string;
  name?: string;
  label?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  id,
  name,
  label,
  checked = false,
  onChange,
  disabled = false,
  className,
  helperText,
  error,
  required = false,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.checked);
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center space-x-3">
        <input
          id={id || name}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          required={required}
          className={cn(
            'h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 focus:ring-2',
            error && 'border-red-300 focus:ring-red-500',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        />
        {label && (
          <label
            htmlFor={id || name}
            className={cn(
              'text-sm font-medium',
              error ? 'text-red-700' : 'text-gray-700',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
      </div>
      
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Checkbox;
