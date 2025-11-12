import React, { createContext, useContext, useState } from 'react';
import { cn } from '@/utils';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { SelectField } from '@/components/SelectField';
import { Checkbox } from '@/components/Checkbox';

interface FormContextType {
  errors: Record<string, string>;
  setErrors: (errors: Record<string, string>) => void;
  setFieldError: (field: string, error: string) => void;
  clearErrors: () => void;
  values: Record<string, any>;
  setValue: (field: string, value: any) => void;
}

const FormContext = createContext<FormContextType | null>(null);

export const useForm = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useForm must be used within a Form component');
  }
  return context;
};

interface FormProps {
  children: React.ReactNode;
  onSubmit: (values: Record<string, any>, setErrors: (errors: Record<string, string>) => void) => void;
  initialValues?: Record<string, any>;
  loading?: boolean;
  className?: string;
  submitText?: string;
  cancelText?: string;
  onCancel?: () => void;
  showCancel?: boolean;
}

export function Form({
  children,
  onSubmit,
  initialValues = {},
  loading = false,
  className,
  submitText = 'Submit',
  cancelText = 'Cancel',
  onCancel,
  showCancel = false,
}: FormProps) {
  const [values, setValues] = useState<Record<string, any>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setValue = (field: string, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const setFieldError = (field: string, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const clearErrors = () => {
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});
    
    // Basic validation for required fields
    const newErrors: Record<string, string> = {};
    
    // Check all FormInput children for required validation
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && child.type === FormInput) {
        const { name, required } = child.props;
        if (required && (!values[name] || values[name].trim() === '')) {
          newErrors[name] = `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
        }
      }
    });
    
    // If there are validation errors, set them and return
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSubmit(values, setErrors);
  };

  return (
    <FormContext.Provider value={{ errors, setErrors, setFieldError, clearErrors, values, setValue }}>
      <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
        {children}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
          {showCancel && onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              {cancelText}
            </Button>
          )}
          <Button
            type="submit"
            loading={loading}
            disabled={loading}
          >
            {submitText}
          </Button>
        </div>
      </form>
    </FormContext.Provider>
  );
}

interface FormFieldProps {
  name: string;
  label?: string;
  required?: boolean;
  helperText?: string;
  className?: string;
}

export function FormField({ name, label, required, helperText, className, children }: FormFieldProps & { children: React.ReactNode }) {
  const { errors } = useForm();
  const error = errors[name];

  return (
    <div className={cn('space-y-1', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
}

interface FormInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  name: string;
  label?: string;
  required?: boolean;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
  variant?: 'default' | 'filled' | 'outlined';
}

export function FormInput({
  name,
  label,
  required,
  helperText,
  leftIcon,
  rightIcon,
  onRightIconClick,
  variant = 'default',
  className,
  ...props
}: FormInputProps) {
  const { values, setValue, errors } = useForm();
  const value = values[name] || '';
  const error = errors[name];

  return (
    <FormField name={name} label={label} required={required} helperText={helperText} className={className}>
      <Input
        value={value}
        onChange={(val) => setValue(name, val)}
        error={error}
        leftIcon={leftIcon}
        rightIcon={rightIcon}
        onRightIconClick={onRightIconClick}
        variant={variant}
        {...props}
      />
    </FormField>
  );
}

interface FormSelectProps {
  name: string;
  label?: string;
  required?: boolean;
  helperText?: string;
  options: Array<{ value: string | number; label: string }>;
  placeholder?: string;
  variant?: 'default' | 'filled' | 'outlined';
  className?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
}

export function FormSelect({
  name,
  label,
  required,
  helperText,
  options,
  placeholder,
  variant = 'default',
  className,
  disabled,
  onChange,
}: FormSelectProps) {
  const { values, setValue, errors } = useForm();
  const value = values[name] || '';
  const error = errors[name];

  const handleChange = (val: string) => {
    setValue(name, val);
    // Call custom onChange if provided
    if (onChange) {
      onChange(val);
    }
  };

  return (
    <FormField name={name} label={label} required={required} helperText={helperText} className={className}>
      <SelectField
        value={value}
        onChange={handleChange}
        options={options}
        placeholder={placeholder}
        error={error}
        variant={variant}
        disabled={disabled}
      />
    </FormField>
  );
}

interface FormTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  name: string;
  label?: string;
  required?: boolean;
  helperText?: string;
  rows?: number;
}

export function FormTextarea({
  name,
  label,
  required,
  helperText,
  rows = 4,
  className,
  ...props
}: FormTextareaProps) {
  const { values, setValue, errors } = useForm();
  const value = values[name] || '';
  const error = errors[name];

  const baseTextareaClasses = 'block w-full rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed text-sm leading-6';
  
  const defaultClasses = 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500/20';
  const errorClasses = 'border-red-300 focus:border-red-500 focus:ring-red-500/20';

  return (
    <FormField name={name} label={label} required={required} helperText={helperText} className={className}>
      <textarea
        value={value}
        onChange={(e) => setValue(name, e.target.value)}
        rows={rows}
        className={cn(
          baseTextareaClasses,
          error ? errorClasses : defaultClasses,
          'px-4 py-3 resize-vertical',
          className
        )}
        {...props}
      />
    </FormField>
  );
}

interface FormFileUploadProps {
  name: string;
  label?: string;
  required?: boolean;
  helperText?: string;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
  preview?: boolean;
  onFileChange?: (file: File | null) => void;
}

export function FormFileUpload({
  name,
  label,
  required,
  helperText,
  accept = 'image/*',
  maxSize = 5, // 5MB default
  className,
  preview = true,
  onFileChange,
}: FormFileUploadProps) {
  const { values, setValue, errors, setFieldError } = useForm();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const error = errors[name];
  const currentFile = values[name];

  React.useEffect(() => {
    // Set preview URL when component mounts or file changes
    if (currentFile instanceof File) {
      const url = URL.createObjectURL(currentFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (typeof currentFile === 'string' && currentFile) {
      // If it's a string (existing image URL), set it as preview
      setPreviewUrl(currentFile);
    } else {
      setPreviewUrl(null);
    }
  }, [currentFile]);

  // Check if we have an existing image (string URL) vs new file
  const hasExistingImage = typeof currentFile === 'string' && currentFile;

  const handleFileChange = (file: File | null) => {
    setValue(name, file);
    if (onFileChange) {
      onFileChange(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (validateFile(file)) {
        handleFileChange(file);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && validateFile(file)) {
      handleFileChange(file);
    }
  };

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      const errorMsg = `File size must be less than ${maxSize}MB`;
      setFieldError(name, errorMsg);
      return false;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      const errorMsg = 'Please select an image file';
      setFieldError(name, errorMsg);
      return false;
    }

    // Clear any previous errors
    if (errors[name]) {
      setFieldError(name, '');
    }

    return true;
  };

  const removeFile = () => {
    handleFileChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <FormField name={name} label={label} required={required} helperText={helperText} className={className}>
      <div className="space-y-2">
        {/* File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInput}
          className="hidden"
        />

        {/* Compact Upload/Preview Area */}
        <div className="flex items-center space-x-3">
          {/* Image Preview or Upload Icon */}
          <div className="flex-shrink-0">
            {preview && previewUrl ? (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-16 h-16 object-cover rounded-lg border border-gray-300"
                />
                <button
                  type="button"
                  onClick={removeFile}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div
                className={cn(
                  'w-16 h-16 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition-colors',
                  dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400',
                  error && 'border-red-300 bg-red-50'
                )}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={openFileDialog}
              >
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
            )}
          </div>

          {/* File Info and Actions */}
          <div className="flex-1 min-w-0">
            {currentFile ? (
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {currentFile instanceof File ? currentFile.name : 'Image uploaded'}
                </p>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={openFileDialog}
                    className="text-xs text-indigo-600 hover:text-indigo-500 font-medium"
                  >
                    {hasExistingImage ? 'Replace' : 'Change'}
                  </button>
                  <span className="text-gray-300">•</span>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="text-xs text-red-600 hover:text-red-500 font-medium"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-indigo-600 hover:text-indigo-500 cursor-pointer" onClick={openFileDialog}>
                    Click to upload
                  </span>
                  {' '}or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  {accept === 'image/*' ? 'PNG, JPG, JPEG, WEBP up to' : 'Files up to'} {maxSize}MB
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </FormField>
  );
}

// FormCheckbox component
interface FormCheckboxProps {
  name: string;
  label?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
}

export function FormCheckbox({
  name,
  label,
  helperText,
  required = false,
  className,
}: FormCheckboxProps) {
  const { values, setValue, errors } = useForm();

  const handleChange = (checked: boolean) => {
    setValue(name, checked);
  };

  return (
    <FormField name={name} label={label} required={required} className={className}>
      <Checkbox
        name={name}
        label={label}
        checked={values[name] || false}
        onChange={handleChange}
        helperText={helperText}
        error={errors[name]}
        required={required}
      />
    </FormField>
  );
}
