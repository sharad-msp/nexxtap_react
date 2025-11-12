export interface StoreAdmin {
  id: number;
  name: string;
  email: string;
  profile_image: string | null;
  status: boolean;
  status_text: string;
  store_id: number;
  is_store_admin: number;
  auto_logout_enabled: boolean;
  auto_logout_type: string | null;
  auto_logout_duration: number | null;
  last_activity_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Store {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  business_type: string;
  store_hours_from: string;
  store_hours_to: string;
  tax_registration_number?: string;
  min_preparation_time: number;
  max_preparation_time: number;
  regulatory_info?: string | null;
  status: boolean;
  admin?: StoreAdmin;
  status_text: string;
  created_at: string;
  updated_at: string;
}

export interface CreateStoreRequest {
  store_name: string;
  store_address: string;
  city: string;
  state: string;
  contact_number: string;
  contact_email: string;
  business_type: string;
  store_hours_from: string;
  store_hours_to: string;
  tax_registration_number?: string;
  status?: boolean;
  // Admin user data for auto-login system
  admin_name: string;
  admin_email: string;
  admin_password: string;
}

export interface UpdateStoreRequest {
  store_name?: string;
  store_address?: string;
  city?: string;
  state?: string;
  contact_number?: string;
  contact_email?: string;
  business_type?: string;
  store_hours_from?: string;
  store_hours_to?: string;
  tax_registration_number?: string;
  regulatory_info?: string;
  status?: boolean;
}

export interface StoreLoginRequest {
  store_id: number;
}

// Updated to match the new response structure
export interface StoreLoginResponse {
  status: number; // 1 for success, 0 for error
  message: string;
  message_code: number;
  data: {
    token: string;
    user: {
      id: number;
      name: string;
      email: string;
      roles: string[];
      permissions: string[];
      store_id?: number;
      is_store_admin?: boolean;
    };
    original_superadmin?: {
      id: number;
      name: string;
      email: string;
    };
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

// Admin API Response Structure - Updated to match actual API response
export interface StoreResponse {
  status: number; // 1 for success, 0 for error
  message: string;
  message_code: number;
  data: Store[];
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    links: Array<{
      url: string | null;
      label: string;
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
    next: string | null;
    prev: string | null;
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

export interface StoreDetailsResponse {
  status: number; // 1 for success, 0 for error
  message: string;
  message_code: number;
  data: Store;
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

export interface PaginationMeta {
  current_page: number;
  from: number;
  last_page: number;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  path: string;
  per_page: number;
  to: number;
  total: number;
}
