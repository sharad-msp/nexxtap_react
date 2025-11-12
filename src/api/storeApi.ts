import api, { apiWithLoading } from '@/lib/axios';
import type { 
  Store, 
  CreateStoreRequest, 
  UpdateStoreRequest, 
  StoreResponse, 
  StoreDetailsResponse,
  StoreLoginRequest,
  StoreLoginResponse
} from '@/types/store.types';

export const storeApi = {
  // Get all stores with admin response structure
  getAll: async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    status?: string;
  }): Promise<StoreResponse> => {
    const response = await apiWithLoading.get('/stores', { params });
    return response.data;
  },

  // Get store by ID with admin response structure
  getById: async (id: number): Promise<StoreDetailsResponse> => {
    const response = await apiWithLoading.get(`/stores/${id}`);
    return response.data;
  },

  // Create store with admin user auto-login system
  create: async (data: CreateStoreRequest): Promise<StoreDetailsResponse> => {
    const response = await apiWithLoading.post('/stores', data);
    return response.data;
  },

  // Update store
  update: async (id: number, data: UpdateStoreRequest): Promise<StoreDetailsResponse> => {
    const response = await apiWithLoading.put(`/stores/${id}`, data);
    return response.data;
  },

  // Delete store
  delete: async (id: number): Promise<{ status: number; message: string; message_code: number }> => {
    const response = await apiWithLoading.delete(`/stores/${id}`);
    return response.data;
  },

  // Update store status
  updateStatus: async (id: number, status: boolean): Promise<StoreDetailsResponse> => {
    const response = await apiWithLoading.post(`/stores/${id}/update-status`, { status });
    return response.data;
  },

  // Store auto-login system for system admin
  storeLogin: async (data: StoreLoginRequest): Promise<StoreLoginResponse> => {
    const response = await apiWithLoading.post('/stores-login', data);
    return response.data;
  },

  // Get store permissions and roles
  getStorePermissions: async (id: number): Promise<{
    status: number;
    message: string;
    message_code: number;
    data: {
      permissions: any;
      roles: any[];
    };
  }> => {
    const response = await apiWithLoading.get(`/stores/${id}/permissions`);
    return response.data;
  },

  // Additional methods for compatibility with existing store
  fetchStores: async (page = 1, params?: any): Promise<StoreResponse> => {
    const response = await apiWithLoading.get('/stores', { 
      params: { 
        page, 
        per_page: 10,
        ...params 
      } 
    });
    return response.data;
  },

  addOrUpdateStore: async (payload: any): Promise<StoreDetailsResponse> => {
    if (payload.id) {
      const response = await apiWithLoading.put(`/stores/${payload.id}`, payload);
      return response.data;
    } else {
      const response = await apiWithLoading.post('/stores', payload);
      return response.data;
    }
  },

  deleteStore: async (id: number): Promise<{ status: number; message: string; message_code: number }> => {
    const response = await apiWithLoading.delete(`/stores/${id}`);
    return response.data;
  },

  toggleStoreStatus: async (id: number, status: boolean): Promise<StoreDetailsResponse> => {
    const response = await apiWithLoading.post(`/stores/${id}/update-status`, { 
      status 
    });
    return response.data;
  },
};
