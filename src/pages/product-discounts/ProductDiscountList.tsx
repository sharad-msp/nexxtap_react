import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search,
  RefreshCw,
  Percent
} from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardContent,
  Table,
  Button,
  Modal,
  Input,
  StandardDropdown
} from '@/components';

import { productDiscountApi } from '@/api';
import { formatDate } from '@/utils/formatDate';
import { getStatusColor, getStatusText } from '@/utils/statusColors';
import type { ProductDiscount } from '@/types';
import { usePermissions } from '@/hooks/usePermissions';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useToast } from '@/components/Toast';

const ProductDiscountList: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { 
    canListDiscounts,
    canCreateDiscounts,
    canViewDiscounts, 
    canUpdateDiscounts,
    canDeleteDiscounts,
    canChangeDiscountStatus,
  } = usePermissions();
  
  usePageTitle({ title: 'Product Discounts Management' });
  
  const [productDiscounts, setProductDiscounts] = useState<ProductDiscount[]>([]);
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProductDiscounts, setTotalProductDiscounts] = useState(0);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productDiscountToDelete, setProductDiscountToDelete] = useState<ProductDiscount | null>(null);

  // Helper function to safely format maximum order amount
  const formatMaximumOrderAmount = (amount: any): string => {
    if (!amount) return 'No limit';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount) || typeof numAmount !== 'number') return 'No limit';
    return `$${numAmount.toFixed(2)}`;
  };

  // Fetch product discounts
  const fetchProductDiscounts = useCallback(async (page = 1, search = '', status = 'all') => {
    if (loading) return;
    
    setLoading(true);
    try {
      const params: any = {
        page,
        per_page: 10,
        search
      };
      
      if (status !== 'all') {
        params.status = status;
      }

      const response = await productDiscountApi.getAll(params);
      setProductDiscounts(response.data);
      setTotalPages(response.meta.last_page);
      setTotalProductDiscounts(response.meta.total || 0);
      setIsInitialized(true);
    } catch (error) {
      console.error('Error fetching product discounts:', error);
      showToast('error', 'Failed to fetch product discounts. Please check if the backend server is running.');
    } finally {
      setLoading(false);
    }
  }, [loading, showToast]);

  useEffect(() => {
    if (!isInitialized) {
      fetchProductDiscounts(currentPage, searchQuery, filterStatus);
    }
  }, [fetchProductDiscounts, currentPage, searchQuery, filterStatus, isInitialized]);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    fetchProductDiscounts(1, query, filterStatus);
  }, [fetchProductDiscounts, filterStatus]);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    fetchProductDiscounts(page, searchQuery, filterStatus);
  }, [fetchProductDiscounts, searchQuery, filterStatus]);

  // Handle status filter change
  const handleStatusFilterChange = useCallback((status: string) => {
    setFilterStatus(status);
    setCurrentPage(1);
    fetchProductDiscounts(1, searchQuery, status);
  }, [fetchProductDiscounts, searchQuery]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    fetchProductDiscounts(currentPage, searchQuery, filterStatus);
  }, [fetchProductDiscounts, currentPage, searchQuery, filterStatus]);

  // Handle product discount actions
  const handleViewProductDiscount = useCallback((productDiscount: ProductDiscount) => {
    navigate(`/product-discounts/view/${productDiscount.id}`);
  }, [navigate]);

  const handleEditProductDiscount = useCallback((productDiscount: ProductDiscount) => {
    navigate(`/product-discounts/edit/${productDiscount.id}`);
  }, [navigate]);

  const handleDeleteProductDiscount = useCallback((productDiscount: ProductDiscount) => {
    setProductDiscountToDelete(productDiscount);
    setShowDeleteModal(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!productDiscountToDelete) return;

    try {
      const response = await productDiscountApi.delete(productDiscountToDelete.id);
      if (response.status === 1) {
        showToast('success', 'Product discount deleted successfully');
        setShowDeleteModal(false);
        setProductDiscountToDelete(null);
        fetchProductDiscounts(currentPage, searchQuery, filterStatus);
      } else {
        showToast('error', response.message);
      }
    } catch (error) {
      showToast('error', 'Failed to delete product discount');
    }
  }, [productDiscountToDelete, fetchProductDiscounts, currentPage, searchQuery, filterStatus, showToast]);

  // Table columns
  const columns = [
    {
      key: 'discount_name',
      header: 'Discount Name',
      sortable: true,
      render: (productDiscount: ProductDiscount) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Percent className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-gray-900 truncate">
              {productDiscount.discount_name}
            </div>
            <div className="text-sm text-gray-500">
              {productDiscount.discount_type_text}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'discount_value',
      header: 'Discount Value',
      render: (productDiscount: ProductDiscount) => (
        <div className="text-sm text-gray-600">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {productDiscount.formatted_discount_value}
          </span>
        </div>
      ),
    },
    {
      key: 'maximum_order_amount',
      header: 'Max Order Amount',
      render: (productDiscount: ProductDiscount) => (
        <div className="text-sm text-gray-600">
          {formatMaximumOrderAmount(productDiscount.maximum_order_amount)}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (productDiscount: ProductDiscount) => {
        return (
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(productDiscount.status)}`}
          >
            {getStatusText(productDiscount.status)}
          </span>
        );
      },
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (productDiscount: ProductDiscount) => (
        <div className="text-sm text-gray-600">
          {formatDate(productDiscount.created_at)}
        </div>
      ),
    },
  ];

  // Actions column
  const actionsColumn = {
    key: 'actions',
    header: 'Actions',
    width: '25%',
    render: (productDiscount: ProductDiscount) => (
      <div className="flex items-center gap-1 overflow-x-auto">
        {canViewDiscounts() && (
          <Button
            onClick={() => handleViewProductDiscount(productDiscount)}
            variant="outline"
            size="sm"
            leftIcon={<Eye className="h-4 w-4" />}
            className="whitespace-nowrap"
            title="View Product Discount"
          >
            <span className="hidden sm:inline">View</span>
          </Button>
        )}
        {canUpdateDiscounts() && (
          <Button
            onClick={() => handleEditProductDiscount(productDiscount)}
            variant="outline"
            size="sm"
            leftIcon={<Edit className="h-4 w-4" />}
            className="whitespace-nowrap"
            title="Edit Product Discount"
          >
            <span className="hidden sm:inline">Edit</span>
          </Button>
        )}
        {canDeleteDiscounts() && (
          <Button
            onClick={() => handleDeleteProductDiscount(productDiscount)}
            variant="outline"
            size="sm"
            leftIcon={<Trash2 className="h-4 w-4" />}
            className="whitespace-nowrap"
            title="Delete Product Discount"
          >
            <span className="hidden sm:inline">Delete</span>
          </Button>
        )}
      </div>
    )
  };

  // Add actions column to columns array
  const columnsWithActions = [...columns, actionsColumn];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Discounts Management</h1>
          <p className="text-gray-600 mt-1">Manage your store product discounts and promotional offers</p>
        </div>
        {canCreateDiscounts() && (
          <Button
            onClick={() => navigate('/product-discounts/add')}
            leftIcon={<Plus className="h-4 w-4" />}
            className="w-full sm:w-auto"
          >
            Add Product Discount
          </Button>
        )}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Search */}
            <div className="flex-1 max-w-sm">
              <Input
                placeholder="Search product discounts..."
                value={searchQuery}
                onChange={handleSearch}
                leftIcon={<Search className="h-4 w-4" />}
                variant="filled"
              />
            </div>
            
            {/* Status Filter */}
            <div className="w-full sm:w-48">
              <StandardDropdown
                value={filterStatus}
                onChange={handleStatusFilterChange}
                options={[
                  { value: 'all', label: 'All' },
                  { value: '1', label: 'Active Only' },
                  { value: '0', label: 'Inactive Only' }
                ]}
                placeholder="Filter by status"
                size="md"
              />
            </div>

            {/* Refresh Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              leftIcon={<RefreshCw className="h-4 w-4" />}
              className="h-10"
            >
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Product Discounts Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Percent className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Product Discounts</h3>
                <p className="text-sm text-gray-600">{totalProductDiscounts} product discounts found</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table
            data={productDiscounts}
            columns={columnsWithActions}
            loading={loading}
            pagination={{
              currentPage,
              totalPages,
              onPageChange: handlePageChange,
            }}
            keyField="id"
            emptyMessage="No product discounts found"
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Product Discount"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete <strong>{productDiscountToDelete?.discount_name}</strong>? 
            This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProductDiscountList;
