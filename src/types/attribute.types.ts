export interface Attribute {
  id: number;
  name: string;
  allow_multiple: boolean;
  status: boolean;
  display_order?: number;
  created_at: string;
  updated_at: string;
  options?: AttributeOption[];
}

export interface AttributeOption {
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

export interface CreateAttributeRequest {
  name: string;
  status?: boolean;
  allow_multiple?: boolean;
  display_order?: number;
  options?: AttributeOption[];
}

export interface UpdateAttributeRequest {
  name?: string;
  status?: boolean;
  allow_multiple?: boolean;
  display_order?: number;
  options?: AttributeOption[];
  deleted_option_ids?: number[];
}

// Admin API Response Structure
export interface AttributeResponse {
  status: number;
  message: string;
  message_code: number;
  data: Attribute[];
  meta: PaginationMeta;
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

export interface AttributeDetailsResponse {
  status: number;
  message: string;
  message_code: number;
  data: Attribute;
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

