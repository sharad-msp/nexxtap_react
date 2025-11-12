import { useEffect, useCallback } from 'react';
import { useStoreStore } from '@/store/storeStore';

export const useStores = () => {
  const {
    stores,
    pagination,
    isLoading,
    isInitialized,
    fetchStores,
    getStoreDetails,
    addOrUpdateStore,
    deleteStore,
    toggleStoreStatus,
    reset,
  } = useStoreStore();

  // Initialize stores only once when the hook is first used
  useEffect(() => {
    if (!isInitialized) {
      fetchStores(1);
    }
  }, [isInitialized, fetchStores]);

  // Cleanup function to reset store when component unmounts
  useEffect(() => {
    return () => {
      // Only reset if we're not in a persistent state
      // reset();
    };
  }, []);

  const handleFetchStores = useCallback((page = 1, search = '', status = 'all') => {
    fetchStores(page, search, status);
  }, [fetchStores]);

  return {
    stores,
    pagination,
    isLoading,
    isInitialized,
    fetchStores: handleFetchStores,
    getStoreDetails,
    addOrUpdateStore,
    deleteStore,
    toggleStoreStatus,
    reset,
  };
};
