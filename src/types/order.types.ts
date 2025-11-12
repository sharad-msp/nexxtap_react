export interface OrderItemOption {
  id: number;
  order_item_id: number;
  category_attribute_id: number;
  product_option_value_id: number;
  category_attribute?: {
    id: number;
    name: string;
  };
  product_option_value?: {
    id: number;
    value: string;
  };
  created_at: string;
  updated_at: string;
}

export interface OrderItemTax {
  id: number;
  tax_id: number;
  name: string;
  rate: number;
  is_excluded: number;
  tax_amount: number | string;
  current_tax?: {
    id: number;
    name: string;
    rate: number;
    is_excluded: number;
  };
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  base_price: number;
  total_price: number;
  notes?: string;
  product?: {
    id: number;
    name: string;
    category_id: number;
    store_id: number;
    base_price: number;
    description?: string;
    image?: string;
    status: number;
    status_text: string;
    slug: string;
    created_at: string;
    updated_at: string;
  };
  order_item_options?: OrderItemOption[];
  order_item_taxes?: OrderItemTax[];
  created_at: string;
  updated_at: string;
}

export interface OrderPayment {
  id: number;
  order_id: number;
  payment_method: number;
  payment_method_text: string;
  amount: number;
  reference_number?: string;
  notes?: string;
  paid_at: string;
  created_at: string;
  updated_at: string;
}

export interface OrderCustomAmount {
  id: number;
  amount: number;
  description?: string;
  created_at: string;
}

export interface Order {
  id: number;
  store_id: number;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  user_id: number;
  order_no: string;
  order_name?: string;
  total_amount: number;
  subtotal_amount: number;
  discount_amount: number;
  tax_amount: number;
  status: number; // 0: Pending, 1: In Progress, 2: Completed, 3: Cancelled
  status_text?: string;
  payment_status?: string; // 'paid', 'partially_paid', 'saved'
  payment_status_text?: string;
  notes?: string;
  is_split_payment: boolean;
  split_into_portions?: number;
  custom_amounts?: OrderCustomAmount[];
  discount_name?: string;
  discount_type?: string;
  discount_value?: number;
  saved_at?: string;
  completed_at?: string;
  started_at?: string;
  recalled_at?: string;
  kds_notes?: string;
  kds_user_ids?: string;
  device_id?: string;
  device_name?: string;
  device_model?: string;
  user?: {
    id: number;
    name: string;
    email: string;
    profile_image?: string;
    status: number;
    status_text: string;
    store_id: number;
    is_store_admin: number;
    created_at: string;
    updated_at: string;
  };
  order_items?: OrderItem[];
  order_payments?: OrderPayment[];
  split_amounts?: OrderSplitAmount[];
  total_paid?: number;
  remaining_balance?: number;
  is_fully_paid?: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrderSplitAmount {
  id: number;
  order_id: number;
  split_amount: number;
  split_portion: number;
  total_splits: number;
  remaining_amount: number;
  split_reason?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  created_by_user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface OrderListResponse {
  data: Order[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface OrderStatistics {
  total_orders: number;
  total_revenue: number;
  total_pending: number;
  total_in_progress: number;
  total_completed: number;
  total_cancelled: number;
  average_order_value: number;
  total_discounts: number;
  total_tax: number;
  split_payment_orders: number;
}

export interface OrderFilters {
  status?: string;
  filterByStatus?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
  per_page?: number;
  current_page?: number;
}

export interface OrderStatusUpdateRequest {
  id: number;
  status: number;
}

export interface OrderStatusUpdateResponse {
  status: number;
  message: string;
  message_code: number;
  data?: Order;
}

export interface OrderPaymentStatusUpdateRequest {
  id: number;
  payment_status: 'saved' | 'partially_paid' | 'paid';
}

export interface OrderPaymentStatusUpdateResponse {
  status: number;
  message: string;
  message_code: number;
  data?: Order;
}

export interface SendSmsReceiptRequest {
  order_id: number;
  phone_number: string;
  include_pdf_link?: boolean;
}

export interface SendEmailReceiptRequest {
  order_id: number;
  email: string;
  include_pdf_attachment?: boolean;
}

export interface ReceiptResponse {
  status: number;
  message: string;
  message_code: number;
  data?: {
    message_id?: string;
  };
}

export interface OrderStatisticsResponse {
  status: number;
  message: string;
  message_code: number;
  data: OrderStatistics;
}

export interface OrderListRequest {
  status?: string;
  filterByStatus?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
  per_page?: number;
  current_page?: number;
}

export interface OrderResponse {
  status: number;
  message: string;
  message_code: number;
  data: Order;
}

export interface OrderListApiResponse {
  status: number;
  message: string;
  message_code: number;
  data: Order[];
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
}

// PDF Receipt Response Types
export interface PdfReceiptResponse {
  pdf_url: string;
  filename: string;
  file_size: number;
  download_url: string;
}
