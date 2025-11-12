import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, User, Mail, Shield, Calendar, Clock, Settings, Activity } from 'lucide-react';
import { Button } from '@/components/Button';
import { useUserStore } from '@/store/userStore';
import { formatDate } from '@/utils/formatDate';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useToast } from '@/components';
import { ViewDetailsSkeleton } from '@/components/Skeleton/ViewDetails';

const UserView: React.FC = () => {
  const { showToast } = useToast();

  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getUserDetails } = useUserStore();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  usePageTitle({ title: 'View User' });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const userData = await getUserDetails(parseInt(id));
        if (userData) {
          setUser(userData);
        } else {
          showToast('error', 'User not found');
          navigate('/users');
        }
      } catch (error) {
        showToast('error', 'Failed to load user data');
        navigate('/users');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [id, getUserDetails, navigate]);

  if (isLoading) {
    return (
      <ViewDetailsSkeleton />
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">User not found</p>
        <Button onClick={() => navigate('/users')} className="mt-4">
          Back to Users
        </Button>
      </div>
    );
  }

  const getRoleNames = (userRoles: any[]) => {
    return userRoles.map(role => role.name).join(', ');
  };

  const getAutoLogoutTypeText = (type: string) => {
    switch (type) {
      case 'per_transaction':
        return 'Per Transaction';
      case 'per_time':
        return 'Per Time Period';
      case 'per_last_activity':
        return 'Per Last Activity';
      default:
        return 'Not Set';
    }
  };

  const getAutoLogoutTypeDescription = (type: string) => {
    switch (type) {
      case 'per_transaction':
        return 'User will be logged out after each completed transaction';
      case 'per_time':
        return 'User will be logged out after the specified time period';
      case 'per_last_activity':
        return 'User will be logged out after the specified period of inactivity';
      default:
        return 'Auto-logout is not configured';
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      if (remainingMinutes === 0) {
        return `${hours} hour${hours !== 1 ? 's' : ''}`;
      } else {
        return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
      }
    }
  };

  const isPosUser = user.roles?.some((role: any) => role.name === 'pos');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/users')}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
        </div>
        {!(user.is_store_admin === true || user.is_store_admin === 1) && (
          <Button
            onClick={() => navigate(`/users/edit/${user.id}`)}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit User
          </Button>
        )}
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
        <p className="text-gray-600">User Details</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Information</h3>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <User className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Name</p>
                    <p className="text-gray-900">{user.name}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-gray-900">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Roles</p>
                    <p className="text-gray-900">{getRoleNames(user.roles)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status & Profile</h3>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.status === true || user.status === 1 || user.status_text === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {user.status_text || (user.status === true || user.status === 1 ? 'Active' : 'Inactive')}
                  </span>
                </div>

                {user.profile_image && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Profile Image</p>
                    <img
                      src={user.profile_image}
                      alt={user.name}
                      className="h-20 w-20 rounded-full object-cover border-2 border-gray-200"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Device Permissions Section - Only show for POS users */}
      {isPosUser && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Device Permissions</h3>
              <p className="text-sm text-gray-600">Auto-logout and device management settings</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Auto-Logout Status</p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.auto_logout_enabled
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {user.auto_logout_enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>

              {user.auto_logout_enabled && (
                <>
                  <div className="flex items-start space-x-3">
                    <Activity className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Auto-Logout Type</p>
                      <p className="text-gray-900">{getAutoLogoutTypeText(user.auto_logout_type)}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {getAutoLogoutTypeDescription(user.auto_logout_type)}
                      </p>
                    </div>
                  </div>

                  {user.auto_logout_type && user.auto_logout_type !== 'per_transaction' && user.auto_logout_duration && (
                    <div className="flex items-start space-x-3">
                      <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Duration</p>
                        <p className="text-gray-900">{formatDuration(user.auto_logout_duration)}</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="space-y-4">
              {user.last_activity_at && (
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Last Activity</p>
                    <p className="text-gray-900">{formatDate(user.last_activity_at)}</p>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Auto-logout behavior explanation */}
          {user.auto_logout_enabled && user.auto_logout_type && (
            <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
              <h4 className="text-sm font-medium text-indigo-900 mb-2">Auto-Logout Behavior</h4>
              <p className="text-sm text-indigo-700">
                {getAutoLogoutTypeDescription(user.auto_logout_type)}
                {user.auto_logout_type !== 'per_transaction' && user.auto_logout_duration && (
                  <span> The duration is set to {formatDuration(user.auto_logout_duration)}.</span>
                )}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Account Information Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Account Information</h3>
            <p className="text-sm text-gray-600">Account creation and update details</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Created At</p>
                <p className="text-gray-900">{formatDate(user.created_at)}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Last Updated</p>
                <p className="text-gray-900">{formatDate(user.updated_at)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserView;
