import api, { apiWithLoading } from '@/lib/axios';
import type { Product, CreateProductRequest, UpdateProductRequest, ProductResponse, ProductDetailsResponse } from '@/types/product.types';

export const productApi = {
  // Get all products with admin response structure
  getAll: async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    status?: string;
    category_id?: number;
  }): Promise<ProductResponse> => {
    const response = await apiWithLoading.get('/product', { params });
    return response.data;
  },

  // Get product by ID with admin response structure
  getById: async (id: number): Promise<ProductDetailsResponse> => {
    const response = await apiWithLoading.get(`/product/${id}`);
    return response.data;
  },

  // Create product
  create: async (data: CreateProductRequest): Promise<ProductDetailsResponse> => {
    // Check if we have a file to upload
    if (data.image instanceof File) {
      const formData = new FormData();
      
      // Add all non-file fields
      Object.keys(data).forEach(key => {
        if (key === 'image') {
          formData.append('image', data.image as File);
        } else if (key === 'option_values' && Array.isArray(data[key as keyof CreateProductRequest])) {
          formData.append('option_values', JSON.stringify(data[key as keyof CreateProductRequest]));
        } else if (key === 'tax_ids' && Array.isArray(data[key as keyof CreateProductRequest])) {
          formData.append('tax_ids', JSON.stringify(data[key as keyof CreateProductRequest]));
        } else if (data[key as keyof CreateProductRequest] !== undefined && data[key as keyof CreateProductRequest] !== null) {
          formData.append(key, String(data[key as keyof CreateProductRequest]));
        }
      });
      
      const response = await apiWithLoading.post('/product', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } else {
      // No file, send as regular JSON
      const response = await apiWithLoading.post('/product', data);
      return response.data;
    }
  },

  // Update product
  update: async (id: number, data: UpdateProductRequest): Promise<ProductDetailsResponse> => {
    // Check if we have a file to upload
    if (data.image instanceof File) {
      const formData = new FormData();
      
      // Add all non-file fields
      Object.keys(data).forEach(key => {
        if (key === 'image') {
          formData.append('image', data.image as File);
        } else if (key === 'option_values' && Array.isArray(data[key as keyof UpdateProductRequest])) {
          formData.append('option_values', JSON.stringify(data[key as keyof UpdateProductRequest]));
        } else if (key === 'tax_ids' && Array.isArray(data[key as keyof UpdateProductRequest])) {
          formData.append('tax_ids', JSON.stringify(data[key as keyof UpdateProductRequest]));
        } else if (key === 'deleted_ids' && Array.isArray(data[key as keyof UpdateProductRequest])) {
          formData.append('deleted_ids', JSON.stringify(data[key as keyof UpdateProductRequest]));
        } else if (data[key as keyof UpdateProductRequest] !== undefined && data[key as keyof UpdateProductRequest] !== null) {
          formData.append(key, String(data[key as keyof UpdateProductRequest]));
        }
      });
      
      const response = await apiWithLoading.put(`/product/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } else {
      // No file, send as regular JSON
      const response = await apiWithLoading.put(`/product/${id}`, data);
      return response.data;
    }
  },

  // Delete product
  delete: async (id: number): Promise<{ status: number; message: string; message_code: number }> => {
    const response = await apiWithLoading.delete(`/product/${id}`);
    return response.data;
  },

  // Update product status
  updateStatus: async (id: number, status: boolean): Promise<ProductDetailsResponse> => {
    const response = await apiWithLoading.post(`/product/update-status`, { 
      product_id: id, 
      update_status: status ? 1 : 0 
    });
    return response.data;
  },

  // Get category attributes for a specific category
  getCategoryAttributes: async (categoryId: number): Promise<any[]> => {
    const response = await apiWithLoading.get(`/category/${categoryId}/attributes`);
    return response.data;
  },
};
