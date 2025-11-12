import api, { apiWithLoading } from '@/lib/axios';
import type { Category, CreateCategoryRequest, UpdateCategoryRequest, CategoryResponse, CategoryDetailsResponse } from '@/types/category.types';

export const categoryApi = {
  // Get all categories with admin response structure
  getAll: async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    status?: string;
  }): Promise<CategoryResponse> => {
    const response = await apiWithLoading.get('/category', { params });
    return response.data;
  },

  // Get category by ID with admin response structure
  getById: async (id: number): Promise<CategoryDetailsResponse> => {
    const response = await apiWithLoading.get(`/category/${id}`);
    return response.data;
  },

  // Create category
  create: async (data: CreateCategoryRequest): Promise<CategoryDetailsResponse> => {
    const requestData = {
      category_name: data.name,
      status: data.status ? 1 : 0,
      is_update: 0,
      attributes: data.attributes
    };
    const response = await apiWithLoading.post('/category', requestData);
    return response.data;
  },

  // Update category
  update: async (id: number, data: UpdateCategoryRequest): Promise<CategoryDetailsResponse> => {
    const requestData = {
      category_name: data.name,
      status: data.status ? 1 : 0,
      is_update: 1,
      category_id: id,
      attributes: data.attributes,
      deleted_ids: data.deleted_ids || [],
      deleted_option_ids: data.deleted_option_ids || []
    };
    const response = await apiWithLoading.put(`/category/${id}`, requestData);
    return response.data;
  },

  // Delete category
  delete: async (id: number): Promise<{ status: number; message: string; message_code: number }> => {
    const response = await apiWithLoading.delete(`/category/${id}`);
    return response.data;
  },

  // Update category status
  updateStatus: async (id: number, status: boolean): Promise<CategoryDetailsResponse> => {
    const response = await apiWithLoading.post(`/category/update-status`, { 
      category_id: id, 
      update_status: status ? 1 : 0 
    });
    return response.data;
  },

  // Get category details
  getDetails: async (id: number): Promise<CategoryDetailsResponse> => {
    const response = await apiWithLoading.post('/category/get-details', { category_id: id });
    return response.data;
  },
};
