import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { SelectField } from '@/components/SelectField';
import { useRoleStore } from '@/store/roleStore';
import { validateRequired } from '@/utils/validators';
import { getPermissionDisplayName, formatModuleName, filterPermissionsByRoleType } from '@/utils/formatPermissionName';
import { getRoleTypeOptions, getRoleTypeDescription } from '@/utils/formatRoleType';
import { usePermissions } from '@/hooks/usePermissions';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Card, CardContent, CardHeader, useToast } from '@/components';
import type { RoleType } from '@/types/role.types';

const RoleAdd: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { permissions, fetchPermissions, addOrUpdateRole } = useRoleStore();
  const { canCreateRoles } = usePermissions();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role_type: '' as RoleType | '',
    status: 1, // Default to active
    permissions: [] as number[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  usePageTitle({ title: 'Add Role' });

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

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

    if (!validateRequired(formData.role_type)) {
      newErrors.role_type = 'Role type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        role_type: formData.role_type || null,
        is_update: 0,
      };

      await addOrUpdateRole(payload);
      showToast('success', 'Role created successfully');
      navigate('/roles');
    } catch (error: any) {
      showToast('error', error.message || 'Failed to create role');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter permissions based on selected role type
  const filteredPermissions = filterPermissionsByRoleType(permissions, formData.role_type);
  
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

  // Check permission
  if (!canCreateRoles()) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">You don't have permission to create roles.</p>
        </div>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold text-gray-900">Add Role</h1>
            <p className="text-gray-600">Create a new role with specific permissions</p>
          </div>
        </div>
      </div>
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Role Information</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Role Name"
                value={formData.name}
                onChange={(value) => handleInputChange('name', value)}
                error={errors.name}
                required
                placeholder="Enter role name"
              />
              
              <SelectField
                label="Role Type"
                value={formData.role_type}
                onChange={(value) => handleInputChange('role_type', value)}
                options={getRoleTypeOptions()}
                placeholder="Select role type"
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
                Create Role
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleAdd;
