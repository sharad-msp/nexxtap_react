import { apiWithLoading } from '@/lib/axios';

export interface Printer {
  id: number;
  store_id: number;
  name: string;
  model_id?: string;
  full_details?: any;
  status: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePrinterRequest {
  name: string;
  model_id?: string;
  full_details?: any;
  is_default?: boolean;
}

export interface UpdatePrinterRequest {
  name: string;
  model_id?: string;
  full_details?: any;
  is_default?: boolean;
}

export interface PrinterResponse {
  status: number;
  message: string;
  data: Printer[];
  meta?: any;
}

export interface PrinterDetailsResponse {
  status: number;
  message: string;
  data: Printer;
}

export interface PrinterStatsResponse {
  status: number;
  message: string;
  data: {
    total_printers: number;
    active_printers: number;
    inactive_printers: number;
    default_printer: Printer | null;
  };
}

export const printerApi = {
  // Get all printers for the current store
  getAll: async (): Promise<PrinterResponse> => {
    const response = await apiWithLoading.get('/printers');
    return response.data;
  },

  // Get active printers for the current store
  getActive: async (): Promise<PrinterResponse> => {
    const response = await apiWithLoading.get('/printers/active');
    return response.data;
  },

  // Get default printer for the current store
  getDefault: async (): Promise<PrinterDetailsResponse> => {
    const response = await apiWithLoading.get('/printers/default');
    return response.data;
  },

  // Create a new printer
  create: async (data: CreatePrinterRequest): Promise<PrinterDetailsResponse> => {
    const response = await apiWithLoading.post('/printers', data);
    return response.data;
  },

  // Update a printer
  update: async (id: number, data: UpdatePrinterRequest): Promise<PrinterDetailsResponse> => {
    const response = await apiWithLoading.put(`/printers/${id}`, data);
    return response.data;
  },

  // Set printer as default
  setDefault: async (id: number): Promise<PrinterDetailsResponse> => {
    const response = await apiWithLoading.post(`/printers/${id}/set-default`);
    return response.data;
  },

  // Delete a printer
  delete: async (id: number): Promise<{ status: number; message: string }> => {
    const response = await apiWithLoading.delete(`/printers/${id}`);
    return response.data;
  },

  // Update printer status (Store Admin only)
  updateStatus: async (printerId: number, status: boolean): Promise<PrinterDetailsResponse> => {
    const response = await apiWithLoading.post(`/printers/${printerId}/update-status`, { status });
    return response.data;
  },

  // Get printer statistics for authenticated user's store (Store Admin only)
  getStats: async (): Promise<PrinterStatsResponse> => {
    const response = await apiWithLoading.get(`/printers/stats/overview`);
    return response.data;
  },

  // Get all printers for authenticated user's store (Store Admin only)
  getStorePrinters: async (): Promise<PrinterResponse> => {
    const response = await apiWithLoading.get(`/printers`);
    return response.data;
  },

  // Get printer details (Store Admin only)
  getStorePrinterDetails: async (printerId: number): Promise<PrinterDetailsResponse> => {
    const response = await apiWithLoading.get(`/printers/${printerId}`);
    return response.data;
  },
};
