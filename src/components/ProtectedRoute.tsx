import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  fallbackPath?: string;
  message?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  requiredPermissions = [],
  fallbackPath = '/dashboard',
  message,
}) => {
  const { isAuthenticated } = useAuth();
  const { hasAnyRole, hasAnyPermission, canAccessRoute } = usePermissions();
  const location = useLocation();
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Check permission-based access
  if (requiredPermissions.length > 0 && !hasAnyPermission(requiredPermissions)) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Check route-based access (if no specific roles/permissions provided)
  if (requiredRoles.length === 0 && requiredPermissions.length === 0) {
    if (!canAccessRoute(location.pathname)) {
      return <Navigate to={fallbackPath} replace />;
    }
  }

  return <>{children}</>;
};

// Convenience components for specific roles
export const SystemAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute requiredRoles={['system_admin']} fallbackPath="/dashboard">
    {children}
  </ProtectedRoute>
);

export const StoreAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute requiredRoles={['store_admin']} fallbackPath="/dashboard">
    {children}
  </ProtectedRoute>
);

// System Admin Only Route - redirects system admin to dashboard for non-system routes
export const SystemAdminOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }: { children: React.ReactNode }) => {
  const { isSystemAdmin } = usePermissions();
  
  if (isSystemAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// Convenience components for specific permissions
export const StoreManagementRoute: React.FC<{ children: React.ReactNode }> = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute requiredPermissions={['manageStores']} fallbackPath="/dashboard">
    {children}
  </ProtectedRoute>
);

export const UserManagementRoute: React.FC<{ children: React.ReactNode }> = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute requiredPermissions={['user_view', 'user_list']} fallbackPath="/dashboard" message="You do not have permission to access this page">
    {children}
  </ProtectedRoute>
);

export const ProductManagementRoute: React.FC<{ children: React.ReactNode }> = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute requiredPermissions={['product_view', 'product_list']} fallbackPath="/dashboard">
    {children}
  </ProtectedRoute>
);

export const CategoryManagementRoute: React.FC<{ children: React.ReactNode }> = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute requiredPermissions={['category_view', 'category_list']} fallbackPath="/dashboard">
    {children}
  </ProtectedRoute>
);


export const RoleManagementRoute: React.FC<{ children: React.ReactNode }> = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute requiredPermissions={['role_view', 'role_list']} fallbackPath="/dashboard">
    {children}
  </ProtectedRoute>
);
