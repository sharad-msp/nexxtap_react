import { create } from 'zustand';
import { storeApi } from '@/api/storeApi';
import type { Store, CreateStoreRequest, UpdateStoreRequest, PaginationMeta } from '@/types/store.types';

interface StoreStore {
  stores: Store[];
  pagination: PaginationMeta;
  isLoading: boolean;
  isInitialized: boolean;
  fetchStores: (page?: number, search?: string, status?: string) => Promise<void>;
  getStoreDetails: (id: number) => Promise<Store | null>;
  addOrUpdateStore: (payload: CreateStoreRequest | UpdateStoreRequest) => Promise<void>;
  deleteStore: (id: number) => Promise<void>;
  toggleStoreStatus: (id: number, status: boolean) => Promise<void>;
  reset: () => void;
}

export const useStoreStore = create<StoreStore>((set, get) => ({
  stores: [],
  pagination: {
    current_page: 1,
    from: 1,
    last_page: 1,
    links: [],
    path: '',
    per_page: 10,
    to: 10,
    total: 0,
  },
  isLoading: false,
  isInitialized: false,

  fetchStores: async (page = 1, search = '', status = 'all') => {
    const { isLoading } = get();
    if (isLoading) return; // Prevent multiple simultaneous requests
    
    set({ isLoading: true });
    try {
      const params: any = {
        page,
        per_page: 10,
        search
      };
      
      if (status !== 'all') {
        params.status = status === '1' ? 1 : 0;
      }

      const response = await storeApi.getAll(params);
      
      if (response.status === 1) {
        const stores = response.data || [];
        set({
          stores,
          pagination: response.meta || {
            current_page: page,
            from: 1,
            last_page: 1,
            links: [],
            path: '',
            per_page: 10,
            to: 10,
            total: stores.length,
          },
          isLoading: false,
          isInitialized: true,
        });
      } else {
        throw new Error(response.message || 'Failed to fetch stores');
      }
    } catch (error) {
      console.error('Failed to fetch stores', error);
      set({ isLoading: false, isInitialized: true });
      throw error;
    }
  },

  getStoreDetails: async (id: number) => {
    try {
      const response = await storeApi.getById(id);
      if (response.status === 1) {
        return response.data;
      }
    } catch (error) {
      console.error('Failed to fetch store details', error);
    }
    return null;
  },

  addOrUpdateStore: async (payload: CreateStoreRequest | UpdateStoreRequest) => {
    try {
      const response = await storeApi.addOrUpdateStore(payload);
      if (response.status === 1) {
        // Refresh the store list
        await get().fetchStores(1);
      } else {
        throw new Error(response.message || 'Failed to save store');
      }
    } catch (error) {
      console.error('Failed to save store', error);
      throw error;
    }
  },

  deleteStore: async (id: number) => {
    try {
      const response = await storeApi.deleteStore(id);
      if (response.status === 1) {
        // Refresh the store list
        await get().fetchStores(1);
      } else {
        throw new Error(response.message || 'Failed to delete store');
      }
    } catch (error) {
      console.error('Failed to delete store', error);
      throw error;
    }
  },

  toggleStoreStatus: async (id: number, status: boolean) => {
    try {
      const response = await storeApi.toggleStoreStatus(id, status);
      if (response.status === 1) {
        // Refresh the store list
        await get().fetchStores(1);
      } else {
        throw new Error(response.message || 'Failed to toggle store status');
      }
    } catch (error) {
      console.error('Failed to toggle store status', error);
      throw error;
    }
  },

  reset: () => {
    set({
      stores: [],
      pagination: {
        current_page: 1,
        from: 1,
        last_page: 1,
        links: [],
        path: '',
        per_page: 10,
        to: 10,
        total: 0,
      },
      isLoading: false,
      isInitialized: false,
    });
  },
}));
