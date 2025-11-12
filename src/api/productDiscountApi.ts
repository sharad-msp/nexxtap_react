import api, { apiWithLoading } from '@/lib/axios';
import type { 
  ProductDiscount, 
  CreateProductDiscountRequest, 
  UpdateProductDiscountRequest, 
  ProductDiscountResponse, 
  ProductDiscountDetailsResponse 
} from '@/types';

export const productDiscountApi = {
  // Get all product discounts with admin response structure
  getAll: async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
  }): Promise<ProductDiscountResponse> => {
    const response = await apiWithLoading.get('/product-discount', { params });
    return response.data;
  },

  // Get product discount by ID with admin response structure
  getById: async (id: number): Promise<ProductDiscountDetailsResponse> => {
    const response = await apiWithLoading.get(`/product-discount/${id}`);
    return response.data;
  },

  // Create product discount
  create: async (data: CreateProductDiscountRequest): Promise<ProductDiscountDetailsResponse> => {
    const response = await apiWithLoading.post('/product-discount', data);
    return response.data;
  },

  // Update product discount
  update: async (id: number, data: UpdateProductDiscountRequest): Promise<ProductDiscountDetailsResponse> => {
    const response = await apiWithLoading.put(`/product-discount/${id}`, data);
    return response.data;
  },

  // Delete product discount
  delete: async (id: number): Promise<{ status: number; message: string; message_code: number }> => {
    const response = await apiWithLoading.delete(`/product-discount/${id}`);
    return response.data;
  },

  // Get all active product discounts for the store (for product selection)
  getStoreProductDiscounts: async (): Promise<{ status: number; message: string; data: ProductDiscount[] }> => {
    const response = await api.get('/product-discount/store-discounts');
    return response.data;
  },
};
