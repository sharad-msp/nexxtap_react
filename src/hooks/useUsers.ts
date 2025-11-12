import { useEffect, useRef } from 'react';
import { useUserStore } from '@/store/userStore';

export const useUsers = () => {
  const {
    users,
    roles,
    pagination,
    isLoading,
    fetchUsers,
    fetchUserRoles,
    getUserDetails,
    addOrUpdateUser,
    deleteUser,
    toggleUserStatus,
  } = useUserStore();

  const initializedRef = useRef(false);

  useEffect(() => {
    // Only fetch if not already initialized to prevent duplicate calls
    if (!initializedRef.current && users.length === 0 && roles.length === 0) {
      initializedRef.current = true;
      fetchUsers(1);
      fetchUserRoles();
    }
  }, []); // Remove dependencies to prevent re-runs

  return {
    users,
    roles,
    pagination,
    isLoading,
    fetchUsers,
    fetchUserRoles,
    getUserDetails,
    addOrUpdateUser,
    deleteUser,
    toggleUserStatus,
  };
};
