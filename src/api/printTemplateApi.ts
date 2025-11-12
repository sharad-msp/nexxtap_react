import { apiClient } from '@/lib/axios';

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

export const printTemplateApi = {
  // Get all print templates with filters
  getAll: async (params?: PrintTemplateFilters): Promise<PrintTemplateResponse> => {
    const response = await apiClient.get('/print-template', { params });
    return response.data;
  },

  // Get print template by ID
  getById: async (id: number): Promise<{ status: number; message: string; data: PrintTemplate }> => {
    const response = await apiClient.get(`/print-template/${id}`);
    return response.data;
  },

  // Create new print template
  create: async (data: PrintTemplateCreate): Promise<{ status: number; message: string; data: PrintTemplate }> => {
    const response = await apiClient.post('/print-template', data);
    return response.data;
  },

  // Update print template
  update: async (id: number, data: PrintTemplateUpdate): Promise<{ status: number; message: string; data: PrintTemplate }> => {
    const response = await apiClient.put(`/print-template/${id}`, data);
    return response.data;
  },

  // Delete print template
  delete: async (id: number): Promise<{ status: number; message: string }> => {
    const response = await apiClient.delete(`/print-template/${id}`);
    return response.data;
  },

  // Update print template status
  updateStatus: async (id: number, is_active: boolean): Promise<{ status: number; message: string; data: PrintTemplate }> => {
    const response = await apiClient.post(`/print-template/${id}/update-status`, { is_active });
    return response.data;
  },

  // Get template by slug with variable replacement
  getBySlug: async (slug: string, variables?: TemplateVariable): Promise<TemplateBySlugResponse> => {
    const response = await apiClient.get(`/print-template/slug/${slug}`, {
      params: variables ? { variables } : {}
    });
    return response.data;
  },

  // Get template by slug with real order data
  getBySlugWithOrderData: async (slug: string, orderId: number): Promise<TemplateBySlugResponse> => {
    const response = await apiClient.get(`/print-template/slug/${slug}/order-data`, {
      params: { order_id: orderId }
    });
    return response.data;
  },

  // Get available template variables
  getTemplateVariables: async (): Promise<{ status: number; message: string; data: TemplateVariable }> => {
    const response = await apiClient.get('/print-template-variables');
    return response.data;
  }
};
