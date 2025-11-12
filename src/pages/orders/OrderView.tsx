import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, DollarSign, User, Calendar, CreditCard, ShoppingCart, Receipt, Smartphone, Split, Clock, Users, Monitor, History, ChevronDown, ChevronRight, Eye, ExternalLink, Calculator } from 'lucide-react';
import { Card, CardHeader, CardContent, Button, Badge, LoadingSpinner, ReceiptManager, Modal, TaxDetailsModal } from '@/components';
import { orderApi } from '@/api/orderApi';
import { formatDateTime } from '@/utils/formatDate';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Order, OrderItem } from '@/types/order.types';
import { ViewDetailsSkeleton } from '@/components/Skeleton/ViewDetails';
const OrderView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updatePaymentLoading, setUpdatePaymentLoading] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  
  usePageTitle({ title: 'View Order' });
  
  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState({
    orderInfo: true,
    customerInfo: false,
    posUserInfo: false,
    deviceInfo: false,
    kdsInfo: false,
    paymentInfo: false,
    splitPayments: false,
    timeline: true
  });
  
  // Modal states
  const [splitPaymentsModalOpen, setSplitPaymentsModalOpen] = useState(false);
  const [timelineModalOpen, setTimelineModalOpen] = useState(false);
  const [orderItemsModalOpen, setOrderItemsModalOpen] = useState(false);
  const [taxDetailsModalOpen, setTaxDetailsModalOpen] = useState(false);
  const [selectedItemForTax, setSelectedItemForTax] = useState<OrderItem | null>(null);

  useEffect(() => {
    // console.log('OrderView mounted with id:', id);
    if (id) {
      fetchOrder(parseInt(id));
    }
    document.title = 'Order Details';
  }, [id]);

  const fetchOrder = async (orderId: number) => {
    // console.log('Fetching order with ID:', orderId);
    setLoading(true);
    try {
      const response = await orderApi.getOrder(orderId);
      // console.log('Order API response:', response);
      if (response?.status === 1 && response?.data) {
        setOrder(response.data);
      } else {
        throw new Error('Failed to fetch order');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      // Navigate back to orders list on error
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: number) => {
    if (!order) return;
    
    setUpdateLoading(true);
    try {
      const response = await orderApi.updateOrderStatus({ id: order.id, status: newStatus });
      if (response?.status === 1) {
        // Refresh the order data
        await fetchOrder(order.id);
      } else {
        throw new Error('Failed to update order status');
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handlePaymentStatusUpdate = async (newPaymentStatus: 'saved' | 'partially_paid' | 'paid') => {
    if (!order) return;
    
    setUpdatePaymentLoading(true);
    try {
      const response = await orderApi.updateOrderPaymentStatus({ id: order.id, payment_status: newPaymentStatus });
      if (response?.status === 1) {
        // Refresh the order data
        await fetchOrder(order.id);
      } else {
        throw new Error('Failed to update payment status');
      }
    } catch (error) {
      console.error('Failed to update payment status:', error);
    } finally {
      setUpdatePaymentLoading(false);
    }
  };

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

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(numAmount);
  };

  const calculateItemTaxAmount = (item: OrderItem) => {
    if (!item.order_item_taxes || item.order_item_taxes.length === 0) return 0;
    
    // Show only the actual tax amounts that were applied when the order was created
    return item.order_item_taxes.reduce((sum, tax) => {
      return sum + (typeof tax.tax_amount === 'string' ? parseFloat(tax.tax_amount) : tax.tax_amount || 0);
    }, 0);
  };

  const getKdsUserIds = () => {
    if (!order?.kds_user_ids) return [];
    return order.kds_user_ids.split(',').map(id => id.trim()).filter(id => id);
  };

  const getOrderTimeline = () => {
    if (!order) return [];
    const timeline = [];
    
    // Order created
    timeline.push({
      event: 'Order Created',
      timestamp: order.created_at,
      status: 'created',
      description: `Order #${order.order_no} was created`,
      user: order.user?.name || 'System'
    });

    // Order started
    if (order.started_at) {
      timeline.push({
        event: 'Order Started',
        timestamp: order.started_at,
        status: 'started',
        description: 'Order processing began',
        user: 'KDS System'
      });
    }

    // Order completed
    if (order.completed_at) {
      timeline.push({
        event: 'Order Completed',
        timestamp: order.completed_at,
        status: 'completed',
        description: 'Order was completed',
        user: 'KDS System'
      });
    }

    // Order recalled
    if (order.recalled_at) {
      timeline.push({
        event: 'Order Recalled',
        timestamp: order.recalled_at,
        status: 'recalled',
        description: 'Order was recalled for modifications',
        user: 'KDS System'
      });
    }

    // Sort by timestamp
    return timeline.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleViewTaxDetails = (item: OrderItem) => {
    setSelectedItemForTax(item);
    setTaxDetailsModalOpen(true);
  };

  // Using centralized formatDateTime from utils

  if (loading) {
    return (
        <ViewDetailsSkeleton />
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Order not found</p>
        <Button onClick={() => navigate('/orders')} className="mt-4">
          Back to Orders
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/orders')}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order #{order.order_no}</h1>
            <p className="text-gray-600">Order Details</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setReceiptModalOpen(true)}
            leftIcon={<Receipt className="h-4 w-4" />}
          >
            Manage Receipt
          </Button>
        </div>
        <div className="flex space-x-2">
          {getStatusBadge(order.status)}
          {getPaymentStatusBadge(order.payment_status)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Order Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Information */}
          <Card>
            <CardHeader>
              <div 
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleSection('orderInfo')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Package className="h-5 w-5 text-indigo-600" />
                    <h2 className="text-xl font-semibold">Order Information</h2>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-2">
                      {getStatusBadge(order.status)}
                      {getPaymentStatusBadge(order.payment_status)}
                    </div>
                    {expandedSections.orderInfo ? (
                      <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-500 transition-transform duration-200" />
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            {expandedSections.orderInfo && (
              <CardContent className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Order Number</label>
                    <p className="mt-1 text-sm text-gray-900 font-mono">{order.order_no}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Created Date</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDateTime(order.created_at)}</p>
                  </div>
                  {order.started_at && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Started Date</label>
                      <p className="mt-1 text-sm text-gray-900">{formatDateTime(order.started_at)}</p>
                    </div>
                  )}
                  {order.completed_at && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Completed Date</label>
                      <p className="mt-1 text-sm text-gray-900">{formatDateTime(order.completed_at)}</p>
                    </div>
                  )}
                  {order.recalled_at && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Recalled Date</label>
                      <p className="mt-1 text-sm text-gray-900">{formatDateTime(order.recalled_at)}</p>
                    </div>
                  )}
                  {order.notes && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Order Notes</label>
                      <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">{order.notes}</p>
                    </div>
                  )}
                  {order.kds_notes && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">KDS Notes</label>
                      <p className="mt-1 text-sm text-gray-900 bg-indigo-50 p-2 rounded border-l-4 border-indigo-400">{order.kds_notes}</p>
                    </div>
                  )}
                </div>

                {/* Order Items Section */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <ShoppingCart className="h-5 w-5 text-indigo-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Order Items</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="info">{order.order_items?.length || 0} item(s)</Badge>
                      {order.order_items && order.order_items.length > 3 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setOrderItemsModalOpen(true)}
                          leftIcon={<Eye className="h-4 w-4" />}
                        >
                          View All
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {order.order_items && order.order_items.length > 0 ? (
                    <div className="space-y-3">
                      {order.order_items.slice(0, 3).map((item) => (
                        <div key={item.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{item.product?.name}</h4>
                              {item.notes && (
                                <p className="text-sm text-gray-600 mt-1">{item.notes}</p>
                              )}
                              
                              {/* Item Options */}
                              {item.order_item_options && item.order_item_options.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-sm font-medium text-gray-700">Options:</p>
                                  <div className="mt-1 space-y-1">
                                    {item.order_item_options.map((option) => (
                                      <div key={option.id} className="text-sm text-gray-600">
                                        <span className="font-medium">{option.category_attribute?.name}:</span>{' '}
                                        {option.product_option_value?.value}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Tax Information */}
                              {item.order_item_taxes && item.order_item_taxes.length > 0 && (
                                <div className="mt-2">
                                  <div className="flex items-center space-x-2">
                                    <p className="text-sm font-medium text-gray-700">Taxes:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {item.order_item_taxes.map((tax) => (
                                        <span 
                                          key={tax.id} 
                                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                                        >
                                          {tax.name} ({tax.rate}%)
                                        </span>
                                      ))}
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleViewTaxDetails(item)}
                                      leftIcon={<Calculator className="h-3 w-3" />}
                                      className="text-xs"
                                    >
                                      View Details
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <div className="text-right ml-4">
                              <div className="text-sm text-gray-600">
                                {item.quantity} × {formatCurrency(item.base_price)}
                              </div>
                              <div className="font-medium text-gray-900">
                                {formatCurrency(item.total_price)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {order.order_items.length > 3 && (
                        <div className="text-center py-2">
                          <Button
                            variant="outline"
                            onClick={() => setOrderItemsModalOpen(true)}
                            leftIcon={<ExternalLink className="h-4 w-4" />}
                          >
                            View All {order.order_items.length} Items
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">No items found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <div 
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleSection('customerInfo')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-indigo-600" />
                    <h2 className="text-xl font-semibold">Customer Information</h2>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {order.customer_name || 'Walk-in Customer'}
                    </span>
                    {expandedSections.customerInfo ? (
                      <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-500 transition-transform duration-200" />
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            {expandedSections.customerInfo && (
              <CardContent className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {order.customer_name || 'Walk-in Customer'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {order.customer_email || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {order.customer_phone || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Customer Type</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {order.customer_name ? 'Registered Customer' : 'Walk-in Customer'}
                    </p>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* POS User Information */}
          <Card>
            <CardHeader>
              <div 
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleSection('posUserInfo')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Monitor className="h-5 w-5 text-indigo-600" />
                    <h2 className="text-xl font-semibold">POS User Information</h2>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {order.user?.name || 'Unknown'}
                    </span>
                    {expandedSections.posUserInfo ? (
                      <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-500 transition-transform duration-200" />
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            {expandedSections.posUserInfo && (
              <CardContent className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Created By</label>
                    <p className="mt-1 text-sm text-gray-900">{order.user?.name || 'Unknown'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">User Email</label>
                    <p className="mt-1 text-sm text-gray-900">{order.user?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">User Status</label>
                    <div className="mt-1">
                      <Badge variant={order.user?.status === 1 ? 'success' : 'destructive'}>
                        {order.user?.status_text || 'Unknown'}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Store Admin</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {order.user?.is_store_admin ? 'Yes' : 'No'}
                    </p>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Device Information */}
          <Card>
            <CardHeader>
              <div 
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleSection('deviceInfo')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Smartphone className="h-5 w-5 text-indigo-600" />
                    <h2 className="text-xl font-semibold">Device Information</h2>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {order.device_name ? 'Mobile/Tablet Device' : 'Web/Desktop'}
                    </span>
                    {expandedSections.deviceInfo ? (
                      <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-500 transition-transform duration-200" />
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            {expandedSections.deviceInfo && (
              <CardContent className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Device Name</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {order.device_name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Device Model</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {order.device_model || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Device ID</label>
                    <p className="mt-1 text-sm text-gray-900 font-mono">
                      {order.device_id || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Order Source</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {order.device_name ? 'Mobile/Tablet Device' : 'Web/Desktop'}
                    </p>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* KDS User Information */}
          <Card>
            <CardHeader>
              <div 
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleSection('kdsInfo')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-indigo-600" />
                    <h2 className="text-xl font-semibold">KDS User Assignment</h2>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="info">{order?.kds_users?.length || 0} user(s)</Badge>
                    {expandedSections.kdsInfo ? (
                      <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-500 transition-transform duration-200" />
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            {expandedSections.kdsInfo && (
              <CardContent className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                {order?.kds_users?.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Assigned KDS Users:</span>
                      <Badge variant="info">{order?.kds_users?.length || 0} user(s)</Badge>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {order?.kds_users?.map((user: { id: number; name: string }) => (
                        <div key={user.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-700">{user.name}</span>
                          </div>
                          <Badge variant="outline">Assigned</Badge>
                        </div>
                      ))}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Note: KDS users are assigned when the order is marked as paid. 
                      These users can view and update the order status in the KDS system.
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No KDS users assigned to this order</p>
                    <p className="text-xs text-gray-400 mt-1">
                      KDS users will be assigned when the order is marked as paid
                    </p>
                  </div>
                )}
              </CardContent>
            )}
          </Card>


          {/* Payment Information */}
          {order.order_payments && order.order_payments.length > 0 && (
            <Card>
              <CardHeader>
                <div 
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleSection('paymentInfo')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-5 w-5 text-indigo-600" />
                      <h2 className="text-xl font-semibold">Payment Information</h2>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="info">{order.order_payments.length} payment(s)</Badge>
                      {expandedSections.paymentInfo ? (
                        <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-500 transition-transform duration-200" />
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              {expandedSections.paymentInfo && (
                <CardContent className="animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-4">
                    {order.order_payments.map((payment) => (
                      <div key={payment.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{payment.payment_method_text}</h3>
                            {payment.reference_number && (
                              <p className="text-sm text-gray-600">Ref: {payment.reference_number}</p>
                            )}
                            {payment.notes && (
                              <p className="text-sm text-gray-600 mt-1">{payment.notes}</p>
                            )}
                            <p className="text-sm text-gray-500 mt-1">
                              Paid on {formatDateTime(payment.paid_at)}
                            </p>
                          </div>
                          
                          <div className="text-right">
                            <div className="font-medium text-gray-900">
                              {formatCurrency(payment.amount)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          )}

          {/* Split Amount Logs */}
          {order.split_amounts && order.split_amounts.length > 0 && (
            <Card>
              <CardHeader>
                <div 
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleSection('splitPayments')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Split className="h-5 w-5 text-indigo-600" />
                      <h2 className="text-xl font-semibold">Split Payment History</h2>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="info">{order.split_amounts.length} split(s)</Badge>
                      {expandedSections.splitPayments ? (
                        <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-500 transition-transform duration-200" />
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              {expandedSections.splitPayments && (
                <CardContent className="animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-4">
                    {/* Split Summary Header */}
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-indigo-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-indigo-900">Split Payment Summary</h4>
                        <Badge variant="info">{order.split_amounts.length} split(s)</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div className="text-center">
                          <div className="text-indigo-700 font-medium">Total Order</div>
                          <div className="text-lg font-bold text-indigo-900">{formatCurrency(order.total_amount)}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-indigo-700 font-medium">Total Split</div>
                          <div className="text-lg font-bold text-indigo-900">
                            {formatCurrency(order.split_amounts.reduce((sum, split) => sum + split.split_amount, 0))}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-indigo-700 font-medium">Remaining</div>
                          <div className="text-lg font-bold text-orange-600">
                            {formatCurrency(order.split_amounts[order.split_amounts.length - 1]?.remaining_amount || 0)}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-indigo-700 font-medium">Split Count</div>
                          <div className="text-lg font-bold text-indigo-900">{order.split_amounts.length}</div>
                        </div>
                      </div>
                    </div>

                    {/* Show only first 2 splits in collapsed view */}
                    <div className="space-y-3">
                      {order.split_amounts.slice(0, 2).map((split, index) => (
                        <div key={split.id} className="border rounded-lg p-4 bg-white shadow-sm">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                                  Split #{index + 1}
                                </Badge>
                                <div className="flex items-center space-x-1 text-gray-500">
                                  <Clock className="h-4 w-4" />
                                  <span className="text-sm">{formatDateTime(split.created_at)}</span>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-gray-600">
                                    Amount: <span className="font-semibold text-green-600">{formatCurrency(split.split_amount)}</span>
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Remaining: <span className="font-semibold text-orange-600">{formatCurrency(split.remaining_amount)}</span>
                                  </p>
                                </div>
                                <div>
                                  {split.split_reason && (
                                    <p className="text-sm text-gray-600 mb-1">
                                      <span className="font-medium">Reason:</span> {split.split_reason}
                                    </p>
                                  )}
                                  {split.created_by_user && (
                                    <p className="text-sm text-gray-600">
                                      <span className="font-medium">Split by:</span> {split.created_by_user.name}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right ml-4">
                              <div className="text-2xl font-bold text-green-600">
                                {formatCurrency(split.split_amount)}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">Split Amount</div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {order.split_amounts.length > 2 && (
                        <div className="text-center py-2">
                          <Button
                            variant="outline"
                            onClick={() => setSplitPaymentsModalOpen(true)}
                            leftIcon={<ExternalLink className="h-4 w-4" />}
                          >
                            View All {order.split_amounts.length} Splits
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          )}

          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <div 
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleSection('timeline')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <History className="h-5 w-5 text-indigo-600" />
                    <h2 className="text-xl font-semibold">Order Timeline</h2>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="info">{getOrderTimeline().length} event(s)</Badge>
                    {expandedSections.timeline ? (
                      <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-500 transition-transform duration-200" />
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            {expandedSections.timeline && (
              <CardContent className="animate-in slide-in-from-top-2 duration-300">
                <div className="space-y-4">
                  {getOrderTimeline().slice(0, 3).map((item, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className={`w-3 h-3 rounded-full ${
                          item.status === 'created' ? 'bg-indigo-500' :
                          item.status === 'started' ? 'bg-yellow-500' :
                          item.status === 'completed' ? 'bg-green-500' :
                          item.status === 'recalled' ? 'bg-red-500' : 'bg-gray-500'
                        }`}></div>
                        {index < Math.min(getOrderTimeline().length, 3) - 1 && (
                          <div className="w-px h-8 bg-gray-300 ml-1.5 mt-1"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900">{item.event}</h4>
                          <time className="text-xs text-gray-500">{formatDateTime(item.timestamp)}</time>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        <p className="text-xs text-gray-500 mt-1">By: {item.user}</p>
                      </div>
                    </div>
                  ))}
                  
                  {getOrderTimeline().length > 3 && (
                    <div className="text-center py-2">
                      <Button
                        variant="outline"
                        onClick={() => setTimelineModalOpen(true)}
                        leftIcon={<ExternalLink className="h-4 w-4" />}
                      >
                        View All {getOrderTimeline().length} Events
                      </Button>
                    </div>
                  )}
                  
                  {getOrderTimeline().length === 0 && (
                    <div className="text-center py-4">
                      <History className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No timeline events available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Financial Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-indigo-600" />
                <h2 className="text-xl font-semibold">Financial Summary</h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-700">Subtotal:</span>
                <span className="font-medium">{formatCurrency(order.subtotal_amount)}</span>
              </div>
              
              {order.discount_amount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-700">Discount:</span>
                  <span className="font-medium text-red-600">-{formatCurrency(order.discount_amount)}</span>
                </div>
              )}
              
              {order.tax_amount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-700">Tax:</span>
                  <span className="font-medium">{formatCurrency(order.tax_amount)}</span>
                </div>
              )}
              
              {/* Custom Amounts Section */}
              {order.custom_amounts && order.custom_amounts.length > 0 && (
                <div className="space-y-2 py-2 border-t border-gray-100">
                  <div className="flex items-center space-x-2">
                    <Calculator className="h-4 w-4 text-indigo-600" />
                    <span className="text-sm font-semibold text-gray-700">Custom Charges:</span>
                  </div>
                  {order.custom_amounts.map((customAmount) => (
                    <div key={customAmount.id} className="flex justify-between pl-6">
                      <span className="text-sm text-gray-600">
                        {customAmount.description || 'Custom Charge'}
                      </span>
                      <span className="text-sm font-medium text-indigo-600">
                        {formatCurrency(customAmount.amount)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between pl-6 pt-1 border-t border-gray-100">
                    <span className="text-sm font-medium text-gray-700">Total Custom:</span>
                    <span className="text-sm font-semibold text-indigo-600">
                      {formatCurrency(
                        order.custom_amounts.reduce((sum, ca) => sum + parseFloat(ca.amount.toString()), 0)
                      )}
                    </span>
                  </div>
                </div>
              )}
              
              <div className="border-t pt-2">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-gray-900">Total:</span>
                  <span className="text-lg font-bold text-gray-900">{formatCurrency(order.total_amount)}</span>
                </div>
              </div>
              
              {order.total_paid !== undefined && (
                <div className="flex justify-between">
                  <span className="text-gray-700">Paid:</span>
                  <span className="font-medium text-green-600">{formatCurrency(order.total_paid)}</span>
                </div>
              )}
              
              {order.remaining_balance !== undefined && order.remaining_balance > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-700">Remaining:</span>
                  <span className="font-medium text-orange-600">{formatCurrency(order.remaining_balance)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Status */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-indigo-600" />
                <h2 className="text-xl font-semibold">Order Status</h2>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button
                  variant={order.status === 0 ? "primary" : "outline"}
                  onClick={() => handleStatusUpdate(0)}
                  loading={updateLoading}
                  disabled={updateLoading}
                  className="w-full"
                >
                  Mark as Pending
                </Button>
                <Button
                  variant={order.status === 1 ? "primary" : "outline"}
                  onClick={() => handleStatusUpdate(1)}
                  loading={updateLoading}
                  disabled={updateLoading}
                  className="w-full"
                >
                  Mark as In Progress
                </Button>
                <Button
                  variant={order.status === 2 ? "primary" : "outline"}
                  onClick={() => handleStatusUpdate(2)}
                  loading={updateLoading}
                  disabled={updateLoading}
                  className="w-full"
                >
                  Mark as Completed
                </Button>
                <Button
                  variant={order.status === 3 ? "primary" : "outline"}
                  onClick={() => handleStatusUpdate(3)}
                  loading={updateLoading}
                  disabled={updateLoading}
                  className="w-full"
                >
                  Mark as Cancelled
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Payment Status */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-indigo-600" />
                <h2 className="text-xl font-semibold">Payment Status</h2>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button
                  variant={order.payment_status === 'saved' ? "primary" : "outline"}
                  onClick={() => handlePaymentStatusUpdate('saved')}
                  loading={updatePaymentLoading}
                  disabled={updatePaymentLoading}
                  className="w-full"
                >
                  Mark as Saved
                </Button>
                <Button
                  variant={order.payment_status === 'partially_paid' ? "primary" : "outline"}
                  onClick={() => handlePaymentStatusUpdate('partially_paid')}
                  loading={updatePaymentLoading}
                  disabled={updatePaymentLoading}
                  className="w-full"
                >
                  Mark as Partially Paid
                </Button>
                <Button
                  variant={order.payment_status === 'paid' ? "primary" : "outline"}
                  onClick={() => handlePaymentStatusUpdate('paid')}
                  loading={updatePaymentLoading}
                  disabled={updatePaymentLoading}
                  className="w-full"
                >
                  Mark as Paid
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Receipt Manager Modal */}
      {order && (
        <ReceiptManager
          order={order}
          isOpen={receiptModalOpen}
          onClose={() => setReceiptModalOpen(false)}
        />
      )}

      {/* Order Items Modal */}
      {order && (
        <Modal
          isOpen={orderItemsModalOpen}
          onClose={() => setOrderItemsModalOpen(false)}
          title="Order Items Details"
          size="lg"
        >
          <div className="space-y-4">
            {order.order_items && order.order_items.length > 0 ? (
              order.order_items.map((item) => (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.product?.name}</h3>
                      {item.notes && (
                        <p className="text-sm text-gray-600 mt-1">{item.notes}</p>
                      )}
                      
                      {/* Item Options */}
                      {item.order_item_options && item.order_item_options.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-gray-700">Options:</p>
                          <div className="mt-1 space-y-1">
                            {item.order_item_options.map((option) => (
                              <div key={option.id} className="text-sm text-gray-600">
                                <span className="font-medium">{option.category_attribute?.name}:</span>{' '}
                                {option.product_option_value?.value}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tax Information */}
                      {item.order_item_taxes && item.order_item_taxes.length > 0 && (
                        <div className="mt-2">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-700">Taxes:</p>
                            <div className="flex flex-wrap gap-1">
                              {item.order_item_taxes.map((tax) => (
                                <span 
                                  key={tax.id} 
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                                >
                                  {tax.name} ({tax.rate}%)
                                </span>
                              ))}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewTaxDetails(item)}
                              leftIcon={<Calculator className="h-3 w-3" />}
                              className="text-xs"
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm text-gray-600">
                        {item.quantity} × {formatCurrency(item.base_price)}
                      </div>
                      <div className="font-medium text-gray-900">
                        {formatCurrency(item.total_price)}
                      </div>
                      {item.order_item_taxes && item.order_item_taxes.length > 0 && (
                        <div className="text-xs text-green-600 mt-1">
                          +{formatCurrency(calculateItemTaxAmount(item))} tax
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No items found</p>
            )}
          </div>
        </Modal>
      )}

      {/* Split Payments Modal */}
      {order && order.split_amounts && order.split_amounts.length > 0 && (
        <Modal
          isOpen={splitPaymentsModalOpen}
          onClose={() => setSplitPaymentsModalOpen(false)}
          title="Split Payment History"
          size="lg"
        >
          <div className="space-y-4">
            {/* Split Summary Header */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-indigo-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-indigo-900">Split Payment Summary</h4>
                <Badge variant="info">{order.split_amounts.length} split(s)</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-indigo-700 font-medium">Total Order</div>
                  <div className="text-lg font-bold text-indigo-900">{formatCurrency(order.total_amount)}</div>
                </div>
                <div className="text-center">
                  <div className="text-indigo-700 font-medium">Total Split</div>
                  <div className="text-lg font-bold text-indigo-900">
                    {formatCurrency(order.split_amounts.reduce((sum, split) => sum + split.split_amount, 0))}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-indigo-700 font-medium">Remaining</div>
                  <div className="text-lg font-bold text-orange-600">
                    {formatCurrency(order.split_amounts[order.split_amounts.length - 1]?.remaining_amount || 0)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-indigo-700 font-medium">Split Count</div>
                  <div className="text-lg font-bold text-indigo-900">{order.split_amounts.length}</div>
                </div>
              </div>
            </div>

            {/* Individual Split Logs */}
            <div className="space-y-3">
              {order.split_amounts.map((split, index) => (
                <div key={split.id} className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                          Split #{index + 1}
                        </Badge>
                        <Badge variant="secondary">
                          Portion {split.split_portion} of {split.total_splits}
                        </Badge>
                        <div className="flex items-center space-x-1 text-gray-500">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">{formatDateTime(split.created_at)}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Split Details</h4>
                          <p className="text-sm text-gray-600">
                            Amount: <span className="font-semibold text-green-600">{formatCurrency(split.split_amount)}</span>
                          </p>
                          <p className="text-sm text-gray-600">
                            Remaining: <span className="font-semibold text-orange-600">{formatCurrency(split.remaining_amount)}</span>
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Additional Info</h4>
                          {split.split_reason && (
                            <p className="text-sm text-gray-600 mb-1">
                              <span className="font-medium">Reason:</span> {split.split_reason}
                            </p>
                          )}
                          {split.created_by_user && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Split by:</span> {split.created_by_user.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right ml-4">
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(split.split_amount)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Split Amount</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* Timeline Modal */}
      {order && (
        <Modal
          isOpen={timelineModalOpen}
          onClose={() => setTimelineModalOpen(false)}
          title="Order Timeline"
          size="lg"
        >
          <div className="space-y-4">
            {getOrderTimeline().map((item, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className={`w-3 h-3 rounded-full ${
                    item.status === 'created' ? 'bg-indigo-500' :
                    item.status === 'started' ? 'bg-yellow-500' :
                    item.status === 'completed' ? 'bg-green-500' :
                    item.status === 'recalled' ? 'bg-red-500' : 'bg-gray-500'
                  }`}></div>
                  {index < getOrderTimeline().length - 1 && (
                    <div className="w-px h-8 bg-gray-300 ml-1.5 mt-1"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900">{item.event}</h4>
                    <time className="text-xs text-gray-500">{formatDateTime(item.timestamp)}</time>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  <p className="text-xs text-gray-500 mt-1">By: {item.user}</p>
                </div>
              </div>
            ))}
            
            {getOrderTimeline().length === 0 && (
              <div className="text-center py-4">
                <History className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No timeline events available</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Tax Details Modal */}
      {selectedItemForTax && (
         <TaxDetailsModal
           isOpen={taxDetailsModalOpen}
           onClose={() => {
             setTaxDetailsModalOpen(false);
             setSelectedItemForTax(null);
           }}
           itemName={selectedItemForTax.product?.name || 'Unknown Item'}
           taxes={selectedItemForTax.order_item_taxes || []}
           basePrice={selectedItemForTax.base_price}
           quantity={selectedItemForTax.quantity}
           orderDiscountAmount={order?.discount_amount || 0}
           orderSubtotalAmount={order?.subtotal_amount || 0}
         />
      )}
    </div>
  );
};

export default OrderView;
