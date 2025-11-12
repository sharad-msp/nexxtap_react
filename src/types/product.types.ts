export interface ProductOptionValue {
  id?: number;
  category_attribute_id: number;
  value: string;
  price_modifier: number;
  display_order: number;
}

export interface ProductCategoryAttribute {
  id: number;
  name: string;
  allow_multiple: boolean;
  product_option_values?: ProductOptionValue[];
  preset_options?: {
    id: number;
    value: string;
    price_modifier: number;
    display_order: number;
  }[];
}

export interface AttributeOptionValues {
  id: number;
  name: string;
  allow_multiple: boolean;
  values?: {
    id: number;
    value: string;
    price_modifier: string;
    display_order: number;
  }[];
}


export interface ProductTax {
  id: number;
  name: string;
  rate: number;
  is_excluded: number;
  status: boolean;
  tax_type_text: string;
  formatted_rate: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  base_price: number;
  category_id: number;
  category: {
    id: number;
    name: string;
    status: number; // 1 for active, 0 for inactive
  };
  store_id: number;
  tax_type?: number;
  tax_type_text?: string;
  tax?: any;
  is_gst_applicable?: boolean;
  gst_name?: string;
  gst_rate?: number;
  image?: string;
  image_url?: string;
  slug: string;
  status: boolean; // AdminProductResource casts this to boolean
  status_text?: string;
  product_option_values?: ProductOptionValue[];
  options?: any[];
  taxes?: ProductTax[];
  selected_tax_ids?: number[];
  created_at: string;
  updated_at: string;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  base_price: number;
  category_id: number;
  status?: number; // 1 for active, 0 for inactive
  image?: File;
  tax_ids?: number[];
  option_values?: ProductOptionValue[];
}

export interface UpdateProductRequest {
  id?: number;
  name?: string;
  description?: string;
  base_price?: number;
  category_id?: number;
  status?: number; // 1 for active, 0 for inactive
  image?: File;
  tax_ids?: number[];
  option_values?: ProductOptionValue[];
  deleted_ids?: number[];
}

// Admin API Response Structure - Updated to use number status
export interface ProductResponse {
  status: number; // 1 for success, 0 for error
  message: string;
  message_code: number;
  data: {
    data: Product[];
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

export interface ProductDetailsResponse {
  status: number; // 1 for success, 0 for error
  message: string;
  message_code: number;
  data: Product;
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

export interface CategoryAttributesResponse {
  status: number;
  message: string;
  message_code: number;
  data: ProductCategoryAttribute[];
}
