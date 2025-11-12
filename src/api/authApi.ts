import { apiWithLoading } from '@/lib/axios';
import type { LoginCredentials, LoginResponse, StoreLoginRequest } from '@/types/auth.types';

export const authApi = {
  // Admin Login
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiWithLoading.post('/login', credentials);
    return response.data;
  },

  // Store Login (for system admin)
  storeLogin: async (data: StoreLoginRequest): Promise<LoginResponse> => {
    const response = await apiWithLoading.post('/stores-login', data);
    return response.data;
  },

  // Auto Store Login (for system admin with just store_id)
  autoStoreLogin: async (storeId: number): Promise<LoginResponse> => {
    const response = await apiWithLoading.post('/auto-store-login', { store_id: storeId });
    return response.data;
  },

  // Switch back to superadmin (for store admin)
  switchBackToSuperAdmin: async (): Promise<LoginResponse> => {
    const response = await apiWithLoading.post('/switch-back-to-superadmin');
    return response.data;
  },

  // Logout
  logout: async (): Promise<{ status: number; message: string; message_code: number }> => {
    const response = await apiWithLoading.post('/logout');
    return response.data;
  },

  // Refresh token
  refreshToken: async (): Promise<LoginResponse> => {
    const response = await apiWithLoading.post('/auth/refresh');
    return response.data;
  },

  // Get current user
  getCurrentUser: async (): Promise<LoginResponse> => {
    const response = await apiWithLoading.get('/auth/me');
    return response.data;
  },
};

