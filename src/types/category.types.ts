export interface Category {
  id: number;
  name: string;
  status: boolean;
  created_at: string;
  updated_at: string;
  category_attributes?: CategoryAttribute[];
}

export interface CategoryAttribute {
  id?: number;
  name: string;
  allow_multiple: boolean;
  status?: number | boolean;
  options?: CategoryAttributeOption[];
}

export interface CategoryAttributeOption {
  id?: number;
  value: string;
  price_modifier: number;
  display_order: number;
  status: number | boolean;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface CreateCategoryRequest {
  name: string;
  status?: boolean;
  attributes?: CategoryAttribute[];
}

export interface UpdateCategoryRequest {
  name?: string;
  status?: boolean;
  attributes?: CategoryAttribute[];
  deleted_ids?: number[];
  deleted_option_ids?: number[];
}

// Admin API Response Structure - Updated to use number status
export interface CategoryResponse {
  status: number; // 1 for success, 0 for error
  message: string;
  message_code: number;
  data: Category[]; // Direct array of categories
  meta: PaginationMeta; // Pagination metadata
  links?: {
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

export interface CategoryDetailsResponse {
  status: number; // 1 for success, 0 for error
  message: string;
  message_code: number;
  data: Category;
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
