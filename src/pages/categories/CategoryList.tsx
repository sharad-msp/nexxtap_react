import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search,
  RefreshCw,
  Tag,
  Upload
} from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardContent,
  Table,
  Button,
  Modal,
  Input,
  CsvImportModal,
  StandardDropdown
} from '@/components';
import { categoryApi } from '@/api/categoryApi';
import { formatDate } from '@/utils/formatDate';
import { getStatusColor, getStatusText } from '@/utils/statusColors';
import type { Category } from '@/types/category.types';
import { usePermissions } from '@/hooks/usePermissions';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useToast } from '@/components/Toast';

const CategoryList: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { 
    canViewCategories, 
    canCreateCategories, 
    canUpdateCategories, 
    canDeleteCategories
  } = usePermissions();
  
  usePageTitle({ title: 'Categories Management' });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCategories, setTotalCategories] = useState(0);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  


  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);

  // Fetch categories
  const fetchCategories = useCallback(async (page = 1, search = '', status = 'all') => {
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

      const response = await categoryApi.getAll(params);
      setCategories(response.data);
      setTotalPages(response.meta.last_page);
      setTotalCategories(response.meta.total || 0);
      setIsInitialized(true);
    } catch (error) {
      console.error('Error fetching categories:', error);
      showToast('error', 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, [loading, showToast]);

  useEffect(() => {
    if (!isInitialized) {
      fetchCategories(currentPage, searchQuery, filterStatus);
    }
  }, [fetchCategories, currentPage, searchQuery, filterStatus, isInitialized]);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    fetchCategories(1, query, filterStatus);
  }, [fetchCategories, filterStatus]);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    fetchCategories(page, searchQuery, filterStatus);
  }, [fetchCategories, searchQuery, filterStatus]);

  // Handle status filter change
  const handleStatusFilterChange = useCallback((status: string) => {
    setFilterStatus(status);
    setCurrentPage(1);
    fetchCategories(1, searchQuery, status);
  }, [fetchCategories, searchQuery]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    fetchCategories(currentPage, searchQuery, filterStatus);
  }, [fetchCategories, currentPage, searchQuery, filterStatus]);

  // Handle category actions
  const handleViewCategory = useCallback((category: Category) => {
    navigate(`/categories/view/${category.id}`);
  }, [navigate]);

  const handleEditCategory = useCallback((category: Category) => {
    navigate(`/categories/edit/${category.id}`);
  }, [navigate]);

  const handleDeleteCategory = useCallback((category: Category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!categoryToDelete) return;

    try {
      await categoryApi.delete(categoryToDelete.id);
      showToast('success', 'Category deleted successfully');
      setShowDeleteModal(false);
      setCategoryToDelete(null);
      fetchCategories(currentPage, searchQuery, filterStatus);
    } catch (error) {
      showToast('error', 'Failed to delete category');
    }
  }, [categoryToDelete, fetchCategories, currentPage, searchQuery, filterStatus]);


  // Table columns
  const columns = [
    {
      key: 'name',
      header: 'Category Name',
      sortable: true,
      render: (category: Category) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Tag className="h-5 w-5 text-indigo-600" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-gray-900 truncate">
              {category.name}
            </div>
            <div className="text-sm text-gray-500">
              {category.options?.length || 0} attributes
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'attributes',
      header: 'Attributes',
      render: (category: Category) => (
        <div className="text-sm text-gray-600">
          {category.options && category.options.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {category.options.slice(0, 3).map((option: any) => (
                <span key={option.id} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  {option.name}
                </span>
              ))}
              {category.options.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  +{category.options.length - 3} more
                </span>
              )}
            </div>
          ) : (
            <span className="text-gray-400">No attributes</span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (category: Category) => {
        return (
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(category.status)}`}
          >
            {getStatusText(category.status)}
          </span>
        );
      },
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (category: Category) => (
        <div className="text-sm text-gray-600">
          {formatDate(category.created_at)}
        </div>
      ),
    },
  ];

  // Actions column
  const actionsColumn = {
    key: 'actions',
    header: 'Actions',
    width: '25%',
    render: (category: Category) => (
      <div className="flex items-center gap-1 overflow-x-auto">
        {canViewCategories() && (
          <Button
            onClick={() => handleViewCategory(category)}
            variant="outline"
            size="sm"
            leftIcon={<Eye className="h-4 w-4" />}
            className="whitespace-nowrap"
            title="View Category"
          >
            <span className="hidden sm:inline">View</span>
          </Button>
        )}
        {canUpdateCategories() && (
          <Button
            onClick={() => handleEditCategory(category)}
            variant="outline"
            size="sm"
            leftIcon={<Edit className="h-4 w-4" />}
            className="whitespace-nowrap"
            title="Edit Category"
          >
            <span className="hidden sm:inline">Edit</span>
          </Button>
        )}
        {canDeleteCategories() && (
          <Button
            onClick={() => handleDeleteCategory(category)}
            variant="outline"
            size="sm"
            leftIcon={<Trash2 className="h-4 w-4" />}
            className="whitespace-nowrap"
            title="Delete Category"
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
          <h1 className="text-2xl font-bold text-gray-900">Categories Management</h1>
          <p className="text-gray-600 mt-1">Manage your product categories and attributes</p>
        </div>
        <div className="flex space-x-3">
          {canCreateCategories() && (
            <Button
              onClick={() => navigate('/categories/add')}
              leftIcon={<Plus className="h-4 w-4" />}
              className="w-full sm:w-auto"
            >
              Add Category
            </Button>
          )}
          <Button
            onClick={() => setShowImportModal(true)}
            leftIcon={<Upload className="h-4 w-4" />}
            variant="outline"
            className="w-full sm:w-auto"
          >
            Import CSV
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Search */}
            <div className="flex-1 max-w-sm">
              <Input
                placeholder="Search categories..."
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

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Tag className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
                <p className="text-sm text-gray-600">{totalCategories} categories found</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table
            data={categories}
            columns={columnsWithActions}
            loading={loading}
            pagination={{
              currentPage,
              totalPages,
              onPageChange: handlePageChange,
            }}
            keyField="id"
            emptyMessage="No categories found"
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Category"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete <strong>{categoryToDelete?.name}</strong>? 
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
        importType="category"
        title="Categories"
        onRefresh={handleRefresh}
      />
    </div>
  );
};

export default CategoryList;
