export interface ProductDiscount {
  id: number;
  store_id: number;
  discount_name: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  maximum_order_amount: number | null;
  usage_coupon_limit_for_day: number | null;
  status: boolean;
  status_text: string;
  discount_type_text: string;
  formatted_discount_value: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProductDiscountRequest {
  discount_name: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  maximum_order_amount?: number | null;
  usage_coupon_limit_for_day?: number | null;
  status: boolean;
}

export interface UpdateProductDiscountRequest {
  discount_name?: string;
  discount_type?: 'percentage' | 'fixed';
  discount_value?: number;
  maximum_order_amount?: number | null;
  usage_coupon_limit_for_day?: number | null;
  status?: boolean;
}

// Admin API Response Structure
export interface ProductDiscountResponse {
  status: number; // 1 for success, 0 for error
  message: string;
  message_code: number;
  data: ProductDiscount[];
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

export interface ProductDiscountDetailsResponse {
  status: number; // 1 for success, 0 for error
  message: string;
  message_code: number;
  data: ProductDiscount;
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

// Simple product discount interface for dropdowns and selections
export interface SimpleProductDiscount {
  id: number;
  discount_name: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
}
