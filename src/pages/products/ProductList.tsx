import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search,
  RefreshCw,
  Package,
  Upload,
  ToggleLeft,
  ToggleRight,
  Shield
} from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardContent,
  Table,
  Button,
  IconButton,
  StandardDropdown,
  Modal,
  Input,
  useToast,
  CsvImportModal,
  CategoryDropdown
} from '@/components';
import { productApi } from '@/api';
import { formatDate } from '@/utils/formatDate';
import { getStatusColor, getStatusText } from '@/utils/statusColors';
import { usePageTitle } from '@/hooks/usePageTitle';
import type { Product } from '@/types/product.types';
import { usePermissions } from '@/hooks/usePermissions';


const ProductList: React.FC = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { canViewProducts, canListProducts, canCreateProducts, canUpdateProducts, canDeleteProducts } = usePermissions();
  usePageTitle({ title: 'Products Management' });
  
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  // const [selectedProducts, setSelectedProducts] = useState<Product[]>([]); // Removed for cleaner interface
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showImportModal, setShowImportModal] = useState(false);
  
  // Refs for preventing duplicate calls
  const initializedRef = useRef(false);
  const loadingRef = useRef(false);


  // Fetch products - with proper deduplication and error handling
  const fetchProducts = useCallback(async (page = 1, search = '', status = 'all', category = 'all') => {
    // Prevent duplicate calls
    if (loadingRef.current) {
      return;
    }
    
    loadingRef.current = true;
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

      if (category !== 'all') {
        params.category_id = category;
      }

      const response = await productApi.getAll(params);
      setProducts(response.data);
      setTotalPages(response.meta.last_page);
      setTotalProducts(response.meta.total || 0);
    } catch (error) {
      console.error('Error fetching products:', error);
      // Don't show toast for network/server errors - let error handling system handle it
      // Only show toast for specific business logic errors if needed
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);


  // Initialize products only once, then handle updates separately
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      fetchProducts(currentPage, searchQuery, filterStatus, filterCategory);
    }
  }, [fetchProducts]);

  // Handle filter/search/pagination changes separately to avoid duplicate initial calls
  useEffect(() => {
    if (initializedRef.current) {
      fetchProducts(currentPage, searchQuery, filterStatus, filterCategory);
    }
  }, [currentPage, searchQuery, filterStatus, filterCategory, fetchProducts]);



  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle status filter change
  const handleStatusFilterChange = (status: string) => {
    setFilterStatus(status);
    setCurrentPage(1);
  };

  // Handle category filter change
  const handleCategoryFilterChange = (category: string) => {
    setFilterCategory(category);
    setCurrentPage(1);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchProducts(currentPage, searchQuery, filterStatus, filterCategory);
  };

  // Handle product actions
  const handleViewProduct = (product: Product) => {
    navigate(`/products/view/${product.id}`);
  };

  const handleEditProduct = (product: Product) => {
    navigate(`/products/edit/${product.id}`);
  };

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      await productApi.delete(productToDelete.id);
      showToast('success', 'Product deleted successfully');
      setShowDeleteModal(false);
      setProductToDelete(null);
      fetchProducts(currentPage, searchQuery, filterStatus, filterCategory);
    } catch (error: any) {
      console.error('Error deleting product:', error);
      // Only show toast for specific business errors, not network/server errors
      if (error.response?.status && error.response.status < 500) {
        showToast('error', error.response.data?.message || 'Failed to delete product');
      }
      // Network/server errors will be handled by the error handling system
    }
  };

 // Check permission
 if (!canViewProducts()) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
        <p className="text-gray-600">You don't have permission to view products.</p>
      </div>
    </div>
  );
}

  // Bulk actions removed for cleaner interface
  /*
  const handleBulkStatusUpdate = async (status: boolean) => {
    if (selectedProducts.length === 0) return;

    try {
      await Promise.all(
        selectedProducts.map(product => productApi.updateStatus(product.id, status))
      );
      showToast('success', 'Products status updated successfully');
      setSelectedProducts([]);
      fetchProducts(currentPage, searchQuery, filterStatus, filterCategory);
    } catch (error: any) {
      console.error('Error updating products status:', error);
      // Only show toast for specific business errors, not network/server errors
      if (error.response?.status && error.response.status < 500) {
        showToast('error', error.response.data?.message || 'Failed to update products status');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;

    if (window.confirm(`Are you sure you want to delete ${selectedProducts.length} products? This action cannot be undone.`)) {
      try {
        await Promise.all(
          selectedProducts.map(product => productApi.delete(product.id))
        );
        showToast('success', 'Products have been deleted.');
        setSelectedProducts([]);
        fetchProducts(currentPage, searchQuery, filterStatus, filterCategory);
      } catch (error: any) {
        console.error('Error deleting products:', error);
        // Only show toast for specific business errors, not network/server errors
        if (error.response?.status && error.response.status < 500) {
          showToast('error', error.response.data?.message || 'Failed to delete products');
        }
      }
    }
  };
  */



  // Table columns
  const columns = [
    {
      key: 'name',
      header: 'Product Name',
      sortable: true,
      render: (product: Product) => (
        <div className="flex items-center space-x-3">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="h-10 w-10 rounded object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="h-6 w-6 text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          <div>
            <div className="font-medium text-gray-900">{product.name}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'category_name',
      header: 'Category',
      sortable: true,
      render: (product: Product) => (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
          {product.category?.name || 'N/A'}
        </span>
      ),
    },
    {
      key: 'base_price',
      header: 'Base Price',
      sortable: true,
      render: (product: Product) => (
        <div className="text-gray-900 font-medium">
          ${parseFloat(product.base_price.toString()).toFixed(2)}
        </div>
      ),
    },
    {
      key: 'options',
      header: 'Options',
      render: (product: Product) => (
        <div className="text-gray-600">
          <span className="text-sm">
            {product.product_option_values?.length || 0} options
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (product: Product) => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}
        >
          {getStatusText(product.status)}
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (product: Product) => (
        <div className="text-sm text-gray-600">
          {formatDate(product.created_at)}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '30%',
      render: (product: Product) => (
        <div className="flex items-center gap-1 overflow-x-auto">
          {canViewProducts() && (
            <Button
              onClick={() => handleViewProduct(product)}
              variant="outline"
              size="sm"
              leftIcon={<Eye className="h-4 w-4" />}
              className="whitespace-nowrap"
              title="View Product"
            >
              <span className="hidden sm:inline">View</span>
            </Button>
          )}
          {canUpdateProducts() && (
            <Button
              onClick={() => handleEditProduct(product)}
              variant="outline"
              size="sm"
              leftIcon={<Edit className="h-4 w-4" />}
              className="whitespace-nowrap"
              title="Edit Product"
            >
              <span className="hidden sm:inline">Edit</span>
            </Button>
          )}
          {canUpdateProducts() && (
            <Button
              onClick={() => handleStatusToggle(product)}
              variant="outline"
              size="sm"
              leftIcon={product.status ? 
                <ToggleRight className="h-4 w-4" /> : 
                <ToggleLeft className="h-4 w-4" />
              }
              className="whitespace-nowrap"
              title={product.status ? 'Deactivate Product' : 'Activate Product'}
            >
              <span className="hidden sm:inline">{product.status ? 'Deactivate' : 'Activate'}</span>
            </Button>
          )}
          {canDeleteProducts() && (
            <Button
              onClick={() => handleDeleteProduct(product)}
              variant="outline"
              size="sm"
              leftIcon={<Trash2 className="h-4 w-4" />}
              className="whitespace-nowrap"
              title="Delete Product"
            >
              <span className="hidden sm:inline">Delete</span>
            </Button>
          )}
        </div>
      ),
    },
  ];

  // Handle individual status toggle
  const handleStatusToggle = async (product: Product) => {
    try {
      await productApi.updateStatus(product.id, !product.status);
      showToast('success', 'Product status updated successfully');
      fetchProducts(currentPage, searchQuery, filterStatus, filterCategory);
    } catch (error: any) {
      console.error('Error updating product status:', error);
      if (error.response?.status && error.response.status < 500) {
        showToast('error', error.response.data?.message || 'Failed to update product status');
      }
    }
  };



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products Management</h1>
          <p className="text-gray-600">Manage your product catalog with category-based attributes</p>
        </div>
        <div className="flex space-x-3">
          {canCreateProducts() && (
            <Button
              onClick={() => navigate('/products/add')}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Add Product
            </Button>
          )}
          {canCreateProducts() && (
            <Button
              onClick={() => setShowImportModal(true)}
              leftIcon={<Upload className="h-4 w-4" />}
              variant="outline"
            >
              Import CSV
            </Button>
          )}
        </div>
      </div>



      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Search */}
            <div className="flex-1 max-w-sm">
              <Input
                placeholder="Search products..."
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

            {/* Category Filter */}
            <div className="w-full sm:w-48">
              <CategoryDropdown
                value={filterCategory}
                onChange={handleCategoryFilterChange}
                placeholder="All Categories"
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

      {/* Products Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Products</h2>
                <p className="text-sm text-gray-600">{totalProducts} products found</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table
            data={products}
            columns={columns}
            loading={loading}
            pagination={{
              currentPage,
              totalPages,
              onPageChange: handlePageChange,
            }}
            // Removed bulk selection functionality
            // selectable
            // selectedItems={selectedProducts}
            // onSelectionChange={setSelectedProducts}
            keyField="id"
            emptyMessage="No products found"
          />


        </CardContent>
      </Card>

      {/* Bulk Actions - Removed for cleaner interface */}
      {/* 
      {selectedProducts.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {selectedProducts.length} product(s) selected
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkStatusUpdate(true)}
                >
                  Activate Selected
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkStatusUpdate(false)}
                >
                  Deactivate Selected
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleBulkDelete}
                >
                  Delete Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      */}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Product"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete <strong>{productToDelete?.name}</strong>? 
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

        {/* CSV Import Modal */}
        <CsvImportModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          importType="product"
          title="Products"
          onRefresh={handleRefresh}
        />
      </div>
    );
};

export default ProductList;
