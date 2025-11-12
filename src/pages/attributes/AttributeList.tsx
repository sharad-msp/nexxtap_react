import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search,
  RefreshCw,
  Settings2
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
import { attributeApi } from '@/api/attributeApi';
import { formatDate } from '@/utils/formatDate';
import { getStatusColor, getStatusText } from '@/utils/statusColors';
import type { Attribute } from '@/types/attribute.types';
import { usePermissions } from '@/hooks/usePermissions';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useToast } from '@/components/Toast';

const AttributeList: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { 
    canViewAttributes, 
    canCreateAttributes, 
    canUpdateAttributes, 
    canDeleteAttributes
  } = usePermissions();
  
  usePageTitle({ title: 'Attributes Management' });
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAttributes, setTotalAttributes] = useState(0);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [attributeToDelete, setAttributeToDelete] = useState<Attribute | null>(null);

  // Fetch attributes
  const fetchAttributes = useCallback(async (page = 1, search = '', status = 'all') => {
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

      const response = await attributeApi.getAll(params);
      setAttributes(response.data);
      setTotalPages(response.meta.last_page);
      setTotalAttributes(response.meta.total || 0);
      setIsInitialized(true);
    } catch (error) {
      console.error('Error fetching attributes:', error);
      showToast('error', 'Failed to fetch attributes');
    } finally {
      setLoading(false);
    }
  }, [loading, showToast]);

  useEffect(() => {
    if (!isInitialized) {
      fetchAttributes(currentPage, searchQuery, filterStatus);
    }
  }, [fetchAttributes, currentPage, searchQuery, filterStatus, isInitialized]);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    fetchAttributes(1, query, filterStatus);
  }, [fetchAttributes, filterStatus]);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    fetchAttributes(page, searchQuery, filterStatus);
  }, [fetchAttributes, searchQuery, filterStatus]);

  // Handle status filter change
  const handleStatusFilterChange = useCallback((status: string) => {
    setFilterStatus(status);
    setCurrentPage(1);
    fetchAttributes(1, searchQuery, status);
  }, [fetchAttributes, searchQuery]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    fetchAttributes(currentPage, searchQuery, filterStatus);
  }, [fetchAttributes, currentPage, searchQuery, filterStatus]);

  // Handle attribute actions
  const handleViewAttribute = useCallback((attribute: Attribute) => {
    navigate(`/attributes/view/${attribute.id}`);
  }, [navigate]);

  const handleEditAttribute = useCallback((attribute: Attribute) => {
    navigate(`/attributes/edit/${attribute.id}`);
  }, [navigate]);

  const handleDeleteAttribute = useCallback((attribute: Attribute) => {
    setAttributeToDelete(attribute);
    setShowDeleteModal(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!attributeToDelete) return;

    try {
      await attributeApi.delete(attributeToDelete.id);
      showToast('success', 'Attribute deleted successfully');
      setShowDeleteModal(false);
      setAttributeToDelete(null);
      fetchAttributes(currentPage, searchQuery, filterStatus);
    } catch (error) {
      showToast('error', 'Failed to delete attribute');
    }
  }, [attributeToDelete, fetchAttributes, currentPage, searchQuery, filterStatus, showToast]);

  // Table columns
  const columns = [
    {
      key: 'name',
      header: 'Attribute Name',
      sortable: true,
      render: (attribute: Attribute) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Settings2 className="h-5 w-5 text-indigo-600" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-gray-900 truncate">
              {attribute.name}
            </div>
            <div className="text-sm text-gray-500">
              {attribute.options?.length || 0} options
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'options',
      header: 'Options',
      render: (attribute: Attribute) => (
        <div className="text-sm text-gray-600">
          {attribute.options && attribute.options.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {attribute.options.slice(0, 3).map((option: any) => (
                <span key={option.id} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  {option.value}
                </span>
              ))}
              {attribute.options.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  +{attribute.options.length - 3} more
                </span>
              )}
            </div>
          ) : (
            <span className="text-gray-400">No options</span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (attribute: Attribute) => {
        return (
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(attribute.status)}`}
          >
            {getStatusText(attribute.status)}
          </span>
        );
      },
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (attribute: Attribute) => (
        <div className="text-sm text-gray-600">
          {formatDate(attribute.created_at)}
        </div>
      ),
    },
  ];

  // Actions column
  const actionsColumn = {
    key: 'actions',
    header: 'Actions',
    width: '25%',
    render: (attribute: Attribute) => (
      <div className="flex items-center gap-1 overflow-x-auto">
        {canViewAttributes() && (
          <Button
            onClick={() => handleViewAttribute(attribute)}
            variant="outline"
            size="sm"
            leftIcon={<Eye className="h-4 w-4" />}
            className="whitespace-nowrap"
            title="View Attribute"
          >
            <span className="hidden sm:inline">View</span>
          </Button>
        )}
        {canUpdateAttributes() && (
          <Button
            onClick={() => handleEditAttribute(attribute)}
            variant="outline"
            size="sm"
            leftIcon={<Edit className="h-4 w-4" />}
            className="whitespace-nowrap"
            title="Edit Attribute"
          >
            <span className="hidden sm:inline">Edit</span>
          </Button>
        )}
        {canDeleteAttributes() && (
          <Button
            onClick={() => handleDeleteAttribute(attribute)}
            variant="outline"
            size="sm"
            leftIcon={<Trash2 className="h-4 w-4" />}
            className="whitespace-nowrap"
            title="Delete Attribute"
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
          <h1 className="text-2xl font-bold text-gray-900">Attributes Management</h1>
          <p className="text-gray-600 mt-1">Manage your product attributes and options</p>
        </div>
        <div className="flex space-x-3">
          {canCreateAttributes() && (
            <Button
              onClick={() => navigate('/attributes/add')}
              leftIcon={<Plus className="h-4 w-4" />}
              className="w-full sm:w-auto"
            >
              Add Attribute
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
                placeholder="Search attributes..."
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

      {/* Attributes Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Settings2 className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Attributes</h3>
                <p className="text-sm text-gray-600">{totalAttributes} attributes found</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table
            data={attributes}
            columns={columnsWithActions}
            loading={loading}
            pagination={{
              currentPage,
              totalPages,
              onPageChange: handlePageChange,
            }}
            keyField="id"
            emptyMessage="No attributes found"
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Attribute"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete <strong>{attributeToDelete?.name}</strong>? 
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

export default AttributeList;

