export interface UserRole {
  id: number;
  name: string;
  status: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  roles: UserRole[];
  permissions?: string[];
  status: boolean;
  status_text?: string;
  profile_image?: string;
  store_id?: number;
  is_store_admin?: boolean | null;
  auto_logout_enabled?: boolean;
  auto_logout_type?: 'per_transaction' | 'per_time' | 'per_last_activity' | null;
  auto_logout_duration?: number | null;
  last_activity_at?: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: string;
  status?: boolean;
  auto_logout_enabled?: boolean;
  auto_logout_type?: 'per_transaction' | 'per_time' | 'per_last_activity';
  auto_logout_duration?: number;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
  role?: string;
  status?: boolean;
  auto_logout_enabled?: boolean;
  auto_logout_type?: 'per_transaction' | 'per_time' | 'per_last_activity';
  auto_logout_duration?: number;
}

// Admin API Response Structure - Updated to match actual API response
export interface UserResponse {
  status: number; // 1 for success, 0 for error
  message: string;
  message_code: number;
  data: User[]; // Direct array of users
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    links: Array<{
      url: string | null;
      label: string;
      page: number | null;
      active: boolean;
    }>;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
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

export interface UserDetailsResponse {
  status: number; // 1 for success, 0 for error
  message: string;
  message_code: number;
  data: User;
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

