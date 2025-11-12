import type { AuthUser } from '@/types/auth.types';

export interface Permission {
  name: string;
  roles: string[];
  requiredPermissions?: string[];
}

export interface MenuItem {
  name: string;
  href: string;
  icon: any;
  roles: string[];
  permissions?: string[];
  children?: MenuItem[];
}

// Define menu items with permission-based access
export const menuItems: MenuItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: 'Home',
    roles: [],
  },
  {
    name: 'Store Management',
    href: '/stores',
    icon: 'Store',
    roles: ['system_admin'],
    permissions: ['manageStores'],
  },
  {
    name: 'User Management',
    href: '/users',
    icon: 'Users',
    roles: [],
    permissions: ['user_view', 'user_list'],
  },
  {
    name: 'Role Management',
    href: '/roles',
    icon: 'Shield',
    roles: [],
    permissions: ['role_view', 'role_list'],
  },
  {
    name: 'Category Management',
    href: '/categories',
    icon: 'Tag',
    roles: [],
    permissions: ['category_view', 'category_list'],
  },
  {
    name: 'Product Management',
    href: '/products',
    icon: 'Package',
    roles: [],
    permissions: ['product_view', 'product_list'],
  },
  {
    name: 'Order Management',
    href: '/orders',
    icon: 'ShoppingCart',
    roles: [],
    permissions: ['order_view', 'order_list'],
  },
  {
    name: 'Discount Management',
    href: '/product-discounts',
    icon: 'Percent', // Use 'Percent' icon for discounts
    roles: [],
    permissions: ['discount_view', 'discount_list'],
  },
  {
    name: 'Tax Management',
    href: '/taxes',
    icon: 'Calculator', // Use 'Calculator' icon for taxes (like the calculator icon set)
    roles: [],
    permissions: ['tax_view', 'tax_list'],
  },
  {
    name: 'Print Templates',
    href: '/print-templates',
    icon: 'FileText', // Use 'FileText' icon for print templates
    roles: ['system_admin'],
    permissions: ['managePrintTemplates'],
  },
  {
    name: 'Printer Management',
    href: '/printers',
    icon: 'Printer',
    roles: [],
    permissions: ['settings_view'],
  },
  {
    name: 'Attribute Management',
    href: '/attributes',
    icon: 'Settings',
    roles: [],
    permissions: ['attribute_view', 'attribute_list'],
  },
  // {
  //   name: 'WebSocket Test',
  //   href: '/websocket-test',
  //   icon: 'Wifi', // Use 'Wifi' icon for WebSocket testing
  //   roles: [], // Available to all authenticated users
  // }
  // {
  //   name: 'Report Management',
  //   href: '/reports',
  //   icon: 'Report',
  //   roles: [],
  //   permissions: ['report_view', 'report_export'],
  // },
  // {
  //   name: 'Settings Management',
  //   href: '/settings',
  //   icon: 'Settings',
  //   roles: [],
  //   permissions: ['settings_view', 'settings_update'],
  // },
];

// Check if user has specific role
export const hasRole = (user: AuthUser | null, role: string): boolean => {
  if (!user || !user.roles) return false;
  return user.roles.includes(role);
};

// Check if user has any of the specified roles
export const hasAnyRole = (user: AuthUser | null, roles: string[]): boolean => {
  if (!user || !user.roles) return false;
  return user.roles.some((role: string) => roles.includes(role));
};

// Check if user has specific permission
export const hasPermission = (user: AuthUser | null, permission: string): boolean => {
  if (!user || !user.permissions) return false;
  return user.permissions.includes(permission);
};

// Check if user has any of the specified permissions
export const hasAnyPermission = (user: AuthUser | null, permissions: string[]): boolean => {
  if (!user || !user.permissions) return false;
  return user.permissions.some((permission: string) => permissions.includes(permission));
};

// Check if user can access a menu item
export const canAccessMenuItem = (user: AuthUser | null, menuItem: MenuItem): boolean => {
  if (!user) return false;

  // For system admin, show Dashboard, Store Management, and Print Templates
  if (isSystemAdmin(user)) {
    return menuItem.name === 'Dashboard' || menuItem.name === 'Store Management' || menuItem.name === 'Print Templates';
  }

  // For Store Management module, only system_admin can access
  if (menuItem.name === 'Store Management') {
    return false;
  }

  // For Print Templates module, only system_admin can access
  if (menuItem.name === 'Print Templates') {
    return false;
  }

  // WebSocket Test is available to all authenticated users
  if (menuItem.name === 'WebSocket Test') {
    return true;
  }

  // For all other modules, check permissions only
  if (menuItem.permissions && menuItem.permissions.length > 0) {
    return hasAnyPermission(user, menuItem.permissions);
  }

  // If no permissions specified, allow access
  return true;
};

// Get accessible menu items for user
export const getAccessibleMenuItems = (user: AuthUser | null): MenuItem[] => {
  if (!user) return [];
  return menuItems.filter(menuItem => canAccessMenuItem(user, menuItem));
};

// Check if user is system admin
export const isSystemAdmin = (user: AuthUser | null): boolean => {
  return hasRole(user, 'system_admin');
};

// Check if user is store admin
export const isStoreAdmin = (user: AuthUser | null): boolean => {
  return hasRole(user, 'store_admin');
};

// Check if user is a store admin with original superadmin info (switched from superadmin)
export const isStoreAdminWithSuperAdmin = (user: AuthUser | null): boolean => {
  return isStoreAdmin(user) && user?.original_superadmin_id !== undefined && user?.original_superadmin_id !== null;
};

// Get user's primary role
export const getUserPrimaryRole = (user: AuthUser | null): string | null => {
  if (!user || !user.roles || user.roles.length === 0) return null;
  
  if (user.roles.includes('system_admin')) return 'system_admin';
  if (user.roles.includes('store_admin')) return 'store_admin';
  
  return user.roles[0];
};

// Check if user can access a specific route
export const canAccessRoute = (user: AuthUser | null, route: string): boolean => {
  const menuItem = menuItems.find(item => item.href === route);
  if (!menuItem) return false;
  return canAccessMenuItem(user, menuItem);
};

// Get user's store ID
export const getUserStoreId = (user: AuthUser | null): number | null => {
  if (!user) return null;
  return user.store_id || null;
};

// Simple permission helper functions
// User Management Permissions
export const canViewUsers = (user: AuthUser | null): boolean => {
  return hasPermission(user, 'user_view');
};

// User Management Permissions
export const canListUsers = (user: AuthUser | null): boolean => {
  return hasPermission(user, 'user_list');
};

// User Management Permissions
export const canCreateUsers = (user: AuthUser | null): boolean => {
  return hasPermission(user, 'user_create');
};

// User Management Permissions
export const canUpdateUsers = (user: AuthUser | null): boolean => {
  return hasPermission(user, 'user_update');
};

// User Management Permissions
export const canDeleteUsers = (user: AuthUser | null): boolean => {
  return hasPermission(user, 'user_delete');
};

// User Management Permissions
export const canChangeUserStatus = (user: AuthUser | null): boolean => {
  return hasPermission(user, 'user_status');
};

// Role Management Permissions
export const canViewRoles = (user: AuthUser | null): boolean => {
  return hasPermission(user, 'role_view');
};

// Role Management Permissions
export const canListRoles = (user: AuthUser | null): boolean => {
  return hasPermission(user, 'role_list');
};

// Role Management Permissions
export const canCreateRoles = (user: AuthUser | null): boolean => {
  return hasPermission(user, 'role_create');
};

// Role Management Permissions
export const canUpdateRoles = (user: AuthUser | null): boolean => {
  return hasPermission(user, 'role_update');
};

// Role Management Permissions
export const canDeleteRoles = (user: AuthUser | null): boolean => {
  return hasPermission(user, 'role_delete');
};

// Category Management Permissions
export const canViewCategories = (user: AuthUser | null): boolean => {
  return hasPermission(user, 'category_view');
};

// Category Management Permissions
export const canListCategories = (user: AuthUser | null): boolean => {
  return hasPermission(user, 'category_list');
};

// Category Management Permissions
export const canCreateCategories = (user: AuthUser | null): boolean => {
  return hasPermission(user, 'category_create');
};

// Category Management Permissions
export const canUpdateCategories = (user: AuthUser | null): boolean => {
  return hasPermission(user, 'category_update');
};

export const canDeleteCategories = (user: AuthUser | null): boolean => {
  return hasPermission(user, 'category_delete');
};

// Attribute Management Permissions
export const canViewAttributes = (user: AuthUser | null): boolean => {
  return hasPermission(user, 'attribute_view');
};

export const canListAttributes = (user: AuthUser | null): boolean => {
  return hasPermission(user, 'attribute_list');
};

export const canCreateAttributes = (user: AuthUser | null): boolean => {
  return hasPermission(user, 'attribute_create');
};

export const canUpdateAttributes = (user: AuthUser | null): boolean => {
  return hasPermission(user, 'attribute_update');
};

export const canDeleteAttributes = (user: AuthUser | null): boolean => {
  return hasPermission(user, 'attribute_delete');
};

// Product Management Permissions
export const canViewProducts = (user: AuthUser | null): boolean => {
  return hasPermission(user, 'product_view');
};

export const canListProducts = (user: AuthUser | null): boolean => {
  return hasPermission(user, 'product_list');
};

export const canCreateProducts = (user: AuthUser | null): boolean => {
  return hasPermission(user, 'product_create');
};

export const canUpdateProducts = (user: AuthUser | null): boolean => {
  return hasPermission(user, 'product_update');
};

export const canDeleteProducts = (user: AuthUser | null): boolean => {
  return hasPermission(user, 'product_delete');
};

export const canViewOrders = (user: AuthUser | null): boolean => {
  return hasPermission(user, 'order_view');
};

export const canListOrders = (user: AuthUser | null): boolean => {
  return hasPermission(user, 'order_list');
};

// Tax Management Permissions
export const canViewTaxes = (user: AuthUser | null): boolean => {
  return hasPermission(user, 'tax_view');
};

export const canListTaxes = (user: AuthUser | null): boolean => {
  return hasPermission(user, 'tax_list');
};

export const canCreateTaxes = (user: AuthUser | null): boolean => {
  return hasPermission(user, 'tax_create');
};

export const canUpdateTaxes = (user: AuthUser | null): boolean => {
  return hasPermission(user, 'tax_update');
};

export const canDeleteTaxes = (user: AuthUser | null): boolean => {
  return hasPermission(user, 'tax_delete');
};

export const canChangeTaxStatus = (user: AuthUser | null): boolean => {
  return hasPermission(user, 'tax_status');
};

// Discount Management Permissions
export const canViewDiscounts = (user: AuthUser | null): boolean => {
  return hasPermission(user, 'discount_view');
};

export const canListDiscounts = (user: AuthUser | null): boolean => {
  return hasPermission(user, 'discount_list');
};

export const canCreateDiscounts = (user: AuthUser | null): boolean => {
  return hasPermission(user, 'discount_create');
};

export const canUpdateDiscounts = (user: AuthUser | null): boolean => {
  return hasPermission(user, 'discount_update');
};

export const canDeleteDiscounts = (user: AuthUser | null): boolean => {
  return hasPermission(user, 'discount_delete');
};

export const canChangeDiscountStatus = (user: AuthUser | null): boolean => {
  return hasPermission(user, 'discount_status');
};

// Settings Management Permissions
export const canViewSettings = (user: AuthUser | null): boolean => {
  return hasPermission(user, 'settings_view');
};

export const canUpdateSettings = (user: AuthUser | null): boolean => {
  return hasPermission(user, 'settings_update');
};

// Printer Management Permissions
export const canViewPrinters = (user: AuthUser | null): boolean => {
  return hasPermission(user, 'settings_view');
};

export const canListPrinters = (user: AuthUser | null): boolean => {
  return hasPermission(user, 'settings_view');
};

export const canCreatePrinters = (user: AuthUser | null): boolean => {
  return hasPermission(user, 'settings_view');
};

export const canUpdatePrinters = (user: AuthUser | null): boolean => {
  return hasPermission(user, 'settings_view');
};

export const canDeletePrinters = (user: AuthUser | null): boolean => {
  return hasPermission(user, 'settings_view');
};

export const canChangePrinterStatus = (user: AuthUser | null): boolean => {
  return hasPermission(user, 'settings_view');
};
