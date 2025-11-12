import { useRef, useCallback } from 'react';

interface UseApiCallOptions {
  debounceMs?: number;
  preventMultiple?: boolean;
}

export const useApiCall = (options: UseApiCallOptions = {}) => {
  const { debounceMs = 300, preventMultiple = true } = options;
  const isCallingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const callApi = useCallback(async <T>(
    apiFunction: (...args: any[]) => Promise<T>,
    ...args: any[]
  ): Promise<T | null> => {
    // Prevent multiple simultaneous calls
    if (preventMultiple && isCallingRef.current) {
      return null;
    }

    // Cancel previous timeout if exists
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    return new Promise((resolve, reject) => {
      timeoutRef.current = setTimeout(async () => {
        try {
          isCallingRef.current = true;
          
          // Create new abort controller for this request
          abortControllerRef.current = new AbortController();
          
          const result = await apiFunction(...args);
          resolve(result);
        } catch (error) {
          if (error.name === 'AbortError') {
            resolve(null);
          } else {
            reject(error);
          }
        } finally {
          isCallingRef.current = false;
          abortControllerRef.current = null;
        }
      }, debounceMs);
    });
  }, [debounceMs, preventMultiple]);

  const cancelCall = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    isCallingRef.current = false;
  }, []);

  return {
    callApi,
    cancelCall,
    isCalling: isCallingRef.current,
  };
};
