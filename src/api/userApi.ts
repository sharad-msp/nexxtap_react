import api, { apiWithLoading } from '@/lib/axios';
import type { User, CreateUserRequest, UpdateUserRequest, UserResponse, UserDetailsResponse } from '@/types/user.types';

export const userApi = {
  // Get all users with admin response structure
  getAll: async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    status?: string;
  }): Promise<UserResponse> => {
    const response = await apiWithLoading.get('/user', { params });
    return response.data;
  },

  // Get user by ID with admin response structure
  getById: async (id: number): Promise<UserDetailsResponse> => {
    const response = await apiWithLoading.get(`/user/${id}`);
    return response.data;
  },

  // Create user
  create: async (data: CreateUserRequest): Promise<UserDetailsResponse> => {
    const response = await apiWithLoading.post('/user', data);
    return response.data;
  },

  // Update user
  update: async (id: number, data: UpdateUserRequest): Promise<UserDetailsResponse> => {
    const response = await apiWithLoading.put(`/user/${id}`, data);
    return response.data;
  },

  // Delete user
  delete: async (id: number): Promise<{ status: number; message: string; message_code: number }> => {
    const response = await apiWithLoading.delete(`/user/${id}`);
    return response.data;
  },

  // Update user status
  updateStatus: async (id: number, status: boolean): Promise<UserDetailsResponse> => {
    const response = await apiWithLoading.post(`/user/update-status`, { id, status });
    return response.data;
  },

  // Get role list
  getRoleList: async (): Promise<{ status: number; message: string; message_code: number; data: any[] }> => {
    const response = await apiWithLoading.post('/user/role-list');
    return response.data;
  },

  // Get user details
  getDetails: async (id: number): Promise<UserDetailsResponse> => {
    const response = await apiWithLoading.post('/user/get-details', { id });
    return response.data;
  },

  // Get device logs for a user
  getDeviceLogs: async (id: number): Promise<{ status: number; message: string; message_code: number; data: any[] }> => {
    const response = await apiWithLoading.get(`/user/${id}/device-logs`);
    return response.data;
  },
};

