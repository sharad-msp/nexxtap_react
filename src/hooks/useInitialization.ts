import { useRef, useCallback } from 'react';

/**
 * Hook to prevent duplicate API calls during component initialization
 * This helps solve the issue where useEffect runs multiple times causing duplicate API requests
 */
export const useInitialization = () => {
  const initializedRef = useRef(false);
  const initializingRef = useRef(false);

  const initialize = useCallback(async (initFunction: () => Promise<void> | void) => {
    // Prevent multiple simultaneous initializations
    if (initializedRef.current || initializingRef.current) {
      return;
    }

    initializingRef.current = true;
    
    try {
      await initFunction();
      initializedRef.current = true;
    } catch (error) {
      console.error('Initialization error:', error);
      // Don't mark as initialized if there was an error
    } finally {
      initializingRef.current = false;
    }
  }, []);

  const reset = useCallback(() => {
    initializedRef.current = false;
    initializingRef.current = false;
  }, []);

  return {
    isInitialized: initializedRef.current,
    isInitializing: initializingRef.current,
    initialize,
    reset,
  };
};

/**
 * Hook for managing single API call state to prevent duplicates
 */
export const useSingleCall = () => {
  const callingRef = useRef(false);

  const executeCall = useCallback(async <T>(
    apiCall: () => Promise<T>
  ): Promise<T | null> => {
    if (callingRef.current) {
      return null;
    }

    callingRef.current = true;
    
    try {
      const result = await apiCall();
      return result;
    } finally {
      callingRef.current = false;
    }
  }, []);

  return {
    isCalling: callingRef.current,
    executeCall,
  };
};
