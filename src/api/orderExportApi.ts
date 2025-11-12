import { apiClient } from '@/api/index';

// Export Response Interface
export interface ExportResponse {
  filename: string;
  file_url: string;
  total_orders: number;
  exported_at: string;
  filters_applied: {
    search?: string;
    date_from?: string;
    date_to?: string;
    status?: string;
    filterByStatus?: string;
  };
}

// Export Options Interface
export interface ExportOptions {
  search?: string;
  date_from?: string;
  date_to?: string;
  status?: string;
  filterByStatus?: string;
}

export const orderExportApi = {
  // Export orders to CSV
  async exportOrders(options: ExportOptions = {}): Promise<{ status: number; message: string; data: ExportResponse }> {
    const response = await apiClient.post('/order/export', options);
    return response.data;
  },

  // Download exported CSV file
  async downloadExport(filename: string): Promise<Blob> {
    const response = await apiClient.get('/order/export/download', {
      params: { filename },
      responseType: 'blob'
    });
    return response.data;
  }
};
