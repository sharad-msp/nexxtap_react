import { useAuthStore } from '@/store/authStore';
export const useAuth = () => {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    adminPermissions,
    login,
    storeLogin,
    switchBackToSuperAdmin,
    logout,
    refreshToken,
    getCurrentUser,
    setUser,
    setToken,
    setAdminPermissions,
    clearAuth,
  } = useAuthStore();

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    adminPermissions,
    login,
    storeLogin,
    switchBackToSuperAdmin,
    logout,
    refreshToken,
    getCurrentUser,
    setUser,
    setToken,
    setAdminPermissions,
    clearAuth,
  };
};
