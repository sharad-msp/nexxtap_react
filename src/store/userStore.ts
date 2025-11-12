import { create } from 'zustand';
import { userApi } from '@/api/userApi';
import type { User, UserRole, PaginationMeta, UserPayload } from '@/types';

interface UserStore {
  users: User[];
  roles: UserRole[];
  pagination: PaginationMeta;
  isLoading: boolean;
  fetchUsers: (page?: number) => Promise<void>;
  fetchUserRoles: () => Promise<void>;
  getUserDetails: (id: number) => Promise<User | null>;
  addOrUpdateUser: (payload: UserPayload) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
  toggleUserStatus: (id: number, status: number) => Promise<void>;
}

export const useUserStore = create<UserStore>((set, get) => ({
  users: [],
  roles: [],
  pagination: {
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  },
  isLoading: false,

  fetchUsers: async (page = 1) => {
    set({ isLoading: true });
    try {
      const response = await userApi.fetchUsers(page);
      if (response.status === 1) {
        const users = response.data || [];
        set({
          users,
          pagination: response.meta || {
            current_page: 1,
            last_page: 1,
            per_page: 10,
            total: users.length,
          },
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Failed to fetch users', error);
      set({ isLoading: false });
      throw error;
    }
  },

  fetchUserRoles: async () => {
    try {
      const response = await userApi.getRoleList();
      if (response.status === 1) {
        set({ roles: response.data || [] });
      }
    } catch (error) {
      console.error('Failed to fetch user roles', error);
      set({ roles: [] });
    }
  },

  getUserDetails: async (id: number) => {
    try {
      const response = await userApi.getById(id);
      if (response.status === 1) {
        return response.data;
      }
    } catch (error) {
      console.error('Failed to fetch user details', error);
    }
    return null;
  },

  addOrUpdateUser: async (payload: UserPayload) => {
    try {
      const response = await userApi.addOrUpdateUser(payload);
      if (response.status === 1) {
        // Refresh the user list
        await get().fetchUsers(1);
      } else {
        throw new Error(response.message || 'Failed to save user');
      }
    } catch (error) {
      console.error('Failed to save user', error);
      throw error;
    }
  },

  deleteUser: async (id: number) => {
    try {
      const response = await userApi.deleteUser(id);
      if (response.status === 1) {
        // Refresh the user list
        await get().fetchUsers(1);
      } else {
        throw new Error(response.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Failed to delete user', error);
      throw error;
    }
  },

  toggleUserStatus: async (id: number, status: number) => {
    try {
      const response = await userApi.toggleUserStatus(id, status);
      if (response.status === 1) {
        // Refresh the user list
        await get().fetchUsers(1);
      } else {
        throw new Error(response.message || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Failed to update user status', error);
      throw error;
    }
  },
}));

