import api, { apiWithLoading } from '@/lib/axios';
import type { Role, CreateRoleRequest, UpdateRoleRequest, RoleResponse, RoleDetailsResponse } from '@/types/role.types';

export const roleApi = {
  // Get all roles with admin response structure
  getAll: async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    status?: string;
  }): Promise<RoleResponse> => {
    const response = await apiWithLoading.get('/role', { params });
    return response.data;
  },

  // Get role by ID with admin response structure
  getById: async (id: number): Promise<RoleDetailsResponse> => {
    const response = await apiWithLoading.get(`/role/${id}`);
    return response.data;
  },

  // Create role
  create: async (data: CreateRoleRequest): Promise<RoleDetailsResponse> => {
    const response = await apiWithLoading.post('/role', data);
    return response.data;
  },

  // Update role
  update: async (id: number, data: UpdateRoleRequest): Promise<RoleDetailsResponse> => {
    const response = await apiWithLoading.put(`/role/${id}`, data);
    return response.data;
  },

  // Delete role
  delete: async (id: number): Promise<{ status: number; message: string; message_code: number }> => {
    const response = await apiWithLoading.delete(`/role/${id}`);
    return response.data;
  },

  // Update role status
  updateStatus: async (id: number, status: boolean): Promise<RoleDetailsResponse> => {
    const response = await apiWithLoading.post(`/role/update-status`, { 
      role_id: id, 
      update_status: status ? 1 : 0 
    });
    return response.data;
  },

  // Get permission list
  getPermissionList: async (): Promise<{ status: number; message: string; message_code: number; data: any[] }> => {
    const response = await apiWithLoading.post('/role/permission-list');
    return response.data;
  },

  // Get role details
  getDetails: async (id: number): Promise<RoleDetailsResponse> => {
    const response = await apiWithLoading.get(`/role/${id}`);
    return response.data;
  },
};
