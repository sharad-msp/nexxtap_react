import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { SelectField } from '@/components/SelectField';
import { useRoleStore } from '@/store/roleStore';
import { validateRequired } from '@/utils/validators';
import { formatRoleName } from '@/utils/formatRoleName';
import { getPermissionDisplayName, formatModuleName, filterPermissionsByRoleType } from '@/utils/formatPermissionName';
import { getRoleTypeOptions, getRoleTypeDescription } from '@/utils/formatRoleType';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardHeader, CardContent, useToast } from '@/components';
import { usePageTitle } from '@/hooks/usePageTitle';
import type { RoleType } from '@/types/role.types';
import { EditPageSkeleton } from '@/components/Skeleton/EditDetails';

const RoleEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const { permissions, fetchPermissions, getRoleDetails, addOrUpdateRole } = useRoleStore();
  const { canUpdateRoles } = usePermissions();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    role_type: '' as RoleType | '' | null,
    status: 1,
    permissions: [] as number[],
    is_default: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  usePageTitle({ title: 'Edit Role' });

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  useEffect(() => {
    const fetchRoleData = async () => {
      if (!id) return;

      try {
        setIsLoadingData(true);
        const role = await getRoleDetails(parseInt(id));
        
        if (!role) {
          showToast('error', 'Role not found');
          navigate('/roles');
          return;
        }

        // Allow editing default roles but only permissions, not the name

        setFormData({
          name: role.name,
          role_type: role.role_type || '',
          status: typeof role.status === 'boolean' ? (role.status ? 1 : 0) : role.status,
          permissions: role.permissions?.map(p => p.id) || [],
          is_default: role.is_default,
        });
      } catch (error) {
        showToast('error', 'Failed to load role data');
        navigate('/roles');
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchRoleData();
  }, [id, getRoleDetails, showToast, navigate]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Clear selected permissions when role type changes
      if (field === 'role_type') {
        newData.permissions = [];
      }
      
      return newData;
    });
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePermissionChange = (permissionId: number, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: checked
        ? [...prev.permissions, permissionId]
        : prev.permissions.filter(id => id !== permissionId)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!validateRequired(formData.name)) {
      newErrors.name = 'Role name is required';
    }

    if (!validateRequired(formData.role_type || '')) {
      newErrors.role_type = 'Role type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !id) {
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        role_type: formData.role_type || null,
        role_id: parseInt(id),
        is_update: 1,
      };

      await addOrUpdateRole(payload);
      showToast('success', 'Role updated successfully');
      navigate('/roles');
    } catch (error: any) {
      showToast('error', error.message || 'Failed to update role');
    } finally {
      setIsLoading(false);
    }
  }, [formData, id, addOrUpdateRole, showToast, navigate]);

  if (isLoadingData) {
    return (
      <EditPageSkeleton />
    );
  }

  // Check permission
  if (!canUpdateRoles()) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Access Denied</p>
        <Button onClick={() => navigate('/roles')} className="mt-4">
          Back to Roles
        </Button>
      </div>
    );
  }

  // Filter permissions based on selected role type
  const filteredPermissions = filterPermissionsByRoleType(permissions, formData.role_type || '');
  
  const groupedPermissions = filteredPermissions.reduce((acc, permission) => {
    const module = permission.module || permission.name.split('_')[0] || 'other';
    if (!acc[module]) {
      acc[module] = [];
    }
    acc[module].push(permission);
    return acc;
  }, {} as Record<string, typeof filteredPermissions>);

  // Status options for dropdown
  const statusOptions = [
    { value: 1, label: 'Active' },
    { value: 0, label: 'Inactive' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate('/roles')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Role: {formData.name ? formatRoleName(formData.name) : ''}</h1>
            <p className="text-gray-600">Update role information and permissions</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Role Information</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Role Name"
            disabled={formData.is_default}
            value={formData.name}
            onChange={(value) => handleInputChange('name', value)}
            error={errors.name}
            required
            placeholder="Enter role name"
          />
          
          <SelectField
            label="Role Type"
            value={formData.role_type || ''}
            onChange={(value) => handleInputChange('role_type', value)}
            options={getRoleTypeOptions()}
            placeholder="Select role type"
            disabled={formData.is_default}
            error={errors.role_type}
            required
          />
        </div>

        {formData.role_type && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Role Type:</strong> {getRoleTypeDescription(formData.role_type as RoleType)}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SelectField
            label="Status"
            value={formData.status}
            onChange={(value) => handleInputChange('status', parseInt(value))}
            options={statusOptions}
            placeholder="Select status"
            required
            disabled={formData.is_default}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Permissions <span className="text-red-500">*</span>
          </label>
          
          {formData.role_type && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Filtered Permissions:</strong> Showing only permissions relevant to the <strong>{formData.role_type.toUpperCase()}</strong> role type. 
                {filteredPermissions.length === 0 && ' No permissions available for this role type.'}
              </p>
            </div>
          )}
          
          {!formData.role_type && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Please select a role type to see relevant permissions.
              </p>
            </div>
          )}
          
          <div className="space-y-4">
            {formData.role_type ? (
              Object.entries(groupedPermissions).length > 0 ? (
                Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
                  <div key={module} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">
                      {formatModuleName(module)}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {modulePermissions.map((permission) => (
                        <label key={permission.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={formData.permissions.includes(permission.id)}
                            onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-sm text-gray-700">{getPermissionDisplayName(permission)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No permissions available for the selected role type.</p>
                </div>
              )
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Please select a role type to see available permissions.</p>
              </div>
            )}
          </div>
          {formData.role_type && formData.permissions.length === 0 && (
            <p className="mt-1 text-sm text-red-600">Please select at least one permission</p>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/roles')}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={isLoading}
            disabled={isLoading || !formData.role_type || formData.permissions.length === 0}
          >
            <Shield className="h-4 w-4 mr-2" />
            Update Role
          </Button>
        </div>
      </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default RoleEdit;
