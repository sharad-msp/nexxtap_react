import api from '@/lib/axios';
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '@/types/category.types';

export const categoryApi = {
  // Get all categories
  getAll: async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    status?: number;
  }): Promise<{ data: Category[]; meta: any }> => {
    const response = await api.get('/category', { params });
    return response.data;
  },

  // Get category by ID
  getById: async (id: number): Promise<Category> => {
    const response = await api.get(`/category/${id}`);
    return response.data;
  },

  // Create category
  create: async (data: CreateCategoryRequest): Promise<Category> => {
    const response = await api.post('/category', data);
    return response.data;
  },

  // Update category
  update: async (id: number, data: UpdateCategoryRequest): Promise<Category> => {
    const response = await api.put(`/category/${id}`, data);
    return response.data;
  },

  // Delete category
  delete: async (id: number): Promise<void> => {
    await api.delete(`/category/${id}`);
  },

  // Update category status
  updateStatus: async (id: number, status: boolean): Promise<Category> => {
    const response = await api.post('/category/update-status', { category_id: id, update_status: status ? 1 : 0 });
    return response.data;
  },

  // Additional methods for compatibility with existing store
  fetchCategories: async (page = 1, params?: any) => {
    const response = await api.get('/category', { 
      params: { 
        page, 
        per_page: 10,
        ...params 
      } 
    });
    return response.data;
  },

  addOrUpdateCategory: async (payload: any) => {
    if (payload.id) {
      const response = await api.put(`/category/${payload.id}`, payload);
      return response.data;
    } else {
      const response = await api.post('/category', payload);
      return response.data;
    }
  },

  deleteCategory: async (id: number) => {
    const response = await api.delete(`/category/${id}`);
    return response.data;
  },

  toggleCategoryStatus: async (id: number, status: number) => {
    const response = await api.post('/category/update-status', { 
      category_id: id, 
      update_status: status 
    });
    return response.data;
  },

  // Additional methods for compatibility with existing store
  getCategoryDetails: async (id: number) => {
    const response = await api.post('/category/get-details', { category_id: id });
    return response.data;
  },
}; 