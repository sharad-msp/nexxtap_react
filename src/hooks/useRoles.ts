import { useEffect, useRef } from 'react';
import { useRoleStore } from '@/store/roleStore';

export function useRoles() {
  const {
    roles,
    permissions,
    pagination,
    isLoading,
    fetchRoles,
    fetchPermissions,
    getRoleDetails,
    addOrUpdateRole,
    deleteRole,
    toggleRoleStatus,
  } = useRoleStore();

  const initializedRef = useRef(false);

  useEffect(() => {
    // Only fetch if not already initialized to prevent duplicate calls
    if (!initializedRef.current && roles.length === 0 && permissions.length === 0) {
      initializedRef.current = true;
      fetchRoles(1);
      fetchPermissions();
    }
  }, []); // Remove dependencies to prevent re-runs

  return {
    roles,
    permissions,
    pagination,
    isLoading,
    fetchRoles,
    fetchPermissions,
    getRoleDetails,
    addOrUpdateRole,
    deleteRole,
    toggleRoleStatus,
  };
}
