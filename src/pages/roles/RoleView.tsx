import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Shield, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/Button';
import { useRoleStore } from '@/store/roleStore';
import { formatDate } from '@/utils/formatDate';
import { formatRoleName } from '@/utils/formatRoleName';
import { getPermissionDisplayName, formatModuleName } from '@/utils/formatPermissionName';
import { formatRoleType, getRoleTypeBadgeColor, getRoleTypeDescription } from '@/utils/formatRoleType';
import { usePermissions } from '@/hooks/usePermissions';
import { useToast } from '@/components';
import { usePageTitle } from '@/hooks/usePageTitle';
import { ViewDetailsSkeleton } from '@/components/Skeleton/ViewDetails';  

const RoleView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getRoleDetails } = useRoleStore();
  const { showToast } = useToast();
  const { canViewRoles, canUpdateRoles, canDeleteRoles } = usePermissions();
  const [role, setRole] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  usePageTitle({ title: 'View Role' });

  const fetchRoleData = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      const roleData = await getRoleDetails(parseInt(id));
      if (roleData) {
        setRole(roleData);
      } else {
        showToast('error', 'Role not found');
        navigate('/roles');
      }
    } catch (error) {
      showToast('error', 'Failed to load role data');
      navigate('/roles');
    } finally {
      setIsLoading(false);
    }
  }, [id, getRoleDetails, navigate, showToast]);

  useEffect(() => {
    fetchRoleData();
  }, [fetchRoleData]);



  if (isLoading) {
    return (
      <ViewDetailsSkeleton />
    );
  }

  if (!role) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Role not found</p>
        <Button onClick={() => navigate('/roles')} className="mt-4">
          Back to Roles
        </Button>
      </div>
    );
  }

  // Check permission
  if (!canViewRoles()) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">You don't have permission to view roles.</p>
        </div>
      </div>
    );
  }

  const groupedPermissions = role.permissions?.reduce((acc: any, permission: any) => {
    const module = permission.module || permission.name.split('_')[0] || 'other';
    if (!acc[module]) {
      acc[module] = [];
    }
    acc[module].push(permission);
    return acc;
  }, {}) || {};

  const isActive = typeof role.status === 'boolean' ? role.status : role.status === 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/roles')}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Roles
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          {canUpdateRoles() && (
            <Button
              onClick={() => navigate(`/roles/edit/${role.id}`)}
              // disabled={role.is_default}
              variant="primary"
              size="sm"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Role
            </Button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-indigo-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{formatRoleName(role.name)}</h1>
              <p className="text-gray-600">Role Details</p>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className="flex items-center space-x-2">
            {isActive ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Role Type</h3>
            <div className="mt-1">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleTypeBadgeColor(role.role_type)}`}>
                {formatRoleType(role.role_type)}
              </span>
              {role.role_type && (
                <p className="mt-2 text-xs text-gray-500">
                  {getRoleTypeDescription(role.role_type)}
                </p>
              )}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Status</h3>
            <div className="flex items-center space-x-2">
              {isActive ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span className="text-gray-900 font-medium">
                {isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Created</h3>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-gray-900">{formatDate(role.created_at)}</span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Last Updated</h3>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-gray-900">{formatDate(role.updated_at)}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Permissions ({role.permissions?.length || 0})
          </h3>
          
          {Object.keys(groupedPermissions).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(groupedPermissions).map(([module, modulePermissions]: [string, any]) => (
                <div key={module} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    {formatModuleName(module)}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {modulePermissions.map((permission: any) => (
                      <div key={permission.id} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-700">{getPermissionDisplayName(permission)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No permissions assigned to this role</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoleView;
