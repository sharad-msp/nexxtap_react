export interface LoginCredentials {
  email: string;
  password: string;
}

export interface StoreLoginRequest {
  store_id: number;
}

export interface AuthResponse {
  status: number; // 1 for success, 0 for error
  message: string;
  message_code: number;
  data?: {
    token: string;
    user: AuthUser;
  };
  admin_permissions?: AdminPermissions;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  roles: string[];
  permissions: string[];
  status?: number;
  profile_image?: string;
  store_id?: number;
  is_store_admin?: boolean;
  auto_logout_enabled?: boolean;
  auto_logout_type?: 'per_transaction' | 'per_time' | 'per_last_activity' | null;
  auto_logout_duration?: number | null;
  original_superadmin_id?: number;
  original_superadmin_name?: string;
  original_superadmin_email?: string;
  original_superadmin?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface AdminPermissions {
  modules?: {
    [key: string]: string[];
  };
  roles?: string[];
  is_system_admin?: boolean;
  is_store_admin?: boolean;
  store_id?: number | null;
  can_manage_stores?: boolean;
  can_manage_admins?: boolean;
  can_access_system_settings?: boolean;
}

// For storing user permissions as string array
export type UserPermissions = string[];

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  adminPermissions: UserPermissions | null;
}

// API Response types for consistency
export interface ApiResponse<T = any> {
  status: number;
  message: string;
  message_code: number;
  data?: T;
  admin_permissions?: AdminPermissions;
}

// Specific response types
export interface LoginResponse extends ApiResponse<{
  token: string;
  user: AuthUser;
}> {}

export interface StoreLoginResponse extends ApiResponse<{
  token: string;
  user: AuthUser;
}> {}

