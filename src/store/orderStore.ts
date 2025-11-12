import { create } from 'zustand';
import { orderApi } from '@/api/orderApi';
import { Order, OrderStatistics } from '@/types/order.types';

interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface OrderFilters {
  search?: string;
  status?: string;
  filterByStatus?: string;
  date_from?: string;
  date_to?: string;
}

interface OrderStore {
  orders: Order[];
  statistics: OrderStatistics | null;
  loading: boolean;
  statisticsLoading: boolean;
  pagination: Pagination;
  filters: OrderFilters;
  _fetchTimeout: any;
  
  // Actions
  fetchOrders: (filters?: OrderFilters, page?: number) => Promise<void>;
  fetchStatistics: (dateFrom?: string, dateTo?: string) => Promise<void>;
  fetchOrder: (id: number) => Promise<Order | null>;
  updateOrderStatus: (id: number, status: number) => Promise<boolean>;
  clearFilters: () => void;
  setFilters: (filters: OrderFilters) => void;
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: [],
  statistics: null,
  loading: false,
  statisticsLoading: false,
  pagination: {
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  },
  filters: {},
  _fetchTimeout: null as any,

  fetchOrders: async (filters = {}, page = 1) => {
    set({ loading: true });
    try {
      const currentFilters = get().filters;
      const mergedFilters = { ...currentFilters, ...filters };
      
      const params = {
        ...mergedFilters,
        current_page: page,
        per_page: get().pagination.per_page,
      };

      const response = await orderApi.getOrders(params);
      
      if (response?.status === 1 && response?.data) {
        set({
          orders: response.data,
          pagination: {
            current_page: response.meta.current_page || 1,
            last_page: response.meta.last_page || 1,
            per_page: response.meta.per_page || 10,
            total: response.meta.total || 0,
          },
          filters: mergedFilters,
          loading: false,
        });
      } else {
        set({ loading: false });
      }
    } catch (error: any) {
      console.error('Orders fetch error:', error?.response?.data || error);
      set({ loading: false });
      throw error;
    }
  },

  fetchStatistics: async (dateFrom, dateTo) => {
    set({ statisticsLoading: true });
    try {
      const params: any = {};
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;

      const response = await orderApi.getOrderStatistics(params);
      
      if (response?.status === 1 && response?.data) {
        set({
          statistics: response.data,
          statisticsLoading: false,
        });
      } else {
        set({ statisticsLoading: false });
      }
    } catch (error: any) {
      console.error('Statistics fetch error:', error?.response?.data || error);
      set({ statisticsLoading: false });
      throw error;
    }
  },

  fetchOrder: async (id: number) => {
    try {
      const response = await orderApi.getOrder(id);
      return response?.status === 1 ? response?.data || null : null;
    } catch (error: any) {
      console.error('Order fetch error:', error?.response?.data || error);
      throw error;
    }
  },

  updateOrderStatus: async (id: number, status: number) => {
    try {
      const response = await orderApi.updateOrderStatus({ id, status });
      
      if (response?.status === 1) {
        // Refresh the orders list to reflect the status change
        await get().fetchOrders();
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Order status update error:', error?.response?.data || error);
      throw error;
    }
  },

  clearFilters: () => {
    set({ filters: {} });
    get().fetchOrders({}, 1);
  },

  setFilters: (filters: OrderFilters) => {
    const currentFilters = get().filters;
    
    // Check if filters have actually changed
    const currentFiltersStr = JSON.stringify(currentFilters);
    const newFiltersStr = JSON.stringify(filters);
    
    if (currentFiltersStr === newFiltersStr) {
      return; // No change, don't update
    }
    
    set({ filters });
    
    // Clear existing timeout
    if (get()._fetchTimeout) {
      clearTimeout(get()._fetchTimeout);
    }
    
    // Debounce the API call
    const timeout = setTimeout(() => {
      get().fetchOrders(filters, 1);
    }, 300);
    
    set({ _fetchTimeout: timeout });
  },
}));
