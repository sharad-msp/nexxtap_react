import { useAuth } from '@/hooks/useAuth';
import {
  hasRole,
  hasAnyRole,
  hasPermission,
  hasAnyPermission,
  canAccessMenuItem,
  getAccessibleMenuItems,
  isSystemAdmin,
  isStoreAdmin,
  isStoreAdminWithSuperAdmin,
  getUserPrimaryRole,
  canAccessRoute,
  getUserStoreId,
  // User permissions
  canViewUsers,
  canListUsers,
  canCreateUsers,
  canUpdateUsers,
  canChangeUserStatus,
  // Role permissions
  canViewRoles,
  canListRoles,
  canCreateRoles,
  canUpdateRoles,
  canDeleteRoles,
  // Category permissions
  canViewCategories,
  canListCategories,
  canCreateCategories,
  canUpdateCategories,
  canDeleteCategories,
  // Attribute permissions
  canViewAttributes,
  canListAttributes,
  canCreateAttributes,
  canUpdateAttributes,
  canDeleteAttributes,
  // Product permissions
  canViewProducts,
  canListProducts,
  canCreateProducts,
  canUpdateProducts,
  canDeleteProducts,
  // Order permissions
  canViewOrders,
  canListOrders,
  // Tax permissions
  canViewTaxes,
  canListTaxes,
  canCreateTaxes,
  canUpdateTaxes,
  canDeleteTaxes,
  canChangeTaxStatus,
  // Discount permissions
  canViewDiscounts,
  canListDiscounts,
  canCreateDiscounts,
  canUpdateDiscounts,
  canDeleteDiscounts,
  canChangeDiscountStatus,
  // Settings permissions
  canViewSettings,
  canUpdateSettings,
  // Printer permissions
  canViewPrinters,
  canListPrinters,
  canCreatePrinters,
  canUpdatePrinters,
  canDeletePrinters,
  canChangePrinterStatus,
  type MenuItem,
} from '@/utils/permissions';

export const usePermissions = () => {
  const { user, adminPermissions } = useAuth();

  return {
    // User role checks
    hasRole: (role: string) => hasRole(user, role),
    hasAnyRole: (roles: string[]) => hasAnyRole(user, roles),
    isSystemAdmin: () => isSystemAdmin(user),
    isStoreAdmin: () => isStoreAdmin(user),
    isStoreAdminWithSuperAdmin: () => isStoreAdminWithSuperAdmin(user),
    getUserPrimaryRole: () => getUserPrimaryRole(user),
    
    // Permission checks
    hasPermission: (permission: string) => hasPermission(user, permission),
    hasAnyPermission: (permissions: string[]) => hasAnyPermission(user, permissions),
    
    // Menu and route access
    canAccessMenuItem: (menuItem: MenuItem) => canAccessMenuItem(user, menuItem),
    getAccessibleMenuItems: () => getAccessibleMenuItems(user),
    canAccessRoute: (route: string) => canAccessRoute(user, route),
    
    // User data
    getUserStoreId: () => getUserStoreId(user),
    
    // Admin permissions
    adminPermissions,
    
    // Current user
    user,

    // User Management Permissions
    canViewUsers: () => canViewUsers(user),
    canListUsers: () => canListUsers(user),
    canCreateUsers: () => canCreateUsers(user),
    canUpdateUsers: () => canUpdateUsers(user),
    canChangeUserStatus: () => canChangeUserStatus(user),

    // Role Management Permissions
    canViewRoles: () => canViewRoles(user),
    canListRoles: () => canListRoles(user),
    canCreateRoles: () => canCreateRoles(user),
    canUpdateRoles: () => canUpdateRoles(user),
    canDeleteRoles: () => canDeleteRoles(user),

    // Category Management Permissions
    canViewCategories: () => canViewCategories(user),
    canListCategories: () => canListCategories(user),
    canCreateCategories: () => canCreateCategories(user),
    canUpdateCategories: () => canUpdateCategories(user),
    canDeleteCategories: () => canDeleteCategories(user),

    // Attribute Management Permissions
    canViewAttributes: () => canViewAttributes(user),
    canListAttributes: () => canListAttributes(user),
    canCreateAttributes: () => canCreateAttributes(user),
    canUpdateAttributes: () => canUpdateAttributes(user),
    canDeleteAttributes: () => canDeleteAttributes(user),

    // Product Management Permissions
    canViewProducts: () => canViewProducts(user),
    canListProducts: () => canListProducts(user),
    canCreateProducts: () => canCreateProducts(user),
    canUpdateProducts: () => canUpdateProducts(user),
    canDeleteProducts: () => canDeleteProducts(user),
    
    // Order Management Permissions
    canViewOrders: () => canViewOrders(user),
    canListOrders: () => canListOrders(user),

    // Tax Management Permissions
    canViewTaxes: () => canViewTaxes(user),
    canListTaxes: () => canListTaxes(user),
    canCreateTaxes: () => canCreateTaxes(user),
    canUpdateTaxes: () => canUpdateTaxes(user),
    canDeleteTaxes: () => canDeleteTaxes(user),
    canChangeTaxStatus: () => canChangeTaxStatus(user),

    // Discount Management Permissions
    canViewDiscounts: () => canViewDiscounts(user),
    canListDiscounts: () => canListDiscounts(user),
    canCreateDiscounts: () => canCreateDiscounts(user),
    canUpdateDiscounts: () => canUpdateDiscounts(user),
    canDeleteDiscounts: () => canDeleteDiscounts(user),
    canChangeDiscountStatus: () => canChangeDiscountStatus(user),

    // Settings Management Permissions
    canViewSettings: () => canViewSettings(user),
    canUpdateSettings: () => canUpdateSettings(user),

    // Printer Management Permissions
    canViewPrinters: () => canViewPrinters(user),
    canListPrinters: () => canListPrinters(user),
    canCreatePrinters: () => canCreatePrinters(user),
    canUpdatePrinters: () => canUpdatePrinters(user),
    canDeletePrinters: () => canDeletePrinters(user),
    canChangePrinterStatus: () => canChangePrinterStatus(user),
  };
};
