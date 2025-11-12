import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Eye, 
  Search,
  RefreshCw,
  Download
} from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  Button, 
  Input, 
  SelectField, 
  Table, 
  Badge, 
  useToast
} from '@/components';
import { useOrders } from '@/hooks/useOrders';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDateTime } from '@/utils/formatDate';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Order } from '@/types/order.types';
import { orderExportApi } from '@/api/orderExportApi';

const OrderList: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  usePageTitle({ title: 'Orders Management' });
  
  const {
    orders,
    totalOrders,
    currentPage,
    lastPage,
    perPage,
    ordersLoading,
    statistics,
    updateFilters,
    changePage,
    changePerPage,
    loadStatistics,
    clearFilters,
  } = useOrders();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Load statistics on component mount
  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  // Apply filters when they change
  useEffect(() => {
    const filters: any = {};
    if (debouncedSearchTerm) filters.search = debouncedSearchTerm;
    if (statusFilter && statusFilter !== 'all') filters.status = statusFilter;
    if (paymentStatusFilter && paymentStatusFilter !== 'all') filters.filterByStatus = paymentStatusFilter;
    if (dateFrom) filters.date_from = dateFrom;
    if (dateTo) filters.date_to = dateTo;
    
    updateFilters(filters);
  }, [debouncedSearchTerm, statusFilter, paymentStatusFilter, dateFrom, dateTo, updateFilters]);

  const getStatusBadge = (status: number) => {
    const statusMap = {
      0: { label: 'Pending', variant: 'warning' },
      1: { label: 'In Progress', variant: 'info' },
      2: { label: 'Completed', variant: 'success' },
      3: { label: 'Cancelled', variant: 'destructive' },
    };
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: 'Unknown', variant: 'default' };
    return <Badge variant={statusInfo.variant as any}>{statusInfo.label}</Badge>;
  };

  const getPaymentStatusBadge = (paymentStatus?: string) => {
    const statusMap = {
      'paid': { label: 'Paid', variant: 'success' },
      'partially_paid': { label: 'Partially Paid', variant: 'warning' },
      'saved': { label: 'Saved', variant: 'default' },
    };
    const statusInfo = statusMap[paymentStatus as keyof typeof statusMap] || { label: 'Unknown', variant: 'default' };
    return <Badge variant={statusInfo.variant as any}>{statusInfo.label}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Using centralized formatDateTime from utils

  const columns = [
    {
      key: 'order_no',
      header: 'Order #',
      render: (order: Order) => (
        <span className="font-medium text-gray-900">{order.order_no}</span>
      ),
    },
    {
      key: 'customer_name',
      header: 'Customer',
      render: (order: Order) => (
        <div>
          <div className="font-medium text-gray-900">
            {order.customer_name || order.user?.name || 'Walk-in Customer'}
          </div>
          {order.customer_email && (
            <div className="text-sm text-gray-500">{order.customer_email}</div>
          )}
        </div>
      ),
    },
    {
      key: 'total_amount',
      header: 'Total',
      render: (order: Order) => (
        <span className="font-medium text-gray-900">{formatCurrency(order.total_amount)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (order: Order) => getStatusBadge(order.status),
    },
    {
      key: 'payment_status',
      header: 'Payment',
      render: (order: Order) => getPaymentStatusBadge(order.payment_status),
    },
    {
      key: 'created_at',
      header: 'Date',
      render: (order: Order) => (
        <span className="text-sm text-gray-500">{formatDateTime(order.created_at)}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '15%',
      render: (order: Order) => (
        <div className="flex items-center gap-1 overflow-x-auto">
          <Button
            onClick={() => handleViewOrder(order)}
            variant="outline"
            size="sm"
            leftIcon={<Eye className="h-4 w-4" />}
            className="whitespace-nowrap"
            title="View Order"
          >
            <span className="hidden sm:inline">View</span>
          </Button>
        </div>
      ),
    },
  ];

  const handlePageChange = (page: number) => {
    changePage(page);
  };

  const handlePerPageChange = (newPerPage: number) => {
    changePerPage(newPerPage);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPaymentStatusFilter('all');
    setDateFrom('');
    setDateTo('');
    // Call the hook's clearFilters to reset the backend filters
    clearFilters();
  };

  const handleRefresh = () => {
    // Force refresh by calling fetchOrders with current filters
    const currentFilters = {
      search: debouncedSearchTerm,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      filterByStatus: paymentStatusFilter !== 'all' ? paymentStatusFilter : undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    };
    
    // Remove undefined values
    const cleanFilters = Object.fromEntries(
      Object.entries(currentFilters).filter(([_, value]) => value !== undefined)
    );
    
    updateFilters(cleanFilters);
  };

  // Handle order actions
  const handleViewOrder = useCallback((order: Order) => {
    navigate(`/orders/view/${order.id}`);
  }, [navigate]);


  const handleExportOrders = useCallback(async () => {
    setIsExporting(true);
    
    try {
      // Prepare export options based on current filters
      const exportOptions = {
        search: debouncedSearchTerm || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        status: statusFilter || undefined,
        filterByStatus: paymentStatusFilter || undefined,
      };

      // Call export API
      const response = await orderExportApi.exportOrders(exportOptions);
      
      if (response.status === 1) {
        // Download the file
        const blob = await orderExportApi.downloadExport(response.data.filename);
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = response.data.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        showToast('success', `Successfully exported ${response.data.total_orders} orders`);
      } else {
        throw new Error(response.message || 'Export failed');
      }

    } catch (error: any) {
      console.error('Export error:', error);
      showToast('error', error.message || 'Failed to export orders');
    } finally {
      setIsExporting(false);
    }
  }, [debouncedSearchTerm, dateFrom, dateTo, statusFilter, paymentStatusFilter, showToast]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600 mt-1">Manage all orders and their status</p>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.total_orders}</p>
                </div>
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(statistics.total_revenue)}</p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.total_pending}</p>
                </div>
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(statistics.average_order_value)}</p>
                </div>
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Filters</h2>
              {/* Active Filters Indicator */}
              {(searchTerm || statusFilter || paymentStatusFilter || dateFrom || dateTo) && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {searchTerm && (
                    <Badge variant="info" className="text-xs">
                      Search: "{searchTerm}"
                    </Badge>
                  )}
                  {statusFilter && statusFilter !== 'all' && (
                    <Badge variant="info" className="text-xs">
                      Status: {statusFilter === '0' ? 'Pending' : statusFilter === '1' ? 'In Progress' : statusFilter === '2' ? 'Completed' : 'Cancelled'}
                    </Badge>
                  )}
                  {paymentStatusFilter && paymentStatusFilter !== 'all' && (
                    <Badge variant="info" className="text-xs">
                      Payment: {paymentStatusFilter === 'paid' ? 'Paid' : paymentStatusFilter === 'partially_paid' ? 'Partially Paid' : 'Saved'}
                    </Badge>
                  )}
                  {dateFrom && (
                    <Badge variant="info" className="text-xs">
                      From: {dateFrom}
                    </Badge>
                  )}
                  {dateTo && (
                    <Badge variant="info" className="text-xs">
                      To: {dateTo}
                    </Badge>
                  )}
                </div>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              leftIcon={<RefreshCw className="h-4 w-4" />}
            >
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Global Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Global Search</label>
              <Input
                type="text"
                placeholder="Search orders by order number, customer name, email, or phone..."
                value={searchTerm}
                onChange={(value) => setSearchTerm(value)}
                leftIcon={<Search className="h-4 w-4" />}
                className="w-full"
              />
            </div>
            
            {/* Filter Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order Status</label>
                <SelectField
                  value={statusFilter}
                  onChange={(value) => setStatusFilter(value)}
                  placeholder="Select status"
                  options={[
                    { value: 'all', label: 'All' },
                    { value: '0', label: 'Pending' },
                    { value: '1', label: 'In Progress' },
                    { value: '2', label: 'Completed' },
                    { value: '3', label: 'Cancelled' },
                  ]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                <SelectField
                  value={paymentStatusFilter}
                  onChange={(value) => setPaymentStatusFilter(value)}
                  placeholder="Select payment status"
                  options={[
                    { value: 'all', label: 'All' },
                    { value: 'paid', label: 'Paid' },
                    { value: 'partially_paid', label: 'Partially Paid' },
                    { value: 'saved', label: 'Saved' },
                  ]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(value) => setDateFrom(value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(value) => setDateTo(value)}
                />
              </div>

              <div className="flex items-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={handleClearFilters}
                  className="whitespace-nowrap"
                >
                  Clear Filters
                </Button>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={handleExportOrders}
                  leftIcon={<Download className="h-4 w-4" />}
                  disabled={isExporting}
                  className="whitespace-nowrap"
                >
                  {isExporting ? 'Exporting...' : 'Export CSV'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Orders</h2>
            <div className="text-sm text-gray-500">
              {totalOrders} orders found
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table
            data={orders}
            columns={columns}
            loading={ordersLoading}
            emptyMessage="No orders found"
          />
              
          {/* Pagination */}
          {lastPage > 1 && (
            <div className="flex justify-between items-center mt-6">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">Show</span>
                <SelectField
                  value={perPage}
                  onChange={(value) => handlePerPageChange(Number(value))}
                  className="w-20"
                  options={[
                    { value: 10, label: '10' },
                    { value: 25, label: '25' },
                    { value: 50, label: '50' },
                    { value: 100, label: '100' },
                  ]}
                />
                <span className="text-sm text-gray-700">entries</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Previous
                </Button>
                
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {lastPage}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === lastPage}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>


    </div>
  );
};

export default OrderList;
