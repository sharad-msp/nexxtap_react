import { create } from 'zustand';
import { categoryApi } from '@/api/categoryApi';
import type { Category, PaginationMeta } from '@/types/category.types';

interface CategoryStore {
  categories: Category[];
  pagination: PaginationMeta;
  isLoading: boolean;
  isInitialized: boolean;
  lastFetchTime: number;
  error: string | null;
  fetchCategories: (page?: number, search?: string, status?: string) => Promise<void>;
  getCategoryDetails: (id: number) => Promise<Category | null>;
  addCategory: (data: any) => Promise<any>;
  updateCategory: (id: number, data: any) => Promise<any>;
  deleteCategory: (id: number) => Promise<any>;
  toggleCategoryStatus: (id: number, status: number) => Promise<any>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setInitialized: (initialized: boolean) => void;
  setLastFetchTime: (time: number) => void;
  reset: () => void;
  categoryDetailsCache: Map<number, Category>;
  clearCategoryDetailsCache: () => void;
  invalidateCategoryDetailsCache: (id?: number) => void;
  clearAllCaches: () => void;
}

export const useCategoryStore = create<CategoryStore>((set, get) => ({
  categories: [],
  pagination: {
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  },
  isLoading: false,
  isInitialized: false,
  lastFetchTime: 0,
  error: null,
  categoryDetailsCache: new Map(),

  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setError: (error: string | null) => set({ error }),
  setInitialized: (initialized: boolean) => set({ isInitialized: initialized }),
  setLastFetchTime: (time: number) => set({ lastFetchTime: time }),
  reset: () => set({ 
    categories: [], 
    pagination: { current_page: 1, last_page: 1, per_page: 10, total: 0 },
    isLoading: false,
    isInitialized: false,
    lastFetchTime: 0,
    error: null,
    categoryDetailsCache: new Map()
  }),

  // Cache management methods
  clearCategoryDetailsCache: () => set({ categoryDetailsCache: new Map() }),
  invalidateCategoryDetailsCache: (id?: number) => {
    const currentState = get();
    if (id) {
      currentState.categoryDetailsCache.delete(id);
    } else {
      currentState.categoryDetailsCache.clear();
    }
    set({ categoryDetailsCache: new Map(currentState.categoryDetailsCache) });
  },

  // Clear all caches and reset state (useful for logout)
  clearAllCaches: () => {
    set({ 
      categories: [], 
      pagination: { current_page: 1, last_page: 1, per_page: 10, total: 0 },
      isLoading: false,
      isInitialized: false,
      lastFetchTime: 0,
      error: null,
      categoryDetailsCache: new Map()
    });
  },

  fetchCategories: async (page = 1, search = '', status = 'all') => {
    const currentState = get();
    if (currentState.isLoading) {
      return;
    }
    

    
    set({ isLoading: true, error: null });
    try {
      const params: any = {
        page,
        per_page: 10,
        search
      };
      
      if (status !== 'all') {
        params.status = status;
      }

      const response = await categoryApi.getAll(params);
      

      
      if (response.status === 1) {
        // The response structure from Laravel Resource Collection is:
        // { data: [...], links: {...}, meta: {...}, status: 1, message: "...", message_code: 1 }
        const categoriesData = response.data || [];
        const paginationData = response.meta || {
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: 0,
        };
        

        set({
          categories: categoriesData,
          pagination: paginationData,
          isLoading: false,
          isInitialized: true,
          lastFetchTime: Date.now(),
          error: null
        });
      } else {
        set({
          categories: [],
          pagination: { current_page: 1, last_page: 1, per_page: 10, total: 0 },
          isLoading: false,
          error: response.message || 'Failed to fetch categories'
        });
      }
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      set({
        categories: [],
        pagination: { current_page: 1, last_page: 1, per_page: 10, total: 0 },
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch categories'
      });
    }
  },

  getCategoryDetails: async (id: number) => {
    const currentState = get();
    
    // Check cache first
    if (currentState.categoryDetailsCache.has(id)) {
      return currentState.categoryDetailsCache.get(id) || null;
    }

    try {
      const response = await categoryApi.getDetails(id);
      if (response.status === 1 && response.data) {
        const category = response.data;
        // Cache the result
        currentState.categoryDetailsCache.set(id, category);
        set({ categoryDetailsCache: new Map(currentState.categoryDetailsCache) });
        return category;
      }
    } catch (error) {
      console.error('Error fetching category details:', error);
    }
    return null;
  },

  addCategory: async (data) => {
    try {
      const payload = {
        ...data,
        is_update: '0',
      };
      const response = await categoryApi.create(payload);
      if (response.status === 1) {
        // Refresh the list
        await get().fetchCategories(1);
        return response;
      } else {
        throw new Error(response.message || 'Failed to add category');
      }
    } catch (error) {
      console.error('Add category failed:', error);
      throw error;
    }
  },

  updateCategory: async (id, data) => {
    try {
      const payload = {
        ...data,
        category_id: id,
        is_update: '1',
      };
      const response = await categoryApi.update(id, payload);
      if (response.status === 1) {
        // Refresh the list
        await get().fetchCategories(get().pagination.current_page);
        // Invalidate cache for this category
        get().invalidateCategoryDetailsCache(id);
        return response;
      } else {
        throw new Error(response.message || 'Failed to update category');
      }
    } catch (error) {
      console.error('Update category failed:', error);
      throw error;
    }
  },

  deleteCategory: async (id: number) => {
    try {
      const response = await categoryApi.delete(id);
      if (response.status === 1) {
        // Refresh the list
        await get().fetchCategories(get().pagination.current_page);
        // Invalidate cache for this category
        get().invalidateCategoryDetailsCache(id);
        return response;
      } else {
        throw new Error(response.message || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Delete category failed:', error);
      throw error;
    }
  },

  toggleCategoryStatus: async (id: number, status: number) => {
    try {
      const response = await categoryApi.updateStatus(id, status === 1);
      if (response.status === 1) {
        // Refresh the list
        await get().fetchCategories(get().pagination.current_page);
        // Invalidate cache for this category
        get().invalidateCategoryDetailsCache(id);
        return response;
      } else {
        throw new Error(response.message || 'Failed to update category status');
      }
    } catch (error) {
      console.error('Toggle category status failed:', error);
      throw error;
    }
  },
}));
