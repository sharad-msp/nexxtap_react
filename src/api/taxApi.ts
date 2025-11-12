import api, { apiWithLoading } from '@/lib/axios';
import type { Tax, CreateTaxRequest, UpdateTaxRequest, TaxResponse, TaxDetailsResponse } from '@/types';

export const taxApi = {
  // Get all taxes with admin response structure
  getAll: async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
  }): Promise<TaxResponse> => {
    const response = await apiWithLoading.get('/tax', { params });
    return response.data;
  },

  // Get tax by ID with admin response structure
  getById: async (id: number): Promise<TaxDetailsResponse> => {
    const response = await apiWithLoading.get(`/tax/${id}`);
    return response.data;
  },

  // Create tax
  create: async (data: CreateTaxRequest): Promise<TaxDetailsResponse> => {
    const response = await apiWithLoading.post('/tax', data);
    return response.data;
  },

  // Update tax
  update: async (id: number, data: UpdateTaxRequest): Promise<TaxDetailsResponse> => {
    const response = await apiWithLoading.put(`/tax/${id}`, data);
    return response.data;
  },

  // Delete tax
  delete: async (id: number): Promise<{ status: number; message: string; message_code: number }> => {
    const response = await apiWithLoading.delete(`/tax/${id}`);
    return response.data;
  },

  // Get all active taxes for the store (for product selection)
  getStoreTaxes: async (): Promise<{ status: number; message: string; data: Tax[] }> => {
    const response = await api.get('/tax/store-taxes');
    return response.data;
  },

  // Get available taxes for products (same as store taxes but different endpoint)
  getAvailableTaxes: async (): Promise<{ status: number; message: string; data: Tax[] }> => {
    const response = await api.get('/product-available-taxes');
    return response.data;
  },
};
