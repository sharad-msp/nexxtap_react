import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search,
  RefreshCw,
  Shield,
  Key
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
import { roleApi } from '@/api';
import { formatDate } from '@/utils/formatDate';
import { getStatusColor, getStatusText } from '@/utils/statusColors';
import type { Role } from '@/types/role.types';
import { usePermissions } from '@/hooks/usePermissions';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useToast } from '@/components';
import { formatRoleName } from '@/utils/formatRoleName';
import { formatRoleType, getRoleTypeBadgeColor } from '@/utils/formatRoleType';

const RoleList: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { 
    canViewRoles, 
    canCreateRoles, 
    canUpdateRoles, 
    canDeleteRoles
  } = usePermissions();
  
  usePageTitle({ title: 'Roles Management' });
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRoles, setTotalRoles] = useState(0);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Fetch roles
  const fetchRoles = useCallback(async (page = 1, search = '', status = 'all') => {
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

      const response = await roleApi.getAll(params);
      setRoles(response.data);
      setTotalPages(response.meta.last_page);
      setTotalRoles(response.meta.total || 0);
      setIsInitialized(true);
    } catch (error) {
      console.error('Error fetching roles:', error);
      showToast('error', 'Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  }, [loading, showToast]);

  useEffect(() => {
    if (!isInitialized) {
      fetchRoles(currentPage, searchQuery, filterStatus);
    }
  }, [fetchRoles, currentPage, searchQuery, filterStatus, isInitialized]);

  // Handle filter changes after initialization
  useEffect(() => {
    if (isInitialized) {
      fetchRoles(currentPage, searchQuery, filterStatus);
    }
  }, [filterStatus]);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    fetchRoles(1, query, filterStatus);
  }, [fetchRoles, filterStatus]);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    fetchRoles(page, searchQuery, filterStatus);
  }, [fetchRoles, searchQuery, filterStatus]);

  // Handle status filter change
  const handleStatusFilterChange = useCallback((status: string) => {
    setFilterStatus(status);
    setCurrentPage(1);
    fetchRoles(1, searchQuery, status);
  }, [fetchRoles, searchQuery]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    fetchRoles(currentPage, searchQuery, filterStatus);
  }, [fetchRoles, currentPage, searchQuery, filterStatus]);

  // Handle role actions
  const handleViewRole = useCallback((role: Role) => {
    navigate(`/roles/view/${role.id}`);
  }, [navigate]);

  const handleEditRole = useCallback((role: Role) => {
    navigate(`/roles/edit/${role.id}`);
  }, [navigate]);

  const handleDeleteRole = useCallback((role: Role) => {
    setRoleToDelete(role);
    setShowDeleteModal(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!roleToDelete) return;

    try {
      await roleApi.delete(roleToDelete.id);
      showToast('success', 'Role deleted successfully');
      setShowDeleteModal(false);
      setRoleToDelete(null);
      fetchRoles(currentPage, searchQuery, filterStatus);
    } catch (error) {
      showToast('error', 'Failed to delete role');
    }
  }, [roleToDelete, fetchRoles, currentPage, searchQuery, filterStatus]);



  // Table columns
  const columns = [
    {
      key: 'name',
      header: 'Role Name',
      sortable: true,
      render: (role: Role) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-indigo-600" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-gray-900 truncate">
              {formatRoleName(role.name)}
              {role.is_default && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                  Default
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500">
              {role.users_count || 0} users
            </div>
          </div>
        </div>
      ),
    },

    {
      key: 'role_type',
      header: 'Role Type',
      render: (role: Role) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleTypeBadgeColor(role.role_type)}`}>
          {formatRoleType(role.role_type)}
        </span>
      ),
    },

    {
      key: 'permissions',
      header: 'Permissions',
      render: (role: Role) => (
        <div className="flex items-center space-x-2">
          <Key className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            {role.permissions?.length || 0} permissions
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (role: Role) => {
        return (
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(role.status)}`}
          >
            {getStatusText(role.status)}
          </span>
        );
      },
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (role: Role) => (
        <div className="text-sm text-gray-600">
          {formatDate(role.created_at)}
        </div>
      ),
    },
  ];

  // Actions column
  const actionsColumn = {
    key: 'actions',
    header: 'Actions',
    width: '25%',
    render: (role: Role) => (
      <div className="flex items-center gap-1 overflow-x-auto">
        {canViewRoles() && (
          <Button
            onClick={() => handleViewRole(role)}
            variant="outline"
            size="sm"
            leftIcon={<Eye className="h-4 w-4" />}
            className="whitespace-nowrap"
            title="View Role"
          >
            <span className="hidden sm:inline">View</span>
          </Button>
        )}
        {canUpdateRoles() && (
          <Button
            onClick={() => handleEditRole(role)}
            variant="outline"
            size="sm"
            leftIcon={<Edit className="h-4 w-4" />}
            className="whitespace-nowrap"
            title="Edit Role"
          >
            <span className="hidden sm:inline">Edit</span>
          </Button>
        )}
        {canDeleteRoles() && (
          <Button
            onClick={() => handleDeleteRole(role)}
            disabled={role.is_default}
            variant="outline"
            size="sm"
            leftIcon={<Trash2 className="h-4 w-4" />}
            className="whitespace-nowrap"
            title={role.is_default ? 'Default roles cannot be deleted' : 'Delete Role'}
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
          <h1 className="text-2xl font-bold text-gray-900">Roles Management</h1>
          <p className="text-gray-600 mt-1">Manage user roles and permissions</p>
          <p className="text-sm text-indigo-600 mt-1">
            <Shield className="inline h-4 w-4 mr-1" />
            Default roles (store_admin, pos, kds) cannot be edited or deleted
          </p>
        </div>
                 {canCreateRoles() && (
           <Button
             onClick={() => navigate('/roles/add')}
             leftIcon={<Plus className="h-4 w-4" />}
             className="w-full sm:w-auto"
           >
             Add Role
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
                placeholder="Search roles..."
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

      {/* Roles Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Roles</h3>
                <p className="text-sm text-gray-600">{totalRoles} roles found</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table
            data={roles}
            columns={columnsWithActions}
            loading={loading}
            pagination={{
              currentPage,
              totalPages,
              onPageChange: handlePageChange,
            }}
            keyField="id"
            emptyMessage="No roles found"
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Role"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete <strong>{roleToDelete ? formatRoleName(roleToDelete.name) : ''}</strong>? 
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

export default RoleList;
