import { useEffect, useRef, useCallback } from 'react';
import { useOrderStore } from '@/store/orderStore';

export const useOrders = () => {
  const {
    orders,
    statistics,
    loading: ordersLoading,
    statisticsLoading,
    pagination,
    filters,
    fetchOrders,
    fetchStatistics,
    fetchOrder,
    updateOrderStatus,
    clearFilters,
    setFilters,
  } = useOrderStore();

  const initializedRef = useRef(false);

  // Initialize data on first load
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      fetchOrders();
      fetchStatistics();
    }
  }, []);

  // Change page
  const changePage = (page: number) => {
    fetchOrders(filters, page);
  };

  // Change per page
  const changePerPage = (newPerPage: number) => {
    // Update pagination in store and refetch
    useOrderStore.setState(state => ({
      pagination: { ...state.pagination, per_page: newPerPage }
    }));
    fetchOrders(filters, 1);
  };

  // Update filters
  const updateFilters = useCallback((newFilters: any) => {
    setFilters(newFilters);
  }, [setFilters]);

  return {
    // Data
    orders,
    totalOrders: pagination.total,
    currentPage: pagination.current_page,
    lastPage: pagination.last_page,
    perPage: pagination.per_page,
    filters,
    statistics,
    
    // Loading states
    ordersLoading,
    statisticsLoading,
    
    // Actions
    loadOrders: fetchOrders,
    loadOrder: fetchOrder,
    updateStatus: updateOrderStatus,
    loadStatistics: fetchStatistics,
    updateFilters,
    changePage,
    changePerPage,
    clearFilters,
  };
};
