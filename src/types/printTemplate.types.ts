export interface PrintTemplate {
  id: number;
  slug: string;
  content: string;
  type: number;
  name?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  type_name?: string;
}

export interface PrintTemplateCreate {
  name: string;
  slug?: string;
  content: string;
  type: number;
  description?: string;
  is_active?: boolean;
}

export interface PrintTemplateUpdate {
  name?: string;
  slug?: string;
  content?: string;
  type?: number;
  description?: string;
  is_active?: boolean;
}

export interface PrintTemplateFilters {
  search?: string;
  type?: number;
  status?: boolean;
  page?: number;
  per_page?: number;
}

export interface PrintTemplateResponse {
  status: number;
  message: string;
  data: PrintTemplate[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}

export interface TemplateVariable {
  [key: string]: string;
}

export interface TemplateBySlugResponse {
  status: number;
  message: string;
  data: {
    id: number;
    slug: string;
    name: string;
    type: number;
    type_name: string;
    content: string;
    original_content: string;
  };
}

export const PRINT_TEMPLATE_TYPES = {
  POS: 1,
  KDS: 2
} as const;

export const PRINT_TEMPLATE_TYPE_LABELS = {
  [PRINT_TEMPLATE_TYPES.POS]: 'POS',
  [PRINT_TEMPLATE_TYPES.KDS]: 'KDS'
} as const;
