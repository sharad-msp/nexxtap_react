import React, { useEffect, useRef } from 'react';
import { FormInput, FormSelect, FormCheckbox, useForm } from '@/components';

interface DevicePermissionsSectionProps {
  className?: string;
  userRole?: string;
}

export const DevicePermissionsSection: React.FC<DevicePermissionsSectionProps> = ({ className, userRole }) => {
  const { values, setValue, clearErrors } = useForm();
  
  const isAutoLogoutEnabled = values.auto_logout_enabled;
  const autoLogoutType = values.auto_logout_type;
  const showDurationField = isAutoLogoutEnabled && (autoLogoutType === 'per_time' || autoLogoutType === 'per_last_activity');

  // Use refs to track previous values to prevent infinite loops
  const prevAutoLogoutEnabled = useRef(isAutoLogoutEnabled);
  const prevAutoLogoutType = useRef(autoLogoutType);

  // Clear dependent field values when auto-logout is disabled
  useEffect(() => {
    if (prevAutoLogoutEnabled.current !== isAutoLogoutEnabled && !isAutoLogoutEnabled) {
      setValue('auto_logout_type', '');
      setValue('auto_logout_duration', '');
      clearErrors();
    }
    prevAutoLogoutEnabled.current = isAutoLogoutEnabled;
  }, [isAutoLogoutEnabled, setValue, clearErrors]);

  // Clear duration field when auto-logout type changes to per_transaction
  useEffect(() => {
    if (prevAutoLogoutType.current !== autoLogoutType && autoLogoutType === 'per_transaction') {
      setValue('auto_logout_duration', '');
    }
    prevAutoLogoutType.current = autoLogoutType;
  }, [autoLogoutType, setValue]);

  // Only show device permissions for 'pos' role
  if (userRole !== 'pos') {
    return null;
  }

  return (
    <div className={`border-t border-gray-200 pt-6 ${className || ''}`}>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Device Permissions</h3>
      
      <div className="space-y-4">
        <FormCheckbox
          name="auto_logout_enabled"
          label="Enable Auto-Logout"
          helperText="Enable automatic logout functionality for this user"
        />

        {isAutoLogoutEnabled && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FormSelect
              name="auto_logout_type"
              label="Auto-Logout Type"
              placeholder="Select logout type"
              options={[
                { value: 'per_transaction', label: 'Per Transaction' },
                { value: 'per_time', label: 'Per Time Period' },
                { value: 'per_last_activity', label: 'Per Last Activity' }
              ]}
              helperText="Choose when the user should be auto-logged out"
              variant="filled"
              required
            />

            {showDurationField && (
              <FormInput
                name="auto_logout_duration"
                label="Auto-Logout Duration (minutes)"
                type="number"
                placeholder="Enter duration in minutes"
                helperText="Duration in minutes (1-1440)"
                variant="filled"
                required
                min="1"
                max="1440"
              />
            )}
          </div>
        )}

        {/* Information panel for auto-logout types */}
        {isAutoLogoutEnabled && autoLogoutType && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-indigo-900 mb-2">Auto-Logout Behavior</h4>
            <div className="text-sm text-indigo-700">
              {autoLogoutType === 'per_transaction' && (
                <p>User will be automatically logged out after each completed transaction/order.</p>
              )}
              {autoLogoutType === 'per_time' && (
                <p>User will be automatically logged out after the specified time period, regardless of activity.</p>
              )}
              {autoLogoutType === 'per_last_activity' && (
                <p>User will be automatically logged out after the specified time period of inactivity.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DevicePermissionsSection;
