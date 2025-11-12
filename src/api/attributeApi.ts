import { apiWithLoading } from '@/lib/axios';
import type { CreateAttributeRequest, UpdateAttributeRequest, AttributeResponse, AttributeDetailsResponse } from '@/types/attribute.types';

export const attributeApi = {
  // Get active attributes with active options (presets)
  getActiveWithOptions: async (): Promise<AttributeResponse> => {
    const response = await apiWithLoading.get('/attribute/active-with-options');
    return response.data;
  },
  // Get all attributes with admin response structure
  getAll: async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    status?: string;
  }): Promise<AttributeResponse> => {
    const response = await apiWithLoading.get('/attribute', { params });
    return response.data;
  },

  // Get attribute by ID with admin response structure
  getById: async (id: number): Promise<AttributeDetailsResponse> => {
    const response = await apiWithLoading.get(`/attribute/${id}`);
    return response.data;
  },

  // Get attribute details
  getDetails: async (id: number): Promise<AttributeDetailsResponse> => {
    const response = await apiWithLoading.post('/attribute/get-details', { attribute_id: id });
    return response.data;
  },

  // Create attribute
  create: async (data: CreateAttributeRequest): Promise<AttributeDetailsResponse> => {
    const requestData = {
      attribute_name: data.name,
      status: data.status ? 1 : 0,
      is_update: 0,
      allow_multiple: data.allow_multiple || false,
      display_order: data.display_order || 0,
      options: data.options?.map((opt, idx) => ({
        value: opt.value,
        price_modifier: opt.price_modifier || 0,
        display_order: opt.display_order ?? idx,
        status: opt.status ? 1 : 0
      }))
    };
    const response = await apiWithLoading.post('/attribute', requestData);
    return response.data;
  },

  // Update attribute
  update: async (id: number, data: UpdateAttributeRequest): Promise<AttributeDetailsResponse> => {
    const requestData = {
      attribute_name: data.name,
      status: data.status ? 1 : 0,
      is_update: 1,
      attribute_id: id,
      allow_multiple: data.allow_multiple || false,
      display_order: data.display_order || 0,
      options: data.options?.map((opt, idx) => ({
        id: opt.id,
        value: opt.value,
        price_modifier: opt.price_modifier || 0,
        display_order: opt.display_order ?? idx,
        status: opt.status ? 1 : 0
      })),
      deleted_option_ids: data.deleted_option_ids || []
    };
    const response = await apiWithLoading.put(`/attribute/${id}`, requestData);
    return response.data;
  },

  // Delete attribute
  delete: async (id: number): Promise<{ status: number; message: string; message_code: number }> => {
    const response = await apiWithLoading.delete(`/attribute/${id}`);
    return response.data;
  },

  // Update attribute status
  updateStatus: async (id: number, status: boolean): Promise<{ status: number; message: string; message_code: number }> => {
    const response = await apiWithLoading.post('/attribute/update-status', {
      attribute_id: id,
      update_status: status ? 1 : 0
    });
    return response.data;
  },
};

