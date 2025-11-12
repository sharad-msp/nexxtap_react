export interface Permission {
  id: number;
  name: string;
  module: string;
  action: string;
  guard_name: string;
  store_id: number;
  is_global: boolean;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: number;
  name: string;
  guard_name: string;
  store_id: number;
  status: number;
  permissions: Permission[];
  created_at: string;
  updated_at: string;
}

export interface UserPermissions {
  user: {
    id: number;
    name: string;
    email: string;
    store_id: number;
    status: number;
  };
  permissions_by_module: Record<string, string[]>;
  all_permissions: string[];
  roles: string[];
}

export interface ModulePermissions {
  module: string;
  permissions: string[];
  permission_names: string[];
}

export interface RoleAssignment {
  user_id: number;
  role_id: number;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissions?: string[];
}

export interface StoreContext {
  type: 'system_admin' | 'store_admin';
  scope: 'global' | 'store';
  store_id?: number;
  store_name?: string;
  accessible_stores?: Record<string, number>;
}

export interface CurrentUserPermissions {
  user_id: number;
  name: string;
  email: string;
  is_system_admin: boolean;
  is_store_admin: boolean;
  store_id: number;
  roles: string[];
  permissions_by_module: Record<string, string[]>;
  all_permissions: string[];
}

export interface RoleSummary {
  description: string;
  store_scope: string;
  permission_count: number;
  permissions: string[] | string;
}

export interface PermissionSystemOverview {
  available_modules: string[];
  available_roles: string[];
  role_summary: Record<string, RoleSummary>;
  current_user_permissions: CurrentUserPermissions;
  store_context: StoreContext;
}
