import { apiClient } from '@/lib/axios';
import {
  OrderListApiResponse,
  OrderResponse,
  OrderListRequest,
  OrderStatusUpdateRequest,
  OrderStatusUpdateResponse,
  OrderPaymentStatusUpdateRequest,
  OrderPaymentStatusUpdateResponse,
  SendSmsReceiptRequest,
  SendEmailReceiptRequest,
  ReceiptResponse,
  OrderStatisticsResponse,
  PdfReceiptResponse,
} from '@/types/order.types';

export const orderApi = {
  // Get all orders with filters
  getOrders: async (params: OrderListRequest = {}): Promise<OrderListApiResponse> => {
    const response = await apiClient.get('/order', { params });
    return response.data;
  },

  // Get a specific order by ID
  getOrder: async (id: number): Promise<OrderResponse> => {
    const response = await apiClient.get(`/order/${id}`);
    return response.data;
  },

  // Update order status
  updateOrderStatus: async (data: OrderStatusUpdateRequest): Promise<OrderStatusUpdateResponse> => {
    const response = await apiClient.post('/order/update-status', data);
    return response.data;
  },

  // Update order payment status
  updateOrderPaymentStatus: async (data: OrderPaymentStatusUpdateRequest): Promise<OrderPaymentStatusUpdateResponse> => {
    const response = await apiClient.post('/order/update-payment-status', data);
    return response.data;
  },

  // Send SMS receipt
  sendSmsReceipt: async (data: SendSmsReceiptRequest): Promise<ReceiptResponse> => {
    const response = await apiClient.post('/order/send-sms-receipt', data);
    return response.data;
  },

  // Send email receipt
  sendEmailReceipt: async (data: SendEmailReceiptRequest): Promise<ReceiptResponse> => {
    const response = await apiClient.post('/order/send-email-receipt', data);
    return response.data;
  },

  // Generate PDF receipt
  generateReceiptPdf: async (orderId: number): Promise<PdfReceiptResponse> => {
    const response = await apiClient.post('/order-generate-receipt-pdf', { order_id: orderId });
    return response.data.data;
  },

  // Download PDF receipt
  downloadReceiptPdf: async (orderId: number): Promise<PdfReceiptResponse> => {
    const response = await apiClient.get('/order-download-receipt-pdf', { 
      params: { order_id: orderId }
    });
    return response.data.data;
  },

  // Get order statistics
  getOrderStatistics: async (params?: { date_from?: string; date_to?: string }): Promise<OrderStatisticsResponse> => {
    const response = await apiClient.get('/order/statistics', { params });
    return response.data;
  },
};

export default orderApi;
