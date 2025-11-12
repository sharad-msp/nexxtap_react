/**
 * Utility functions for handling API error responses
 */

export interface ApiErrorResponse {
  status: number;
  message: string;
  errors?: Record<string, string[] | string>;
}

export interface FormattedErrors {
  [key: string]: string;
}

/**
 * Parse API error response and format errors for form display
 * @param errorResponse - The API error response
 * @returns Formatted errors object for form fields
 */
export const parseApiErrors = (errorResponse: ApiErrorResponse): FormattedErrors => {
  const formattedErrors: FormattedErrors = {};
  
  if (errorResponse.errors && typeof errorResponse.errors === 'object') {
    Object.keys(errorResponse.errors).forEach(key => {
      const errorArray = errorResponse.errors![key];
      if (Array.isArray(errorArray) && errorArray.length > 0) {
        formattedErrors[key] = errorArray[0];
      } else if (typeof errorArray === 'string') {
        formattedErrors[key] = errorArray;
      }
    });
  }
  
  return formattedErrors;
};

/**
 * Check if the API response indicates success
 * @param response - The API response
 * @returns true if successful, false otherwise
 */
export const isApiSuccess = (response: any): boolean => {
  return response && response.status === 1;
};

/**
 * Check if the API response contains validation errors
 * @param response - The API response
 * @returns true if contains validation errors, false otherwise
 */
export const hasValidationErrors = (response: any): boolean => {
  return response && response.status === 0 && response.errors;
};

/**
 * Handle API error response for forms
 * @param error - The error object from API call
 * @param setErrors - Function to set form errors
 * @param showToast - Function to show toast notifications
 * @param defaultMessage - Default error message
 * @returns true if errors were handled, false otherwise
 */
export const handleApiError = (
  error: any,
  setErrors: (errors: Record<string, string>) => void,
  showToast: (type: 'error' | 'success', message: string) => void,
  defaultMessage: string = 'An error occurred'
): boolean => {
  console.error('API Error:', error);
  
  // Handle API error response format
  if (error.response?.data) {
    const errorData = error.response.data;
    
    // Check if it's a validation error response
    if (hasValidationErrors(errorData)) {
      const formattedErrors = parseApiErrors(errorData);
      
      if (Object.keys(formattedErrors).length > 0) {
        setErrors(formattedErrors);
        
        // Create detailed error message showing which fields have errors
        const errorFields = Object.keys(formattedErrors);
        const errorMessages = errorFields.map(field => {
          const fieldName = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          return `${fieldName}: ${formattedErrors[field]}`;
        });
        
        const detailedMessage = `Validation errors:\n${errorMessages.join('\n')}`;
        showToast('error', detailedMessage);
        return true;
      }
    }
    
    // Show general error message
    showToast('error', errorData.message || defaultMessage);
    return true;
  } else {
    showToast('error', error.message || defaultMessage);
    return true;
  }
};

/**
 * Handle API success response for forms
 * @param response - The API response
 * @param setErrors - Function to set form errors
 * @param showToast - Function to show toast notifications
 * @param successMessage - Success message to display
 * @param onSuccess - Callback function to execute on success
 * @returns true if success was handled, false otherwise
 */
export const handleApiSuccess = (
  response: any,
  setErrors: (errors: Record<string, string>) => void,
  showToast: (type: 'error' | 'success', message: string) => void,
  successMessage: string,
  onSuccess: () => void
): boolean => {
  if (isApiSuccess(response)) {
    showToast('success', successMessage);
    onSuccess();
    return true;
  }
  
  // Handle API response with errors
  if (response && response.errors) {
    const formattedErrors = parseApiErrors(response);
    
    if (Object.keys(formattedErrors).length > 0) {
      setErrors(formattedErrors);
      
      // Create detailed error message showing which fields have errors
      const errorFields = Object.keys(formattedErrors);
      const errorMessages = errorFields.map(field => {
        const fieldName = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        return `${fieldName}: ${formattedErrors[field]}`;
      });
      
      const detailedMessage = `Validation errors:\n${errorMessages.join('\n')}`;
      showToast('error', detailedMessage);
      return false;
    }
  }
  
  showToast('error', response?.message || 'Operation failed');
  return false;
};
