import { useEffect, useState } from 'react';
import { useCategoryStore } from '@/store/categoryStore';

export const useCategories = () => {
  const {
    categories,
    loading,
    pagination,
    fetchCategories,
  } = useCategoryStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchCategories(currentPage, searchQuery);
  }, [fetchCategories, currentPage, searchQuery]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  return {
    categories,
    loading,
    pagination,
    searchQuery,
    currentPage,
    handlePageChange,
    handleSearch,
  };
};
