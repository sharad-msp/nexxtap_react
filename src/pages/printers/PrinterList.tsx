import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Eye, 
  Search,
  RefreshCw,
  Printer as PrinterIcon,
  Power,
  PowerOff,
  Trash2
} from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardContent,
  Table,
  Button,
  StandardDropdown,
  Modal,
  Input
} from '@/components';
import { printerApi } from '@/api';
import { formatDateTime } from '@/utils/formatDate';
import { getStatusColor, getStatusText } from '@/utils/statusColors';
import type { Printer } from '@/types/printer.types';
import { usePermissions } from '@/hooks/usePermissions';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useToast } from '@/components/Toast';

const PrinterList: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { 
    canViewPrinters, 
    canUpdatePrinters
  } = usePermissions();
  
  usePageTitle({ title: 'Printer Management' });
  const [allPrinters, setAllPrinters] = useState<Printer[]>([]); // Store original data
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [stats, setStats] = useState({
    total_printers: 0,
    active_printers: 0,
    inactive_printers: 0
  });
  
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [printerToUpdate, setPrinterToUpdate] = useState<Printer | null>(null);
  const [newStatus, setNewStatus] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [printerToDelete, setPrinterToDelete] = useState<Printer | null>(null);

  // Fetch printers
  const fetchPrinters = useCallback(async () => {
    setLoading(true);
    try {
      const response = await printerApi.getStorePrinters();
      if (response.status === 1) {
        const printerData = response.data || [];
        setAllPrinters(printerData); // Store original data
      } else {
        showToast('error', 'Failed to fetch printers');
      }
    } catch (error) {
      console.error('Error fetching printers:', error);
      showToast('error', 'Failed to fetch printers');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Fetch printer stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await printerApi.getStats();
      if (response.status === 1) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching printer stats:', error);
    }
  }, []);

  useEffect(() => {
    if (!isInitialized) {
      fetchPrinters();
      fetchStats();
      setIsInitialized(true);
    }
  }, [fetchPrinters, fetchStats, isInitialized]);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Handle status filter change
  const handleStatusFilterChange = useCallback((status: string) => {
    setFilterStatus(status);
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    fetchPrinters();
    fetchStats();
  }, [fetchPrinters, fetchStats]);

  // Handle printer actions
  const handleViewPrinter = useCallback((printer: Printer) => {
    navigate(`/printers/view/${printer.id}`);
  }, [navigate]);

  const handleUpdateStatus = useCallback((printer: Printer) => {
    setPrinterToUpdate(printer);
    setNewStatus(!printer.status);
    setShowStatusModal(true);
  }, []);

  const handleDeletePrinter = useCallback((printer: Printer) => {
    setPrinterToDelete(printer);
    setShowDeleteModal(true);
  }, []);

  const confirmStatusUpdate = useCallback(async () => {
    if (!printerToUpdate) return;

    try {
      const response = await printerApi.updateStatus(printerToUpdate.id, newStatus);
      if (response.status === 1) {
        showToast('success', `Printer ${newStatus ? 'enabled' : 'disabled'} successfully`);
        setShowStatusModal(false);
        setPrinterToUpdate(null);
        fetchPrinters();
        fetchStats();
      } else {
        showToast('error', response.message || 'Failed to update printer status');
      }
    } catch (error) {
      showToast('error', 'Failed to update printer status');
    }
  }, [printerToUpdate, newStatus, fetchPrinters, fetchStats, showToast]);

  const confirmDeletePrinter = useCallback(async () => {
    if (!printerToDelete) return;

    try {
      const response = await printerApi.delete(printerToDelete.id);
      if (response.status === 1) {
        showToast('success', 'Printer deleted successfully');
        setShowDeleteModal(false);
        setPrinterToDelete(null);
        fetchPrinters();
        fetchStats();
      } else {
        showToast('error', response.message || 'Failed to delete printer');
      }
    } catch (error) {
      showToast('error', 'Failed to delete printer');
    }
  }, [printerToDelete, fetchPrinters, fetchStats, showToast]);

  // Table columns
  const columns = [
    {
      key: 'name',
      header: 'Printer Name',
      sortable: true,
      render: (printer: Printer) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <PrinterIcon className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-gray-900 truncate">
              {printer.name}
            </div>
            <div className="text-sm text-gray-500">
              {printer.model_id || 'No model ID'}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (printer: Printer) => {
        return (
          <div className="flex items-center space-x-2">
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(printer.status)}`}
            >
              {getStatusText(printer.status)}
            </span>
            {printer.is_default && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Default
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (printer: Printer) => (
        <div className="text-sm text-gray-600">
          {printer.created_at ? formatDateTime(printer.created_at) : 'N/A'}
        </div>
      ),
    }
  ];

  // Actions column
  const actionsColumn = {
    key: 'actions',
    header: 'Actions',
    width: '25%',
    render: (printer: Printer) => (
      <div className="flex items-center gap-1 overflow-x-auto">
        {canViewPrinters() && (
          <Button
            onClick={() => handleViewPrinter(printer)}
            variant="outline"
            size="sm"
            leftIcon={<Eye className="h-4 w-4" />}
            className="whitespace-nowrap"
            title="View Printer"
          >
            <span className="hidden sm:inline">View</span>
          </Button>
        )}
        {canUpdatePrinters() && (
          <Button
            onClick={() => handleUpdateStatus(printer)}
            variant="outline"
            size="sm"
            leftIcon={printer.status ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
            className="whitespace-nowrap"
            title={printer.status ? 'Disable Printer' : 'Enable Printer'}
          >
            <span className="hidden sm:inline">{printer.status ? 'Disable' : 'Enable'}</span>
          </Button>
        )}
        {canUpdatePrinters() && (
          <Button
            onClick={() => handleDeletePrinter(printer)}
            variant="outline"
            size="sm"
            leftIcon={<Trash2 className="h-4 w-4" />}
            className="whitespace-nowrap text-red-600 hover:text-red-700 hover:bg-red-50"
            title="Delete Printer"
          >
            <span className="hidden sm:inline">Delete</span>
          </Button>
        )}
      </div>
    )
  };

  // Add actions column to columns array
  const columnsWithActions = [...columns, actionsColumn];

  // Filter printers based on search and status
  const filteredPrinters = allPrinters.filter(printer => {
    const matchesSearch = searchQuery === '' || 
      printer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      printer.model_id?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === '1' && printer.status) ||
      (filterStatus === '0' && !printer.status);
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Printer Management</h1>
          <p className="text-gray-600 mt-1">Manage store printers and their status</p>
        </div>
        <Button
          onClick={handleRefresh}
          leftIcon={<RefreshCw className="h-4 w-4" />}
          className="w-full sm:w-auto"
        >
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <PrinterIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Printers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_printers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Power className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active_printers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <PowerOff className="h-5 w-5 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Inactive</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inactive_printers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Search */}
            <div className="flex-1 max-w-sm">
              <Input
                placeholder="Search printers..."
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
          </div>
        </CardContent>
      </Card>

      {/* Printers Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <PrinterIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Printers</h3>
                <p className="text-sm text-gray-600">{filteredPrinters.length} printers found</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table
            data={filteredPrinters}
            columns={columnsWithActions}
            loading={loading}
            keyField="id"
            emptyMessage="No printers found"
          />
        </CardContent>
      </Card>

      {/* Status Update Confirmation Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title={`${newStatus ? 'Enable' : 'Disable'} Printer`}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to {newStatus ? 'enable' : 'disable'} <strong>{printerToUpdate?.name}</strong>?
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowStatusModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant={newStatus ? "primary" : "danger"}
              onClick={confirmStatusUpdate}
            >
              {newStatus ? 'Enable' : 'Disable'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Printer"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-gray-600">
                Are you sure you want to delete <strong>{printerToDelete?.name}</strong>?
              </p>
              <p className="text-sm text-red-600 mt-1">
                This action cannot be undone.
              </p>
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDeletePrinter}
            >
              Delete Printer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PrinterList;
