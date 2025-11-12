import api from '@/lib/axios';

// Laravel API Response Format
export interface LaravelApiResponse<T = any> {
  status: number; // 1 for success, 0 for error
  message: string;
  message_code: number;
  data: T;
}

// Import Response Interface
export interface ImportResponse {
  import_id: number;
  total_rows: number;
  success_count: number;
  error_count: number;
  errors?: string[];
  warnings?: string[];
  created_categories?: string[];
  completed_at: string;
  import_status: 'complete_success' | 'partial_success' | 'complete_failure';
  missing_categories?: string[];
}

// Template Response Interface
export interface TemplateResponse {
  csv_content: string;
  headers: string[];
  sample_data: string[][];
  instructions: string[];
}

// Import History Item Interface
export interface ImportHistoryItem {
  id: number;
  import_type: 'category' | 'product';
  file_name: string;
  file_size: number;
  status: 'processing' | 'completed' | 'failed' | 'rolled_back';
  total_rows: number;
  success_count: number;
  error_count: number;
  error_details: string | null;
  started_at: string;
  completed_at: string | null;
  rolled_back_at: string | null;
  created_at: string;
}

// Import History Response Interface
export interface ImportHistoryResponse {
  data: ImportHistoryItem[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// Import Status Response Interface
export interface ImportStatusResponse {
  import_id: number;
  status: string;
  import_type: string;
  file_name: string;
  total_rows: number;
  success_count: number;
  error_count: number;
  started_at: string;
  completed_at: string | null;
  error_details: any;
  progress_percentage: number;
}

export const csvImportApi = {
  // Import categories from CSV
  async importCategories(file: File): Promise<LaravelApiResponse<ImportResponse>> {
    const formData = new FormData();
    formData.append('csv_file', file);
    
    const response = await api.post('/csv-import/category', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  // Import products from CSV with enhanced options
  async importProducts(file: File, options: {
    autoCreateCategories?: boolean;
    handleDuplicates?: 'skip' | 'update' | 'error';
  } = {}): Promise<LaravelApiResponse<ImportResponse>> {
    const formData = new FormData();
    formData.append('csv_file', file);
    formData.append('auto_create_categories', options.autoCreateCategories ?? true);
    formData.append('handle_duplicates', options.handleDuplicates ?? 'update');
    
    const response = await api.post('/csv-import/product', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  // Download category CSV template
  async downloadCategoryTemplate(): Promise<LaravelApiResponse<TemplateResponse>> {
    const response = await api.get('/csv-import/category/template');
    return response.data;
  },

  // Download product CSV template
  async downloadProductTemplate(): Promise<LaravelApiResponse<TemplateResponse>> {
    const response = await api.get('/csv-import/product/template');
    return response.data;
  },

  // Get category import history
  async getCategoryImportHistory(): Promise<LaravelApiResponse<ImportHistoryResponse>> {
    const response = await api.get('/csv-import/category/import-history');
    return response.data;
  },

  // Get product import history
  async getProductImportHistory(): Promise<LaravelApiResponse<ImportHistoryResponse>> {
    const response = await api.get('/csv-import/product/import-history');
    return response.data;
  },

  // Get all import history
  async getAllImportHistory(): Promise<LaravelApiResponse<ImportHistoryResponse>> {
    const response = await api.get('/csv-import/import-history');
    return response.data;
  },

  // Rollback a specific import
  async rollbackImport(importId: number): Promise<LaravelApiResponse<{ import_id: number; rolled_back_at: string }>> {
    const response = await api.post(`/csv-import/rollback/${importId}`);
    return response.data;
  },

  // Get import status
  async getImportStatus(importId: number): Promise<LaravelApiResponse<ImportStatusResponse>> {
    const response = await api.get(`/csv-import/import-status/${importId}`);
    return response.data;
  },
};
