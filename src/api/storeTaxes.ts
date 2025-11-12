import api from '@/lib/axios';

export interface StoreTax {
  id: number;
  name: string;
  rate: number;
  is_excluded: number;
}

export const storeTaxesApi = {
  // Get all store taxes - Updated to use admin API
  getAll: async (): Promise<{ status: number; message: string; data: StoreTax[] }> => {
    const response = await api.get('/tax/store-taxes');
    return response.data;
  },
};
