export type RoleType = 'admin' | 'pos' | 'kds';

export interface Role {
  id: number;
  name: string;
  role_type?: RoleType | null;
  permissions: Permission[];
  status: boolean | number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  users_count?: number;
}

export interface Permission {
  id: number;
  name: string;
  display_name?: string;
  module?: string;
  guard_name?: string;
  store_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateRoleRequest {
  name: string;
  role_type?: RoleType | null;
  permissions: (string | number)[];
  status: number;
  is_update: number;
}

export interface UpdateRoleRequest {
  name?: string;
  role_type?: RoleType | null;
  permissions?: (string | number)[];
  status?: number;
  is_update: number;
  role_id: number;
}

export interface RoleFormData {
  name: string;
  role_type?: RoleType | null;
  permissions: (string | number)[];
  status?: boolean | number;
  is_update?: number;
  role_id?: number;
}

// Admin API Response Structure - Updated to use number status
export interface RoleResponse {
  status: number; // 1 for success, 0 for error
  message: string;
  message_code: number;
  data: Role[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  admin_permissions?: {
    modules: {
      [key: string]: string[];
    };
    roles: string[];
    is_system_admin: boolean;
    is_store_admin: boolean;
    store_id: number | null;
    can_manage_stores: boolean;
    can_manage_admins: boolean;
    can_access_system_settings: boolean;
  };
}

export interface RoleDetailsResponse {
  status: number; // 1 for success, 0 for error
  message: string;
  message_code: number;
  data: Role;
  admin_permissions?: {
    modules: {
      [key: string]: string[];
    };
    roles: string[];
    is_system_admin: boolean;
    is_store_admin: boolean;
    store_id: number | null;
    can_manage_stores: boolean;
    can_manage_admins: boolean;
    can_access_system_settings: boolean;
  };
}

export interface PermissionsResponse {
  status: number;
  message: string;
  data: {
    permissions: Permission[];
  };
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
