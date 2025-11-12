import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardContent,
  Form,
  FormInput,
  FormSelect,
  DevicePermissionsSection,
  Button,
  useToast,
  useForm
} from '@/components';
import { userApi } from '@/api';
import type { UserRole } from '@/types/user.types';
import { handleApiError, handleApiSuccess } from '@/utils/errorHandler';
import { usePageTitle } from '@/hooks/usePageTitle';

// Wrapper component to access form values and conditionally render DevicePermissionsSection
const DevicePermissionsWrapper: React.FC = () => {
  const { values } = useForm();
  const userRole = values.role;
  
  return <DevicePermissionsSection userRole={userRole} />;
};

const UserAdd: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<UserRole[]>([]);
  
  usePageTitle({ title: 'Add User' });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const rolesData = await userApi.getRoleList();
      setRoles(Array.isArray(rolesData.data) ? rolesData.data : []);
    } catch (error) {
      console.error('Error fetching roles:', error);
      showToast('error', 'Failed to fetch roles');
    }
  };

  const handleSubmit = async (values: any, setErrors: (errors: Record<string, string>) => void) => {
    setLoading(true);
    try {
      const response = await userApi.create({
        name: values.name,
        email: values.email,
        password: values.password,
        password_confirmation: values.password,
        role: values.role,
        status: true,
        auto_logout_enabled: values.auto_logout_enabled || false,
        auto_logout_type: values.auto_logout_enabled ? values.auto_logout_type : undefined,
        auto_logout_duration: values.auto_logout_enabled && values.auto_logout_type !== 'per_transaction' ? values.auto_logout_duration : undefined,
      });
      
      // Handle success response
      handleApiSuccess(
        response,
        setErrors,
        showToast,
        'User created successfully',
        () => navigate('/users')
      );
    } catch (error: any) {
      // Handle error response
      handleApiError(
        error,
        setErrors,
        showToast,
        'Failed to create user'
      );
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = roles.map(role => ({
    value: role.name,
    label: role.name,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/users')}
            className="text-gray-600 hover:text-gray-900"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Back to Users
          </Button>
        </div>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Add New User</h1>
        <p className="text-gray-600 mt-1">Create a new user in your system</p>
      </div>

      <div className="max-w-6xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">User Information</h2>
                <p className="text-sm text-gray-600">Basic user details and role assignment</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Form
              onSubmit={handleSubmit}
              loading={loading}
              submitText="Create User"
              cancelText="Cancel"
              onCancel={() => navigate('/users')}
              showCancel
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FormInput
                  name="name"
                  label="Full Name"
                  placeholder="Enter full name"
                  required
                  helperText="Enter the user's full name"
                  variant="filled"
                />

                <FormInput
                  name="email"
                  label="Email Address"
                  type="email"
                  placeholder="Enter email address"
                  required
                  helperText="Enter a valid email address"
                  variant="filled"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FormInput
                  name="password"
                  label="Password"
                  type="password"
                  placeholder="Enter password"
                  required
                  helperText="Password must be at least 8 characters"
                  variant="filled"
                />

                <FormSelect
                  name="role"
                  label="Role"
                  placeholder="Select a role"
                  options={roleOptions}
                  required
                  helperText="Select the user's role"
                  variant="filled"
                />
              </div>

              {/* Device Permissions Section */}
              <DevicePermissionsWrapper />

              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-indigo-900 mb-2">User Creation Guidelines</h4>
                <ul className="text-sm text-indigo-700 space-y-1">
                  <li>• Password must be at least 8 characters long</li>
                  <li>• Email must be unique and valid</li>
                  <li>• Role determines user permissions</li>
                  <li>• Auto-logout settings control POS device behavior</li>
                  <li>• Duration is required for time-based logout types</li>
                  <li>• User will receive an email notification</li>
                </ul>
              </div>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserAdd;
