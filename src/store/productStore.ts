import { create } from 'zustand';
import { productApi } from '@/api/product';
import { categoryApi } from '@/api/category';


interface Product {
  id: number;
  name: string;
  category_id: number;
  category_name: string;
  base_price: string;
  description: string;
  tax: string;
  tax_type: string;
  is_gst_applicable: string;
  gst_name: string;
  gst_rate: string;
  store_id: number;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: number;
  name: string;
  description: string;
}

interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface ProductStore {
  products: Product[];
  categories: Category[];
  loading: boolean;
  pagination: Pagination;
  fetchProducts: (storeId?: number, page?: number) => Promise<void>;
  fetchCategories: () => Promise<void>;
  addOrUpdateProduct: (formData: FormData, showToast?: (type: 'success' | 'error', message: string) => void) => Promise<void>;
  deleteProduct: (id: number, showToast?: (type: 'success' | 'error', message: string) => void) => Promise<void>;
  toggleProductStatus: (id: number, status: string, showToast?: (type: 'success' | 'error', message: string) => void) => Promise<void>;
  getProductDetails: (id: number) => Promise<any>;
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  categories: [],
  loading: false,
  pagination: {
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  },

  fetchProducts: async (storeId, page = 1) => {
    set({ loading: true });
    try {
      const res = await productApi.getAll(storeId, page);
      set({
        products: res.data.products || [],
        pagination: res.data.pagination || {
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: 0,
        },
        loading: false,
      });
    } catch (err: any) {
      console.error('Products fetch error:', err?.response?.data || err);
      // Error will be handled by the error handling system
      set({ loading: false });
    }
  },

  fetchCategories: async () => {
    try {
      const res = await categoryApi.getAll({ per_page: 1000 });
      if (res.data.status === 1 && Array.isArray(res.data.data)) {
        set({ categories: res.data });
      } else {
        set({ categories: [] });
        console.warn('Category response missing data:', res.data);
      }
    } catch (err: any) {
      console.error('Fetch categories failed:', err?.response?.data || err);
      // Error will be handled by the error handling system
      set({ categories: [] });
    }
  },

  addOrUpdateProduct: async (formData, showToast?: (type: 'success' | 'error', message: string) => void) => {
    const storeId = formData.get('store_id');
    try {
      const res = await productApi.addOrUpdateProduct(formData);
      if (res.data.status === 1) {
        await get().fetchProducts(Number(storeId));
        if (showToast) {
          showToast('success', 'Product saved successfully.');
        }
      } else {
        if (showToast) {
          showToast('error', res.data.message || 'Failed to save product.');
        }
      }
    } catch (err: any) {
      console.error('Save product error:', err?.response?.data || err);
      if (showToast) {
        showToast('error', 'Failed to save product.');
      }
    }
  },

  deleteProduct: async (id, showToast?: (type: 'success' | 'error', message: string) => void) => {
    try {
      const res = await productApi.delete(id);
      if (res.data.status === 1) {
        if (showToast) {
          showToast('success', 'Product deleted successfully.');
        }
        // Refresh the current page
        const currentProducts = get().products;
        if (currentProducts.length > 0) {
          const storeId = currentProducts[0].store_id;
          await get().fetchProducts(storeId);
        }
      } else {
        if (showToast) {
          showToast('error', res.data.message || 'Failed to delete product.');
        }
      }
    } catch (err: any) {
      console.error('Delete product error:', err?.response?.data || err);
      if (showToast) {
        showToast('error', 'Failed to delete product.');
      }
    }
  },

  toggleProductStatus: async (id, status, showToast?: (type: 'success' | 'error', message: string) => void) => {
    try {
      const res = await productApi.updateStatus(id, status);
      if (res.data.status === 1) {
        if (showToast) {
          showToast('success', 'Product status updated successfully.');
        }
        // Refresh the current page
        const currentProducts = get().products;
        if (currentProducts.length > 0) {
          const storeId = currentProducts[0].store_id;
          await get().fetchProducts(storeId);
        }
      } else {
        if (showToast) {
          showToast('error', res.data.message || 'Failed to update product status.');
        }
      }
    } catch (err: any) {
      console.error('Toggle product status error:', err?.response?.data || err);
      if (showToast) {
        showToast('error', 'Failed to update product status.');
      }
    }
  },

  getProductDetails: async (id) => {
    try {
      const res = await productApi.getById(id);
      if (res.data.status === 1) {
        return res.data;
      }
    } catch (err: any) {
      console.error('Get product details error:', err?.response?.data || err);
      // Error will be handled by the error handling system
    }
    return null;
  },
}));
