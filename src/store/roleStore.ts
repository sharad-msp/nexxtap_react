import { create } from 'zustand';
import { roleApi } from '@/api/roleApi';
import type { Role, RoleFormData, Permission, PaginationMeta } from '@/types/role.types';

interface RoleStore {
  roles: Role[];
  permissions: Permission[];
  pagination: PaginationMeta;
  isLoading: boolean;
  isInitialized: boolean;
  lastFetchTime: number;
  error: string | null;
  fetchRoles: (page?: number, search?: string, status?: string) => Promise<void>;
  fetchPermissions: () => Promise<void>;
  getRoleDetails: (id: number) => Promise<Role | null>;
  addOrUpdateRole: (payload: RoleFormData) => Promise<void>;
  deleteRole: (id: number) => Promise<void>;
  toggleRoleStatus: (id: number, status: number) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setInitialized: (initialized: boolean) => void;
  setLastFetchTime: (time: number) => void;
  reset: () => void;
  roleDetailsCache: Map<number, Role>;
  clearRoleDetailsCache: () => void;
  invalidateRoleDetailsCache: (id?: number) => void;
  clearAllCaches: () => void;
}

export const useRoleStore = create<RoleStore>((set, get) => ({
  roles: [],
  permissions: [],
  pagination: {
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  },
  isLoading: false,
  isInitialized: false,
  lastFetchTime: 0,
  error: null,
  roleDetailsCache: new Map(),

  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setError: (error: string | null) => set({ error }),
  setInitialized: (initialized: boolean) => set({ isInitialized: initialized }),
  setLastFetchTime: (time: number) => set({ lastFetchTime: time }),
  reset: () => set({ 
    roles: [], 
    permissions: [], 
    pagination: { current_page: 1, last_page: 1, per_page: 10, total: 0 },
    isLoading: false,
    isInitialized: false,
    lastFetchTime: 0,
    error: null,
    roleDetailsCache: new Map()
  }),

  // Cache management methods
  clearRoleDetailsCache: () => set({ roleDetailsCache: new Map() }),
  invalidateRoleDetailsCache: (id?: number) => {
    const currentState = get();
    if (id) {
      currentState.roleDetailsCache.delete(id);
    } else {
      currentState.roleDetailsCache.clear();
    }
    set({ roleDetailsCache: new Map(currentState.roleDetailsCache) });
  },

  // Clear all caches and reset state (useful for logout)
  clearAllCaches: () => {
    set({ 
      roles: [], 
      permissions: [], 
      pagination: { current_page: 1, last_page: 1, per_page: 10, total: 0 },
      isLoading: false,
      isInitialized: false,
      lastFetchTime: 0,
      error: null,
      roleDetailsCache: new Map()
    });
  },

  fetchRoles: async (page = 1, search = '', status = 'all') => {
    const currentState = get();
    if (currentState.isLoading) {
      return;
    }
    
    set({ isLoading: true, error: null });
    try {
      const params: any = {
        page,
        per_page: 10,
        search
      };
      
      if (status !== 'all') {
        params.status = status;
      }

      const response = await roleApi.getAll(params);
      if (response.status === 1 && response.data) {
        const roles = response.data || [];
        set({
          roles,
          pagination: response.meta || {
            current_page: 1,
            last_page: 1,
            per_page: 10,
            total: roles.length,
          },
          lastFetchTime: Date.now(),
          isInitialized: true,
        });
      } else {
        set({
          roles: [],
          pagination: {
            current_page: 1,
            last_page: 1,
            per_page: 10,
            total: 0,
          },
          error: 'Failed to fetch roles',
        });
      }
    } catch (error) {
      console.error('Failed to fetch roles', error);
      set({ error: 'Failed to fetch roles' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchPermissions: async () => {
    const currentState = get();
    if (currentState.permissions.length > 0) {
      return;
    }
    
    try {
      const response = await roleApi.getPermissionList();
      if (response.status === 1) {
        // The API now returns a flat array of permissions with module information
        const permissionList = (response.data as any).permission_list || [];
        set({ permissions: permissionList });
      }
    } catch (error) {
      console.error('Failed to fetch permissions', error);
      set({ permissions: [], error: 'Failed to fetch permissions' });
    }
  },

  getRoleDetails: async (id: number) => {
    const currentState = get();
    const cachedRole = currentState.roleDetailsCache.get(id);
    if (cachedRole) {
      return cachedRole;
    }

    try {
      const response = await roleApi.getDetails(id);
      if (response.status === 1 && response.data) {
        const roleDetails = response.data;
        // Ensure permissions have module information
        if (roleDetails.permissions) {
          roleDetails.permissions = roleDetails.permissions.map((permission: any) => ({
            ...permission,
            module: permission.module || permission.name.split('_')[0] || 'other'
          }));
        }
        
        // Cache the result
        const newCache = new Map(currentState.roleDetailsCache);
        newCache.set(id, roleDetails);
        set({ roleDetailsCache: newCache });
        
        return roleDetails;
      }
    } catch (error) {
      console.error('Failed to fetch role details', error);
    }
    return null;
  },

  addOrUpdateRole: async (payload: RoleFormData) => {
    const currentState = get();
    if (currentState.isLoading) {
      
      return;
    }
    
    set({ isLoading: true, error: null });
    try {
      const apiPayload = {
        ...payload,
        permissions: payload.permissions, // Send permission IDs directly
        status: payload.status ? 1 : 0,
        is_update: payload.is_update || 0,
      };

      let response;
      if (payload.is_update && payload.role_id) {
        const updatePayload = { ...apiPayload, role_id: payload.role_id };
        response = await roleApi.update(payload.role_id, updatePayload);
      } else {
        response = await roleApi.create(apiPayload);
      }
      
      if (response.status === 1) {
        // Invalidate cache for updated role
        if (payload.role_id) {
          get().invalidateRoleDetailsCache(payload.role_id);
        }
        // Refresh the role list
        await get().fetchRoles(1);
      } else {
        throw new Error(response.message || 'Failed to save role');
      }
    } catch (error: any) {
      console.error('Failed to save role', error);
      
      // Handle validation errors
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        const errorMessage = errorMessages.join(', ');
        set({ error: errorMessage });
        throw new Error(errorMessage);
      }
      
      // Handle other errors
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save role';
      set({ error: errorMessage });
      throw new Error(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },

  deleteRole: async (id: number) => {
    const currentState = get();
    if (currentState.isLoading) {
      
      return;
    }
    
    set({ isLoading: true, error: null });
    try {
      const response = await roleApi.delete(id);
      if (response.status === 1) {
        // Invalidate cache for deleted role
        get().invalidateRoleDetailsCache(id);
        // Refresh the role list
        await get().fetchRoles(1);
      } else {
        throw new Error(response.message || 'Failed to delete role');
      }
    } catch (error: any) {
      console.error('Failed to delete role', error);
      
      // Handle validation errors
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        const errorMessage = errorMessages.join(', ');
        set({ error: errorMessage });
        throw new Error(errorMessage);
      }
      
      // Handle other errors
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete role';
      set({ error: errorMessage });
      throw new Error(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },

  toggleRoleStatus: async (id: number, status: number) => {
    const currentState = get();
    if (currentState.isLoading) {
      
      return;
    }
    
    set({ isLoading: true, error: null });
    try {
      const response = await roleApi.updateStatus(id, status === 1);
      if (response.status === 1) {
        // Invalidate cache for updated role
        get().invalidateRoleDetailsCache(id);
        // Refresh the role list
        await get().fetchRoles(1);
      } else {
        throw new Error(response.message || 'Failed to toggle role status');
      }
    } catch (error: any) {
      console.error('Failed to toggle role status', error);
      
      // Handle validation errors
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        const errorMessage = errorMessages.join(', ');
        set({ error: errorMessage });
        throw new Error(errorMessage);
      }
      
      // Handle other errors
      const errorMessage = error.response?.data?.message || error.message || 'Failed to toggle role status';
      set({ error: errorMessage });
      throw new Error(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },
}));
