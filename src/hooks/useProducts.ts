import { useEffect, useState, useRef } from 'react';
import { useProductStore } from '@/store/productStore';

export const useProducts = (storeId?: number) => {
  const {
    products,
    loading,
    pagination,
    fetchProducts,
    fetchCategories,
  } = useProductStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const initializedRef = useRef(false);
  const lastStoreIdRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    // Only fetch if not already initialized or storeId changed
    if (!initializedRef.current || lastStoreIdRef.current !== storeId) {
      initializedRef.current = true;
      lastStoreIdRef.current = storeId;
      
      if (storeId) {
        fetchProducts(storeId, currentPage);
      }
      fetchCategories();
    }
  }, [storeId]); // Only depend on storeId

  // Separate effect for page changes
  useEffect(() => {
    if (initializedRef.current && storeId && currentPage > 1) {
      fetchProducts(storeId, currentPage);
    }
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    // Note: You might want to implement search functionality in the store
  };

  return {
    products,
    loading,
    pagination,
    searchQuery,
    currentPage,
    handlePageChange,
    handleSearch,
  };
};
