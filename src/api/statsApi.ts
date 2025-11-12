import api, { apiWithLoading } from '@/lib/axios';

export interface DashboardStatsResponse {
  status: number;
  message: string;
  message_code: number;
  data: {
    users: {
      total: number;
      active: number;
      inactive: number;
      growth: number;
    };
    stores: {
      total: number;
      active: number;
      inactive: number;
      growth: number;
    };
    products: {
      total: number;
      active: number;
      inactive: number;
      growth: number;
    };
    categories: {
      total: number;
      active: number;
      inactive: number;
      growth: number;
    };
    roles: {
      total: number;
      active: number;
      inactive: number;
      growth: number;
    };
    promocodes?: {
      total: number;
      active: number;
      inactive: number;
      growth: number;
    };
    discounts?: {
      total: number;
      active: number;
      inactive: number;
      growth: number;
    };
    orders?: {
      total: number;
      growth: number;
    };
    revenue?: {
      total: number;
      growth: number;
    };
  };
  admin_permissions?: any;
}


export interface StoreDashboardResponse {
  status: number;
  message: string;
  data: {
    filter: string;
    date_range: {
      start: string;
      end: string;
    };
    metrics: {
      settled: {
        value: string;
        raw_value: number;
        growth: number | null;
        subtitle: string;
      };
      total_sales: {
        value: string;
        raw_value: number;
        growth: number;
        subtitle: string;
      };
      transactions: {
        value: string;
        raw_value: number;
        growth: number;
        subtitle: string;
      };
      average_order: {
        value: string;
        raw_value: number;
        growth: number;
        subtitle: string;
      };
      net_sales: {
        value: string;
        raw_value: number;
        subtitle: string;
      };
      refunds: {
        value: string;
        raw_value: number;
        count: number;
        subtitle: string;
      };
      card_sales: {
        value: string;
        raw_value: number;
        count: number;
        subtitle: string;
      };
      cash_sales: {
        value: string;
        raw_value: number;
        count: number;
        subtitle: string;
      };
    };
    recent_orders: Array<{
      id: string;
      order_id: number;
      customer: string;
      customer_email?: string;
      items: number;
      amount: string;
      payment: string;
      payment_status?: string;
      device: string;
      status: string | number;
      time: string;
    }>;
    last_updated: string;
  };
}

export interface ChartDataResponse {
  status: number;
  message: string;
  data: {
    data: Array<{
      label: string;
      value: number;
      name?: string;
    }>;
  };
}

export const statsApi = {
  // Single endpoint for dashboard statistics (automatically detects user role) - with enhanced deduplication
  getDashboardStats: async (): Promise<DashboardStatsResponse> => {
    try {
      const response = await apiWithLoading.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Get system stats (for system admin) - with enhanced deduplication
  getSystemStats: async (): Promise<DashboardStatsResponse> => {
    try {
      const response = await apiWithLoading.get('/dashboard/system-admin-stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching system stats:', error);
      throw error;
    }
  },

  // Get store stats (for store admin) - with enhanced deduplication
  getStoreStats: async (): Promise<DashboardStatsResponse> => {
    try {
      const response = await apiWithLoading.get('/dashboard/store-admin-stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching store stats:', error);
      throw error;
    }
  },

  // Get stats based on user role (legacy method - now uses unified endpoint) - with enhanced deduplication
  getStatsByRole: async (): Promise<DashboardStatsResponse> => {
    try {
      // Use the unified endpoint which automatically detects user role
      const response = await apiWithLoading.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching stats by role:', error);
      throw error;
    }
  },

  // Get comprehensive store dashboard with filters
  getStoreDashboard: async (filter: string = '1D', startDate?: string, endDate?: string): Promise<StoreDashboardResponse> => {
    try {
      const params: Record<string, string> = { filter };
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      
      const response = await api.get('/dashboard/store', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching store dashboard:', error);
      throw error;
    }
  },

  // Get chart data (total reads, sales by product, sales by device)
  getChartData: async (type: 'reads' | 'sales_product' | 'sales_device' | 'total_read_chart' | 'sales_amount_chart', filter: string = '1D'): Promise<ChartDataResponse> => {
    try {
      const response = await api.get('/dashboard/charts', {
        params: { type, filter, current_time: new Date().toISOString() }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching chart data:', error);
      throw error;
    }
  },
};
