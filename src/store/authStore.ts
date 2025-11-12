import { create } from 'zustand';
import { authApi } from '@/api/authApi';
import { storeApi } from '@/api/storeApi';
import type { AuthState, LoginCredentials, AuthUser, UserPermissions, StoreLoginRequest, LoginResponse } from '@/types/auth.types';
import type { StoreLoginResponse } from '@/types/store.types';

interface AuthStore extends AuthState {
  login: (credentials: LoginCredentials, showToast?: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void) => Promise<void>;
  storeLogin: (data: StoreLoginRequest, showToast?: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void) => Promise<void>;
  autoStoreLogin: (storeId: number, showToast?: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void) => Promise<void>;
  switchBackToSuperAdmin: (showToast?: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void,navigate?: (path: string) => void) => Promise<void>;
  logout: (showToast?: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void) => Promise<void>;
  refreshToken: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
  setToken: (token: string | null) => void;
  setAdminPermissions: (permissions: UserPermissions | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('auth_token'),
  isAuthenticated: !!localStorage.getItem('auth_token'),
  isLoading: false,
  adminPermissions: JSON.parse(localStorage.getItem('admin_permissions') || 'null'),

  login: async (credentials: LoginCredentials, showToast?: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void) => {
    set({ isLoading: true });
    try {
      const response: LoginResponse = await authApi.login(credentials);
      
      // Check if login was successful (status: 1)
      if (response.status === 1 && response.data) {
        const { token, user } = response.data;
        
        // Store in localStorage
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Store user permissions directly from user object
        if (user.permissions) {
          localStorage.setItem('admin_permissions', JSON.stringify(user.permissions));
          set({ adminPermissions: user.permissions });
        }
        
        // Update store state
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
        
        // Show success toast if callback provided
        if (showToast) {
          showToast('success', response.message || 'Login successful');
        }
      } else {
        const errorMessage = response.message || 'Login failed';
        if (showToast) {
          showToast('error', errorMessage);
        }
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      set({ isLoading: false });
      if (showToast) {
        // showToast('error', errorMessage);
      }
      throw error;
    }
  },

  storeLogin: async (data: StoreLoginRequest, showToast?: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void) => {
    set({ isLoading: true });
    try {
      const response: StoreLoginResponse = await storeApi.storeLogin(data);
      
      // Check if store login was successful (status: 1)
      if (response.status === 1 && response.data) {
        const { token, user } = response.data;
        
        // Add original_superadmin info to user object if present
        const userWithOriginalSuperAdmin = {
          ...user,
          original_superadmin_id: (user as any).original_superadmin_id,
          original_superadmin_name: (user as any).original_superadmin_name,
          original_superadmin_email: (user as any).original_superadmin_email,
          original_superadmin: (user as any).original_superadmin_id ? {
            id: (user as any).original_superadmin_id,
            name: (user as any).original_superadmin_name,
            email: (user as any).original_superadmin_email
          } : undefined
        };
        
        // Store in localStorage
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user', JSON.stringify(userWithOriginalSuperAdmin));
        
        // Store user permissions directly from user object
        if (user.permissions) {
          localStorage.setItem('admin_permissions', JSON.stringify(user.permissions));
          set({ adminPermissions: user.permissions });
        }
        
        // Update store state
        set({
          user: userWithOriginalSuperAdmin,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
        
        // Show success toast if callback provided
        if (showToast) {
          showToast('success', response.message || 'Store login successful');
        }
      } else {
        const errorMessage = response.message || 'Store login failed';
        if (showToast) {
          showToast('error', errorMessage);
        }
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      set({ isLoading: false });
      const errorMessage = error.response?.data?.message || error.message || 'Store login failed';
      if (showToast) {
        showToast('error', errorMessage);
      }
      throw error;
    }
  },

  autoStoreLogin: async (storeId: number, showToast?: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void) => {
    set({ isLoading: true });
    try {
      const response: LoginResponse = await authApi.autoStoreLogin(storeId);
      
      // Check if auto store login was successful (status: 1)
      if (response.status === 1 && response.data) {
        const { token, user } = response.data;
        
        // Add original_superadmin info to user object if present
        const userWithOriginalSuperAdmin = {
          ...user,
          original_superadmin_id: (user as any).original_superadmin_id,
          original_superadmin_name: (user as any).original_superadmin_name,
          original_superadmin_email: (user as any).original_superadmin_email,
          original_superadmin: (user as any).original_superadmin_id ? {
            id: (user as any).original_superadmin_id,
            name: (user as any).original_superadmin_name,
            email: (user as any).original_superadmin_email
          } : undefined
        };
        
        // Store in localStorage
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user', JSON.stringify(userWithOriginalSuperAdmin));
        
        // Store user permissions directly from user object
        if (user.permissions) {
          localStorage.setItem('admin_permissions', JSON.stringify(user.permissions));
          set({ adminPermissions: user.permissions });
        }
        
        // Update store state
        set({
          user: userWithOriginalSuperAdmin,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
        
        // Show success toast if callback provided
        if (showToast) {
          showToast('success', response.message || 'Auto store login successful');
        }
      } else {
        const errorMessage = response.message || 'Auto store login failed';
        if (showToast) {
          showToast('error', errorMessage);
        }
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      set({ isLoading: false });
      const errorMessage = error.response?.data?.message || error.message || 'Auto store login failed';
      if (showToast) {
        showToast('error', errorMessage);
      }
      throw error;
    }
  },

  switchBackToSuperAdmin: async (showToast?: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void, navigate?: (path: string) => void) => {
    set({ isLoading: true });
    try {
      const response: LoginResponse = await authApi.switchBackToSuperAdmin();
      
      // Check if switch back was successful (status: 1)
      if (response.status === 1 && response.data) {
        const { token, user } = response.data;
        
        // Store in localStorage
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Store user permissions directly from user object
        if (user.permissions) {
          localStorage.setItem('admin_permissions', JSON.stringify(user.permissions));
          set({ adminPermissions: user.permissions });
        }
        
        // Update store state
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
        
        // Show success toast if callback provided
        if (showToast) {
          showToast('success', response.message || 'Switched back to System Admin successfully');
        }
        // Use navigate callback if provided
        if (navigate) {
          navigate('/dashboard');
        }
        // window.location.href = '/dashboard';
        // Redirect to dashboard immediately after successful switch back
        // setTimeout(() => {
        //   window.location.href = '/dashboard';
        // }, 1000);
      } else {
        const errorMessage = response.message || 'Switch back failed';
        if (showToast) {
          showToast('error', errorMessage);
        }
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      set({ isLoading: false });
      const errorMessage = error.response?.data?.message || error.message || 'Switch back failed';
      if (showToast) {
        showToast('error', errorMessage);
      }
      throw error;
    }
  },

  logout: async (showToast?: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void) => {
    try {
      const response = await authApi.logout();
      
      // Check if logout was successful
      if (response.status === 1) {
        // Show success toast if callback provided
        if (showToast) {
          showToast('success', response.message || 'Logged out successfully');
        }
      } else {
        const errorMessage = response.message || 'Logout failed';
        if (showToast) {
          showToast('error', errorMessage);
        }
      }
    } catch (error: any) {
      console.error('Logout error:', error);
      const errorMessage = error.response?.data?.message || 'Logout failed';
      if (showToast) {
        showToast('error', errorMessage);
      }
    } finally {
      get().clearAuth();
    }
  },

  refreshToken: async () => {
    try {
      const response: LoginResponse = await authApi.refreshToken();
      
      if (response.status === 1 && response.data) {
        const { token, user } = response.data;
        
        // Store in localStorage
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Store user permissions directly from user object
        if (user.permissions) {
          localStorage.setItem('admin_permissions', JSON.stringify(user.permissions));
          set({ adminPermissions: user.permissions });
        }
        
        // Update store state
        set({
          user,
          token,
          isAuthenticated: true,
        });
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      get().clearAuth();
    }
  },

  getCurrentUser: async () => {
    set({ isLoading: true });
    try {
      const response: LoginResponse = await authApi.getCurrentUser();
      
      if (response.status === 1) {
        const user = response.data?.user;
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
          
          // Store user permissions directly from user object
          if (user.permissions) {
            localStorage.setItem('admin_permissions', JSON.stringify(user.permissions));
            set({ adminPermissions: user.permissions });
          }
          
          set({ user, isLoading: false });
        }
      }
    } catch (error) {
      set({ isLoading: false });
      console.error('Get current user error:', error);
    }
  },

  setUser: (user: AuthUser | null) => {
    set({ user });
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  },

  setToken: (token: string | null) => {
    set({ token, isAuthenticated: !!token });
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  },

  setAdminPermissions: (permissions: UserPermissions | null) => {
    set({ adminPermissions: permissions });
    if (permissions) {
      localStorage.setItem('admin_permissions', JSON.stringify(permissions));
    } else {
      localStorage.removeItem('admin_permissions');
    }
  },

  clearAuth: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('admin_permissions');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      adminPermissions: null,
    });
  },
}));

