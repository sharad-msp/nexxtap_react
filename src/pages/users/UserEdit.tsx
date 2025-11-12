import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, User } from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardContent,
  Form,
  FormInput,
  FormSelect,
  DevicePermissionsSection,
  Button, useToast,
  useForm} from '@/components';
import { userApi } from '@/api';
import type { UserRole } from '@/types/user.types';
import { handleApiError, handleApiSuccess } from '@/utils/errorHandler';
import { usePageTitle } from '@/hooks/usePageTitle';
import { EditPageSkeleton } from '@/components/Skeleton/EditDetails';

// Wrapper component to access form values and conditionally render DevicePermissionsSection
const DevicePermissionsWrapper: React.FC = () => {
  const { values } = useForm();
  const userRole = values.role;
  
  return <DevicePermissionsSection userRole={userRole} />;
};

const UserEdit: React.FC = () => {
  const { showToast } = useToast();

  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [userData, setUserData] = useState<any>(null);
  
  usePageTitle({ title: 'Edit User' });

  useEffect(() => {
    fetchRoles();
    if (id) {
      fetchUserData();
    }
  }, [id]);

  const fetchRoles = async () => {
    try {
      const rolesData = await userApi.getRoleList();
      setRoles(Array.isArray(rolesData.data) ? rolesData.data : []);
    } catch (error) {
      console.error('Error fetching roles:', error);
      showToast('error', 'Failed to fetch roles');
    }
  };

  const fetchUserData = async () => {
    if (!id) return;

    try {
      setLoadingData(true);
      const response = await userApi.getById(parseInt(id));
      if (response.status === 1) {
        setUserData(response.data);
        
        // Check if user is store admin (is_store_admin = 1)
        if (response.data?.is_store_admin == true) {
          showToast('error', 'Cannot edit store admin user');
          navigate('/users');
          return;
        }
      } else {
        showToast('error', 'User not found');
        navigate('/users');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      showToast('error', 'Failed to load user data');
      navigate('/users');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (values: any, setErrors: (errors: Record<string, string>) => void) => {
    if (!id) return;

    // Check if user is store admin (is_store_admin = 1)
    if (userData?.is_store_admin == true || userData?.is_store_admin === 1) {
      showToast('error', 'Cannot edit store admin user');
      return;
    }

    setLoading(true);
    try {
      const response = await userApi.update(parseInt(id), {
        name: values.name,
        email: values.email,
        password: values.password || undefined, // Only send if provided
        role: values.role,
        status: values.status,
        auto_logout_enabled: values.auto_logout_enabled || false,
        auto_logout_type: values.auto_logout_enabled ? values.auto_logout_type : undefined,
        auto_logout_duration: values.auto_logout_enabled && values.auto_logout_type !== 'per_transaction' ? values.auto_logout_duration : undefined,
      });
      
      // Handle success response
      handleApiSuccess(
        response,
        setErrors,
        showToast,
        'User updated successfully',
        () => navigate('/users')
      );
    } catch (error: any) {
      // Handle error response
      handleApiError(
        error,
        setErrors,
        showToast,
        'Failed to update user'
      );
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = roles.map(role => ({
    value: role.name,
    label: role.name,
  }));
  const statusOptions = [
    { value: '1', label: 'Active' },
    { value: '0', label: 'Inactive' },
  ];

  if (loadingData) {
    return (
      <EditPageSkeleton />
    );
  }

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
        <h1 className="text-3xl font-bold text-gray-900">Edit User</h1>
        <p className="text-gray-600 mt-1">Update user information and role</p>
      </div>

      <div className="max-w-6xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">User Information</h2>
                <p className="text-sm text-gray-600">Update user details and role assignment</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Form
              onSubmit={handleSubmit}
              loading={loading}
              submitText="Update User"
              cancelText="Cancel"
              onCancel={() => navigate('/users')}
              showCancel
              initialValues={{
                user_id: userData?.id || '',
                name: userData?.name || '',
                email: userData?.email || '',
                password: '',
                role: userData?.roles?.[0]?.name || '',
                status: userData?.status==true ? '1' : '0',
                auto_logout_enabled: userData?.auto_logout_enabled || false,
                auto_logout_type: userData?.auto_logout_type || '',
                auto_logout_duration: userData?.auto_logout_duration || '',
              }}
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
                <FormSelect
                  name="role"
                  label="Role"
                  placeholder="Select a role"
                  options={roleOptions}
                  required
                  helperText="Select the user's role"
                  variant="filled"
                />
                 <FormSelect
                  name="status"
                  label="status"
                  placeholder="Select a status"
                  options={statusOptions}
                  required
                  helperText={userData?.roles?.[0]?.name === 'store_admin' ? "Store admin users cannot be deactivated" : "Select the user's status"}
                  variant="filled"
                  disabled={userData?.roles?.[0]?.name === 'store_admin'}
                />
                <FormInput
                  name="password"
                  label="Password"
                  type="password"
                  placeholder="Leave blank to keep current password"
                  helperText="Enter new password (optional)"
                  variant="filled"
                />
              </div>

              {/* Device Permissions Section */}
              <DevicePermissionsWrapper />

              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-indigo-900 mb-2">Update Guidelines</h4>
                <ul className="text-sm text-indigo-700 space-y-1">
                  <li>• Leave password blank to keep the current password</li>
                  <li>• Email must be unique and valid</li>
                  <li>• Role determines user permissions</li>
                  <li>• Auto-logout settings control POS device behavior</li>
                  <li>• Duration is required for time-based logout types</li>
                  <li>• User will receive an email notification of changes</li>
                </ul>
              </div>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserEdit;
