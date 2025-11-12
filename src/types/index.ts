// Auth types
export * from '@/types/auth.types';

// User types
export * from '@/types/user.types';

// Product types
export * from '@/types/product.types';

// Category types
export * from '@/types/category.types';

// Store types
export * from '@/types/store.types';

// Role types
export * from '@/types/role.types';

// Tax types
export * from '@/types/tax.types';

// Product Discount types
export * from '@/types/productDiscount.types';

// Order types
export * from '@/types/order.types';

// Global types
export interface ApiResponse<T = any> {
  status: number;
  message: string;
  data?: T;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
