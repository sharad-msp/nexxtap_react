import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search,
  RefreshCw,
  Users,
  Smartphone
} from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardContent,
  Table,
  Button,
  StandardDropdown,
  Modal,
  Input,
  DeviceLogsModal
} from '@/components';
import { userApi } from '@/api';
import { formatDate } from '@/utils/formatDate';
import { getStatusColor, getStatusText } from '@/utils/statusColors';
import type { User } from '@/types/user.types';
import { usePermissions } from '@/hooks/usePermissions';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useToast } from '@/components/Toast';

const UserList: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { 
    canViewUsers, 
    canCreateUsers, 
    canUpdateUsers
  } = usePermissions();
  
  usePageTitle({ title: 'Users Management' });
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  
  const [showDeviceLogsModal, setShowDeviceLogsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Fetch users
  const fetchUsers = useCallback(async (page = 1, search = '', status = 'all') => {
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

      const response = await userApi.getAll(params);
      setUsers(response.data);
      setTotalPages(response.meta.last_page);
      setTotalUsers(response.meta.total || 0);
      setIsInitialized(true);
    } catch (error) {
      console.error('Error fetching users:', error);
      showToast('error', 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [loading, showToast]);

  useEffect(() => {
    if (!isInitialized) {
      fetchUsers(currentPage, searchQuery, filterStatus);
    }
  }, [fetchUsers, currentPage, searchQuery, filterStatus, isInitialized]);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    fetchUsers(1, query, filterStatus);
  }, [fetchUsers, filterStatus]);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    fetchUsers(page, searchQuery, filterStatus);
  }, [fetchUsers, searchQuery, filterStatus]);

  // Handle status filter change
  const handleStatusFilterChange = useCallback((status: string) => {
    setFilterStatus(status);
    setCurrentPage(1);
    fetchUsers(1, searchQuery, status);
  }, [fetchUsers, searchQuery]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    fetchUsers(currentPage, searchQuery, filterStatus);
  }, [fetchUsers, currentPage, searchQuery, filterStatus]);

  // Handle user actions
  const handleViewUser = useCallback((user: User) => {
    navigate(`/users/view/${user.id}`);
  }, [navigate]);

  const handleEditUser = useCallback((user: User) => {
    // Check if user is store admin (is_store_admin = 1)
    if (user.is_store_admin == true) {
      showToast('error', 'Cannot edit store admin user');
      return;
    }
    
    navigate(`/users/edit/${user.id}`);
  }, [navigate, showToast]);

  const handleDeleteUser = useCallback((user: User) => {
    // Check if user is store admin (is_store_admin = 1)
    if (user.is_store_admin == true) {
      showToast('error', 'Cannot delete store admin user');
      return;
    }
    
    setUserToDelete(user);
    setShowDeleteModal(true);
  }, [showToast]);

  const handleViewDeviceLogs = useCallback((user: User) => {
    setSelectedUser(user);
    setShowDeviceLogsModal(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!userToDelete) return;

    try {
      await userApi.delete(userToDelete.id);
      showToast('success', 'User deleted successfully');
      setShowDeleteModal(false);
      setUserToDelete(null);
      fetchUsers(currentPage, searchQuery, filterStatus);
    } catch (error) {
      showToast('error', 'Failed to delete user');
    }
  }, [userToDelete, fetchUsers, currentPage, searchQuery, filterStatus, showToast]);

  // Table columns
  const columns = [
    {
      key: 'name',
      header: 'User Name',
      sortable: true,
      render: (user: User) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-indigo-600" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-gray-900 truncate">
              {user.name}
            </div>
            <div className="text-sm text-gray-500">
              {user.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'roles',
      header: 'Roles',
      render: (user: User) => (
        <div className="text-sm text-gray-600">
          {user.roles && Array.isArray(user.roles) && user.roles.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {user.roles.slice(0, 2).map((role) => (
                <span key={role.id} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  {role.name?.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </span>
              ))}
              {user.roles.length > 2 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  +{user.roles.length - 2} more
                </span>
              )}
            </div>
          ) : (
            <span className="text-gray-400">No roles</span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (user: User) => {
        return (
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}
          >
            {getStatusText(user.status)}
          </span>
        );
      },
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (user: User) => (
        <div className="text-sm text-gray-600">
          {formatDate(user.created_at)}
        </div>
      ),
    }
  ];

  // Actions column
  const actionsColumn = {
    key: 'actions',
    header: 'Actions',
    width: '25%',
    render: (user: User) => (
      <div className="flex items-center gap-1 overflow-x-auto">
        {canViewUsers() && (
          <Button
            onClick={() => handleViewUser(user)}
            variant="outline"
            size="sm"
            leftIcon={<Eye className="h-4 w-4" />}
            className="whitespace-nowrap"
            title="View User"
          >
            <span className="hidden sm:inline">View</span>
          </Button>
        )}
        {canViewUsers() && (
          <Button
            onClick={() => handleViewDeviceLogs(user)}
            variant="outline"
            size="sm"
            leftIcon={<Smartphone className="h-4 w-4" />}
            className="whitespace-nowrap"
            title="View Device Logs"
          >
            <span className="hidden sm:inline">Logs</span>
          </Button>
        )}
        {canUpdateUsers() && (
          <Button
            onClick={() => handleEditUser(user)}
            disabled={!!user.is_store_admin}
            variant="outline"
            size="sm"
            leftIcon={<Edit className="h-4 w-4" />}
            className="whitespace-nowrap"
            title={user.is_store_admin ? 'Cannot edit store admin user' : 'Edit User'}
          >
            <span className="hidden sm:inline">Edit</span>
          </Button>
        )}
        {canUpdateUsers() && (
          <Button
            onClick={() => handleDeleteUser(user)}
            disabled={!!user.is_store_admin}
            variant="outline"
            size="sm"
            leftIcon={<Trash2 className="h-4 w-4" />}
            className="whitespace-nowrap"
            title={user.is_store_admin ? 'Cannot delete store admin user' : 'Delete User'}
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
          <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-600 mt-1">Manage your application users and permissions</p>
        </div>
        {canCreateUsers() && (
          <Button
            onClick={() => navigate('/users/add')}
            leftIcon={<Plus className="h-4 w-4" />}
            className="w-full sm:w-auto"
          >
            Add User
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
                placeholder="Search users..."
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

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Users</h3>
                <p className="text-sm text-gray-600">{totalUsers} users found</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table
            data={users}
            columns={columnsWithActions}
            loading={loading}
            pagination={{
              currentPage,
              totalPages,
              onPageChange: handlePageChange,
            }}
            keyField="id"
            emptyMessage="No users found"
          />
        </CardContent>
      </Card>



      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete User"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete <strong>{userToDelete?.name}</strong>? 
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

      {/* Device Logs Modal */}
      <DeviceLogsModal
        isOpen={showDeviceLogsModal}
        onClose={() => setShowDeviceLogsModal(false)}
        userId={selectedUser?.id || 0}
        userName={selectedUser?.name || ''}
      />
    </div>
  );
};

export default UserList;
