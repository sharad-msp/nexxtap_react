export interface Tax {
  id: number;
  store_id: number;
  name: string;
  rate: number;
  status: boolean;
  is_excluded: number; // 0 = included, 1 = excluded
  status_text: string;
  tax_type_text: string;
  formatted_rate: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTaxRequest {
  name: string;
  rate: number;
  status: number; // 0 or 1
  is_excluded: number; // 0 or 1
}

export interface UpdateTaxRequest {
  name?: string;
  rate?: number;
  status?: number; // 0 or 1
  is_excluded?: number; // 0 or 1
}

// Admin API Response Structure
export interface TaxResponse {
  status: number; // 1 for success, 0 for error
  message: string;
  message_code: number;
  data: Tax[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
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

export interface TaxDetailsResponse {
  status: number; // 1 for success, 0 for error
  message: string;
  message_code: number;
  data: Tax;
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

// Simple tax interface for dropdowns and selections
export interface SimpleTax {
  id: number;
  name: string;
  rate: number;
  is_excluded: number;
}
