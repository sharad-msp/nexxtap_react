import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Store as StoreIcon,
  MapPin,
  Phone,
  Mail,
  LogIn,
  Clock,
  Building,
  Search,
  RefreshCw,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardContent,
  Table,
  Button,
  Modal,
  Badge,
  Input,
  FullPageLoader, 
  useToast,
  StandardDropdown
} from '@/components';
import { storeApi } from '@/api';
import { useAuthStore } from '@/store/authStore';
import { getStatusBadgeVariant } from '@/utils/statusColors';
import { formatDate } from '@/utils/formatDate';
import { usePageTitle } from '@/hooks/usePageTitle';
import type { Store } from '@/types/store.types';


const StoreList: React.FC = () => {
  const { showToast } = useToast();

  const navigate = useNavigate();
  const { autoStoreLogin } = useAuthStore();
  
  usePageTitle({ title: 'Stores Management' });
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState<Store | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  // const [adminPermissions, setAdminPermissions] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch stores with admin API response structure - using useCallback to prevent unnecessary re-renders
  const fetchStores = useCallback(async (page = 1, search = '', status = 'all') => {
    if (loading) return; // Prevent multiple simultaneous requests
    
    setLoading(true);
    try {
      const params: any = {
        page,
        per_page: 10,
        search
      };
      
      if (status !== 'all') {
        params.status = status === '1' ? 1 : 0;
      }

      const response = await storeApi.getAll(params);
      
      // Handle admin API response structure
      if (response.status === 1) {
        setStores(response.data);
        setTotalPages(response.meta.last_page);
        setTotalItems(response.meta.total);
        
        // Store admin permissions if available
        // if (response.admin_permissions) {
        //   setAdminPermissions(response.admin_permissions);
        // }
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
      showToast('error', 'Failed to fetch stores');
    } finally {
      setLoading(false);
    }
  }, [loading]);

  // Initialize data only once
  useEffect(() => {
    if (!isInitialized) {
      fetchStores(currentPage, searchQuery, filterStatus);
      setIsInitialized(true);
    }
  }, [isInitialized, fetchStores, currentPage, searchQuery, filterStatus]);

  // Handle filter changes after initialization
  useEffect(() => {
    if (isInitialized) {
      fetchStores(currentPage, searchQuery, filterStatus);
    }
  }, [filterStatus]);

  // Handle search with debounce
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    // Trigger search immediately
    fetchStores(1, query, filterStatus);
  }, [fetchStores, filterStatus]);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    fetchStores(page, searchQuery, filterStatus);
  }, [fetchStores, searchQuery, filterStatus]);

  // Handle status filter change
  const handleStatusFilterChange = useCallback((status: string) => {
    setFilterStatus(status);
    setCurrentPage(1);
    fetchStores(1, searchQuery, status);
  }, [fetchStores, searchQuery]);

  // Handle store actions
  const handleViewStore = useCallback((store: Store) => {
    navigate(`/stores/view/${store.id}`);
  }, [navigate]);

  const handleEditStore = useCallback((store: Store) => {
    navigate(`/stores/edit/${store.id}`);
  }, [navigate]);

  const handleDeleteStore = useCallback((store: Store) => {
    setStoreToDelete(store);
    setShowDeleteModal(true);
  }, []);

  // Store login functionality - Enhanced with SweetAlert2 confirmation
  const handleStoreLogin = useCallback(async (store: Store) => {
    try {
      // Show SweetAlert2 confirmation dialog
      const result = await Swal.fire({
        title: 'Login to Store',
        html: `
          <div class="text-left">
            <p class="text-gray-600 mb-4">You are about to login to:</p>
            <div class="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 class="font-semibold text-gray-900">${store.name}</h3>
              <p class="text-sm text-gray-600">${store.address}</p>
              <p class="text-sm text-gray-600">${store.city}, ${store.state}</p>
            </div>
            <p class="text-gray-600">Do you want to proceed with the login?</p>
          </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, Login',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#ef4444',
        buttonsStyling: true,
        customClass: {
          popup: 'swal2-popup-custom',
          title: 'swal2-title-custom',
          htmlContainer: 'swal2-html-custom',
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom'
        }
      });

      // Handle user choice
      if (result.isConfirmed) {
        // Login to store
        showToast('info', 'Logging in to store...');
        await autoStoreLogin(store.id);
        showToast('success', `Successfully logged in to ${store.name}`);
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      }
    } catch (error: any) {
      console.error('Error logging into store:', error);
      
      // Show specific error message with SweetAlert2
      let errorMessage = 'Failed to login to store';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      await Swal.fire({
        title: 'Login Failed',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ef4444'
      });
    }
  }, [autoStoreLogin, navigate, showToast]);

  const confirmDelete = useCallback(async () => {
    if (!storeToDelete) return;

    try {
      const response = await storeApi.delete(storeToDelete.id);
      
      if (response.status === 1) {
        showToast('success', 'Store deleted successfully');
        setShowDeleteModal(false);
        setStoreToDelete(null);
        fetchStores(currentPage, searchQuery, filterStatus);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error deleting store:', error);
      showToast('error', 'Failed to delete store');
    }
  }, [storeToDelete, fetchStores, currentPage, searchQuery, filterStatus]);

  const handleStatusToggle = useCallback(async (store: Store) => {
    try {
      const response = await storeApi.updateStatus(store.id, !store.status);
      
      if (response.status === 1) {
        showToast('success', 'Store status updated successfully');
        fetchStores(currentPage, searchQuery, filterStatus);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error updating store status:', error);
      showToast('error', 'Failed to update store status');
    }
  }, [fetchStores, currentPage, searchQuery, filterStatus]);


  const handleRefresh = useCallback(() => {
    fetchStores(currentPage, searchQuery, filterStatus);
  }, [fetchStores, currentPage, searchQuery, filterStatus]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Store Management</h1>
          <p className="text-gray-600 mt-1">Manage all stores and their settings</p>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Button 
            variant="outline"
            onClick={handleRefresh}
            disabled={loading}
            leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
            size="sm"
            className="h-10"
          >
            Refresh
          </Button>
          <Button 
            onClick={() => navigate('/stores/add')}
            className="flex items-center gap-2"
            leftIcon={<Plus className="w-4 h-4" />}
            size="sm"
          >
            <span className="hidden sm:inline">Add Store</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 lg:max-w-md">
              <Input
                placeholder="Search stores by name, email, or phone..."
                value={searchQuery}
                onChange={handleSearch}
                leftIcon={<Search className="w-4 h-4" />}
                variant="filled"
              />
            </div>
            <div className="flex gap-2 sm:gap-3 lg:w-48">
              <StandardDropdown
                value={filterStatus}
                onChange={handleStatusFilterChange}
                options={[
                  { value: 'all', label: 'All' },
                  { value: '1', label: 'Active' },
                  { value: '0', label: 'Inactive' }
                ]}
                placeholder="Filter by status"
                size="md"
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stores Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Stores ({totalItems})</h2>
          </div>
        </CardHeader>
        <CardContent>
          <Table
            loading={loading}
            data={stores}
            columns={[
              {
                key: 'sr_no',
                header: 'Sr No',
                width: '8%',
                align: 'center' as const,
                render: (store) => (
                  <div className="text-sm font-medium text-gray-600">
                    {stores.indexOf(store) + 1 + ((currentPage - 1) * 10)}
                  </div>
                )
              },
              {
                key: 'store',
                header: 'Store',
                width: '25%',
                render: (store) => (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <StoreIcon className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-gray-900 truncate text-sm">{store.name}</div>
                      <div className="text-sm text-gray-500 truncate">{store.address}</div>
                    </div>
                  </div>
                )
              },
              {
                key: 'actions',
                header: 'Actions',
                width: '35%',
                render: (store) => (
                  <div className="flex items-center gap-1 overflow-x-auto">
                    <Button
                      onClick={() => handleViewStore(store)}
                      variant="outline"
                      size="sm"
                      leftIcon={<Eye className="h-4 w-4" />}
                      className="whitespace-nowrap"
                      title="View Store"
                    >
                      <span className="hidden sm:inline">Overview</span>
                    </Button>
                    <Button
                      onClick={() => handleEditStore(store)}
                      variant="outline"
                      size="sm"
                      leftIcon={<Edit className="h-4 w-4" />}
                      className="whitespace-nowrap"
                      title="Edit Store"
                    >
                      <span className="hidden sm:inline">Edit</span>
                    </Button>
                    <Button
                      onClick={() => handleStoreLogin(store)}
                      variant="outline"
                      size="sm"
                      leftIcon={<LogIn className="h-4 w-4" />}
                      className="hidden sm:flex whitespace-nowrap"
                      title="Login to Store"
                    >
                      Login
                    </Button>
                    <Button
                      onClick={() => handleStatusToggle(store)}
                      variant="outline"
                      size="sm"
                      leftIcon={store.status ? 
                        <ToggleRight className="h-4 w-4" /> : 
                        <ToggleLeft className="h-4 w-4" />
                      }
                      className="hidden sm:flex whitespace-nowrap"
                      title={store.status ? 'Deactivate Store' : 'Activate Store'}
                    >
                      {store.status ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      onClick={() => handleDeleteStore(store)}
                      variant="outline"
                      size="sm"
                      leftIcon={<Trash2 className="h-4 w-4" />}
                      className="whitespace-nowrap"
                      title="Delete Store"
                    >
                      <span className="hidden sm:inline">Delete</span>
                    </Button>
                  </div>
                )
              },
              {
                key: 'contact',
                header: 'Contact',
                width: '20%',
                hideOnMobile: true,
                render: (store) => (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-900 truncate">{store.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-900 truncate">{store.email}</span>
                    </div>
                  </div>
                )
              },
              {
                key: 'location',
                header: 'Location',
                width: '15%',
                hideOnMobile: true,
                render: (store) => (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-900 truncate">{store.city}, {store.state}</span>
                  </div>
                )
              },
              {
                key: 'business',
                header: 'Business',
                width: '12%',
                hideOnMobile: true,
                render: (store) => (
                  <div className="flex items-center gap-2 text-sm">
                    <Building className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-900 truncate">{store.business_type}</span>
                  </div>
                )
              },
              {
                key: 'hours',
                header: 'Hours',
                width: '15%',
                hideOnMobile: true,
                render: (store) => (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-900 truncate">{store.store_hours_from} - {store.store_hours_to}</span>
                  </div>
                )
              },
              {
                key: 'status',
                header: 'Status',
                width: '8%',
                align: 'center' as const,
                render: (store) => (
                  <Badge
                    variant={getStatusBadgeVariant(store.status)}
                    dot
                    size="sm"
                  >
                    {store.status_text}
                  </Badge>
                )
              },
              {
                key: 'created_at',
                header: 'Created',
                width: '12%',
                hideOnMobile: true,
                render: (store) => (
                  <div className="text-sm text-gray-600">
                    {formatDate(store.created_at)}
                  </div>
                )
              }
            ]}
            keyField="id"
            emptyMessage="No stores found"
            striped={true}
            hover={true}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
              <div className="text-sm text-gray-600">
                Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalItems)} of {totalItems} stores
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="px-3 py-2 text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Delete"
      >
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            Are you sure you want to delete the store "{storeToDelete?.name}"? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Full Page Loader - Only show during initial load */}
      <FullPageLoader isLoading={loading && !isInitialized} text="Loading stores..." />
    </div>
  );
};

export default StoreList;
