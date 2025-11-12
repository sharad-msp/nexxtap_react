import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search,
  RefreshCw,
  Calculator
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

import { taxApi } from '@/api';
import { formatDate } from '@/utils/formatDate';
import { getStatusColor, getStatusText } from '@/utils/statusColors';
import type { Tax } from '@/types';
import { usePermissions } from '@/hooks/usePermissions';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useToast } from '@/components/Toast';

const TaxList: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { 
    canViewTaxes, 
    canUpdateTaxes,
    canDeleteTaxes
  } = usePermissions();
  
  usePageTitle({ title: 'Taxes Management' });
  
  // Temporary fallback for testing
  const safeCanViewTaxes = () => canViewTaxes && typeof canViewTaxes === 'function' ? canViewTaxes() : true;
  const safeCanUpdateTaxes = () => canUpdateTaxes && typeof canUpdateTaxes === 'function' ? canUpdateTaxes() : true;
  const safeCanDeleteTaxes = () => canDeleteTaxes && typeof canDeleteTaxes === 'function' ? canDeleteTaxes() : true;
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTaxes, setTotalTaxes] = useState(0);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taxToDelete, setTaxToDelete] = useState<Tax | null>(null);

  // Fetch taxes
  const fetchTaxes = useCallback(async (page = 1, search = '', status = 'all') => {
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

      const response = await taxApi.getAll(params);
      setTaxes(response.data);
      setTotalPages(response.meta.last_page);
      setTotalTaxes(response.meta.total || 0);
      setIsInitialized(true);
    } catch (error) {
      console.error('Error fetching taxes:', error);
      showToast('error', 'Failed to fetch taxes. Please check if the backend server is running.');
    } finally {
      setLoading(false);
    }
  }, [loading, showToast]);

  useEffect(() => {
    if (!isInitialized) {
      fetchTaxes(currentPage, searchQuery, filterStatus);
    }
  }, [fetchTaxes, currentPage, searchQuery, filterStatus, isInitialized]);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    fetchTaxes(1, query, filterStatus);
  }, [fetchTaxes, filterStatus]);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    fetchTaxes(page, searchQuery, filterStatus);
  }, [fetchTaxes, searchQuery, filterStatus]);

  // Handle status filter change
  const handleStatusFilterChange = useCallback((status: string) => {
    setFilterStatus(status);
    setCurrentPage(1);
    fetchTaxes(1, searchQuery, status);
  }, [fetchTaxes, searchQuery]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    fetchTaxes(currentPage, searchQuery, filterStatus);
  }, [fetchTaxes, currentPage, searchQuery, filterStatus]);

  // Handle tax actions
  const handleViewTax = useCallback((tax: Tax) => {
    navigate(`/taxes/view/${tax.id}`);
  }, [navigate]);

  const handleEditTax = useCallback((tax: Tax) => {
    navigate(`/taxes/edit/${tax.id}`);
  }, [navigate]);

  const handleDeleteTax = useCallback((tax: Tax) => {
    setTaxToDelete(tax);
    setShowDeleteModal(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!taxToDelete) return;

    try {
      await taxApi.delete(taxToDelete.id);
      showToast('success', 'Tax deleted successfully');
      setShowDeleteModal(false);
      setTaxToDelete(null);
      fetchTaxes(currentPage, searchQuery, filterStatus);
    } catch (error) {
      showToast('error', 'Failed to delete tax');
    }
  }, [taxToDelete, fetchTaxes, currentPage, searchQuery, filterStatus, showToast]);

  // Table columns
  const columns = [
    {
      key: 'name',
      header: 'Tax Name',
      sortable: true,
      render: (tax: Tax) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Calculator className="h-5 w-5 text-indigo-600" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-gray-900 truncate">
              {tax.name}
            </div>
            <div className="text-sm text-gray-500">
              {tax.tax_type_text}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'rate',
      header: 'Rate',
      render: (tax: Tax) => (
        <div className="text-sm text-gray-600">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {tax.formatted_rate}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (tax: Tax) => {
        return (
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tax.status)}`}
          >
            {getStatusText(tax.status)}
          </span>
        );
      },
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (tax: Tax) => (
        <div className="text-sm text-gray-600">
          {formatDate(tax.created_at)}
        </div>
      ),
    },
  ];

  // Actions column
  const actionsColumn = {
    key: 'actions',
    header: 'Actions',
    width: '25%',
    render: (tax: Tax) => (
      <div className="flex items-center gap-1 overflow-x-auto">
        {safeCanViewTaxes() && (
          <Button
            onClick={() => handleViewTax(tax)}
            variant="outline"
            size="sm"
            leftIcon={<Eye className="h-4 w-4" />}
            className="whitespace-nowrap"
            title="View Tax"
          >
            <span className="hidden sm:inline">View</span>
          </Button>
        )}
        {safeCanUpdateTaxes() && (
          <Button
            onClick={() => handleEditTax(tax)}
            variant="outline"
            size="sm"
            leftIcon={<Edit className="h-4 w-4" />}
            className="whitespace-nowrap"
            title="Edit Tax"
          >
            <span className="hidden sm:inline">Edit</span>
          </Button>
        )}
        {safeCanDeleteTaxes() && (
          <Button
            onClick={() => handleDeleteTax(tax)}
            variant="outline"
            size="sm"
            leftIcon={<Trash2 className="h-4 w-4" />}
            className="whitespace-nowrap"
            title="Delete Tax"
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
          <h1 className="text-2xl font-bold text-gray-900">Taxes Management</h1>
          <p className="text-gray-600 mt-1">Manage your store taxes and tax rates</p>
        </div>
        {safeCanUpdateTaxes() && (
          <Button
            onClick={() => navigate('/taxes/add')}
            leftIcon={<Plus className="h-4 w-4" />}
            className="w-full sm:w-auto"
          >
            Add Tax
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
                placeholder="Search taxes..."
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

      {/* Taxes Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Calculator className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Taxes</h3>
                <p className="text-sm text-gray-600">{totalTaxes} taxes found</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table
            data={taxes}
            columns={columnsWithActions}
            loading={loading}
            pagination={{
              currentPage,
              totalPages,
              onPageChange: handlePageChange,
            }}
            keyField="id"
            emptyMessage="No taxes found"
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Tax"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete <strong>{taxToDelete?.name}</strong>? 
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

export default TaxList;
